#!/usr/bin/env node
/**
 * Prépare un badge de certification pour la page « À propos ».
 *
 * Le champ `logo:` des fichiers de `src/content/certifications/` attend une image
 * **carrée** servie depuis `public/`. Les visuels récupérés chez les éditeurs ont
 * des ratios et des marges très variables : ce script les normalise pour que la
 * grille reste alignée quel que soit le badge.
 *
 * Traitement appliqué :
 *   1. chargement depuis un fichier local ou une URL ;
 *   2. détourage des marges transparentes/solides ;
 *   3. centrage dans un carré transparent (l'image n'est jamais déformée) ;
 *   4. redimensionnement à la taille cible + compression PNG.
 *
 * Usage :
 *   node scripts/optimize-certification-badge.mjs <source> [--name <slug>] [--size 224] [--no-trim]
 *
 * Exemples :
 *   node scripts/optimize-certification-badge.mjs ~/telechargements/badge.png --name aws-saa
 *   node scripts/optimize-certification-badge.mjs https://exemple.tld/badge.png --name cka
 *
 * La source peut être un fichier local (chemin) ou une URL http(s).
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

/** 4× la taille d'affichage (56 px) → net sur les écrans Retina et 3x. */
const DEFAULT_SIZE = 224;

const OUT_DIR = 'public/images/certifications';

function usage(message) {
  if (message) console.error(`\n  ✖ ${message}\n`);
  console.error(
    [
      'Usage : node scripts/optimize-certification-badge.mjs <source> [options]',
      '',
      '  <source>        Fichier local ou URL http(s)',
      '  --name <slug>   Nom du fichier produit (défaut : nom de la source)',
      '  --size <px>     Côté du carré en pixels (défaut : 224)',
      '  --no-trim       Conserve les marges de la source (pas de détourage)',
      '',
    ].join('\n')
  );
  process.exit(1);
}

// ---------------------------------------------------------------- arguments

const argv = process.argv.slice(2);
if (argv.length === 0) usage();

const source = argv[0];
if (source.startsWith('--')) usage('la source doit être le premier argument');

/** Récupère la valeur de l'option `nom`, ou `undefined`. */
function option(nom) {
  const index = argv.indexOf(nom);
  return index === -1 ? undefined : argv[index + 1];
}

const size = Number(option('--size') ?? DEFAULT_SIZE);
if (!Number.isInteger(size) || size < 32 || size > 1024) {
  usage('--size doit être un entier entre 32 et 1024');
}

const doTrim = !argv.includes('--no-trim');

const slug =
  option('--name') ??
  path
    .basename(source)
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

if (!slug) usage('impossible de déduire un nom de fichier, utilisez --name');

// ------------------------------------------------------------------ lecture

async function load(cible) {
  if (/^https?:\/\//i.test(cible)) {
    const response = await fetch(cible, {
      headers: { 'User-Agent': 'walidblog-certification-badge/1.0' },
    });
    if (!response.ok) {
      usage(`téléchargement impossible : HTTP ${response.status} sur ${cible}`);
    }
    return Buffer.from(await response.arrayBuffer());
  }
  try {
    return await readFile(cible);
  } catch {
    return usage(`fichier introuvable : ${cible}`);
  }
}

const input = await load(source);

const meta = await sharp(input).metadata();
console.log(`\n  source : ${source}`);
console.log(`  format : ${meta.format} — ${meta.width}×${meta.height} px`);
console.log(`  détourage : ${doTrim ? 'oui' : 'non'}`);

if ((meta.width ?? 0) < size || (meta.height ?? 0) < size) {
  console.warn(
    `  ⚠ source plus petite que la cible (${size}×${size}) : le rendu sera agrandi donc un peu flou.\n` +
      `    Privilégiez le badge d'origine fourni par l'éditeur (résolution la plus élevée).`
  );
}

// ---------------------------------------------------------------- traitement

let pipeline = sharp(input);

if (doTrim) {
  try {
    pipeline = sharp(await pipeline.trim({ threshold: 10 }).toBuffer());
  } catch {
    console.warn('  ⚠ détourage impossible (image sans bord uniforme) — conservée telle quelle');
    pipeline = sharp(input);
  }
}

const output = await pipeline
  .resize(size, size, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    withoutEnlargement: false,
  })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toBuffer();

await mkdir(OUT_DIR, { recursive: true });
const destination = path.join(OUT_DIR, `${slug}.png`);
await writeFile(destination, output);

const poids = (octets) => `${(octets / 1024).toFixed(1)} Ko`;

console.log(`  sortie : ${destination} — ${size}×${size} px, ${poids(output.length)}`);
console.log(
  `\n  Frontmatter :\n    logo: '/${destination.replace(/^public\//, '')}'\n` +
    `    logoAlt: 'Badge <nom de la certification>'\n` +
    `\n  Pensez à noter la provenance de l'image (source et licence) pour la traçabilité.\n`
);
