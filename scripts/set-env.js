#!/usr/bin/env node
/**
 * Generates src/environments/environment.ts and environment.prod.ts from .env.
 *
 * The browser has no process.env, so Angular cannot read .env at runtime.
 * This runs at build time instead: npm start / npm run build call it first.
 *
 * Both generated files are gitignored. .env is gitignored. Only .env.example
 * is committed.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const envFile = path.join(root, '.env');
const outDir = path.join(root, 'src', 'environments');

/** Minimal .env parser: KEY=value, # comments, optional quotes, optional `export `. */
function parseEnv(text) {
  const out = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    let key = line.slice(0, eq).trim().replace(/^export\s+/, '');
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length > 1) ||
      (value.startsWith("'") && value.endsWith("'") && value.length > 1)
    ) {
      value = value.slice(1, -1);
    }
    if (key) out[key] = value;
  }
  return out;
}

/** GIPHY_API_KEY -> giphyApiKey */
function camel(name) {
  return name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((part, i) => (i === 0 ? part : part[0].toUpperCase() + part.slice(1)))
    .join('');
}

if (!fs.existsSync(envFile)) {
  console.error(
    '\n  No .env file found at ' + envFile + '\n\n' +
    '  Copy .env.example to .env and fill in your keys:\n' +
    '      cp .env.example .env\n'
  );
  process.exit(1);
}

const vars = parseEnv(fs.readFileSync(envFile, 'utf8'));
const names = Object.keys(vars);

const missing = names.filter((n) => vars[n] === '');
if (missing.length) {
  console.warn('  Warning: these .env entries are empty: ' + missing.join(', '));
}

function render(isProd) {
  const lines = names.map((n) => {
    // JSON.stringify escapes quotes and backslashes correctly.
    return '  ' + camel(n) + ': ' + JSON.stringify(vars[n]) + ',';
  });
  return (
    '// GENERATED FILE - do not edit, and do not commit.\n' +
    '// Written by scripts/set-env.js from .env. Add new keys to .env.\n' +
    'export const environment = {\n' +
    '  production: ' + isProd + ',\n' +
    lines.join('\n') +
    (lines.length ? '\n' : '') +
    '};\n'
  );
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'environment.ts'), render(false));
fs.writeFileSync(path.join(outDir, 'environment.prod.ts'), render(true));

console.log(
  '  Wrote src/environments/environment.ts and environment.prod.ts (' +
    names.length +
    ' key' + (names.length === 1 ? '' : 's') + ' from .env)'
);
