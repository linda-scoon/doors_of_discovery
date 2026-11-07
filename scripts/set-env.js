#!/usr/bin/env node
/**
 * Generates src/environments/environment.ts and environment.prod.ts.
 *
 * The browser has no process.env, so Angular cannot read configuration at
 * runtime. This runs at build time instead: npm start / build / test / watch
 * all call it first.
 *
 * Values are looked up in two places, in this order:
 *
 *   1. .env           - a developer's machine. Gitignored, never committed.
 *   2. process.env    - a build host such as Hostinger, or CI. There is no
 *                       .env file there, because it is gitignored, so the
 *                       keys arrive as real environment variables set in the
 *                       host's control panel.
 *
 * Which keys exist is defined by .env.example, so adding a key to the project
 * means adding one line there and nothing else.
 *
 * A missing key is a warning, not an error: it breaks one room at runtime,
 * and failing the build would take the whole site down for it.
 *
 * Both generated files are gitignored. Only .env.example is committed.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const envFile = path.join(root, '.env');
const exampleFile = path.join(root, '.env.example');
const outDir = path.join(root, 'src', 'environments');

/** Minimal .env parser: KEY=value, # comments, optional quotes, optional `export `. */
function parseEnvFile(text) {
  const values = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separator = line.indexOf('=');
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim().replace(/^export\s+/, '');
    let value = line.slice(separator + 1).trim();

    const isQuoted =
      value.length > 1 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")));
    if (isQuoted) value = value.slice(1, -1);

    if (key) values[key] = value;
  }
  return values;
}

function readIfPresent(file) {
  return fs.existsSync(file) ? parseEnvFile(fs.readFileSync(file, 'utf8')) : {};
}

/** RAPID_API_KEY -> rapidApiKey */
function toCamelCase(name) {
  return name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((part, i) => (i === 0 ? part : part[0].toUpperCase() + part.slice(1)))
    .join('');
}

const fromEnvFile = readIfPresent(envFile);
const expectedKeys = Object.keys(readIfPresent(exampleFile));

// .env.example lists what the app expects, but respect anything extra someone
// has put in their own .env rather than silently dropping it.
const keys = [...new Set([...expectedKeys, ...Object.keys(fromEnvFile)])];

if (keys.length === 0) {
  console.error(
    '\n  No keys found. Expected .env.example to list them, at ' + exampleFile + '\n'
  );
  process.exit(1);
}

const resolved = {};
const missing = [];
let usedProcessEnv = false;

for (const key of keys) {
  const value = fromEnvFile[key] || process.env[key] || '';
  if (!value) {
    missing.push(key);
  } else if (!fromEnvFile[key]) {
    usedProcessEnv = true;
  }
  resolved[key] = value;
}

function render(isProduction) {
  const properties = keys.map(
    // JSON.stringify handles quoting and escaping correctly.
    (key) => '  ' + toCamelCase(key) + ': ' + JSON.stringify(resolved[key]) + ','
  );
  return [
    '// GENERATED FILE - do not edit, and do not commit.',
    '// Written by scripts/set-env.js from .env or the environment.',
    'export const environment = {',
    '  production: ' + isProduction + ',',
    ...properties,
    '};',
    '',
  ].join('\n');
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'environment.ts'), render(false));
fs.writeFileSync(path.join(outDir, 'environment.prod.ts'), render(true));

const source = fs.existsSync(envFile)
  ? usedProcessEnv
    ? '.env plus environment variables'
    : '.env'
  : 'environment variables';

console.log(
  '  Wrote src/environments/environment.ts and environment.prod.ts (' +
    keys.length +
    ' key' +
    (keys.length === 1 ? '' : 's') +
    ' from ' +
    source +
    ')'
);

if (missing.length) {
  console.warn(
    '\n  WARNING: no value for ' +
      missing.join(', ') +
      '\n  The build will succeed, but the rooms using ' +
      (missing.length === 1 ? 'it' : 'them') +
      ' will not load data.' +
      '\n  Set ' +
      (missing.length === 1 ? 'it' : 'them') +
      ' in .env locally, or in your host\'s environment variables.\n'
  );
}
