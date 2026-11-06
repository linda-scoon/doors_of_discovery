#!/usr/bin/env node
/**
 * One-off migration: find hard-coded API keys under src/, move them into .env,
 * and rewrite the code to read them from `environment`.
 *
 * Dry run by default - prints what it would do and changes nothing.
 * Pass --write to apply.
 *
 *     node scripts/extract-keys.js
 *     node scripts/extract-keys.js --write
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');
const envDir = path.join(srcDir, 'environments');
const WRITE = process.argv.includes('--write');

/* ------------------------------------------------------------------ utils */

// The report prints NO key material by default, so it is safe to paste
// anywhere. --show-masked adds a first-3/last-2 hint if you need to tell two
// keys in the same file apart.
const SHOW_MASKED = process.argv.includes('--show-masked');
const describe = (v) =>
  SHOW_MASKED
    ? v.slice(0, 3) + '…' + v.slice(-2) + ' (' + v.length + ' chars)'
    : '(' + v.length + ' chars, hidden)';

/** giphyApiKey -> GIPHY_API_KEY */
const screamingSnake = (name) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .toUpperCase()
    .replace(/^_+|_+$/g, '');

/** GIPHY_API_KEY -> giphyApiKey */
const camel = (name) =>
  name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((p, i) => (i === 0 ? p : p[0].toUpperCase() + p.slice(1)))
    .join('');

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.ts')) acc.push(full);
  }
  return acc;
}

/**
 * Find every string literal in a TS source, tracking comments so we do not
 * match inside them. Returns {start, end, quote, content} with start/end being
 * the indexes of the opening and closing quote characters.
 */
function findStringLiterals(text) {
  const out = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    const next = text[i + 1];
    if (c === '/' && next === '/') {
      const nl = text.indexOf('\n', i);
      i = nl === -1 ? text.length : nl;
      continue;
    }
    if (c === '/' && next === '*') {
      const close = text.indexOf('*/', i + 2);
      i = close === -1 ? text.length : close + 2;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      const start = i;
      i += 1;
      let depth = 0;
      while (i < text.length) {
        const ch = text[i];
        if (ch === '\\') { i += 2; continue; }
        if (c === '`' && ch === '$' && text[i + 1] === '{') { depth += 1; i += 2; continue; }
        if (c === '`' && depth > 0 && ch === '}') { depth -= 1; i += 1; continue; }
        if (ch === c && depth === 0) break;
        if (c !== '`' && ch === '\n') break; // unterminated - bail out
        i += 1;
      }
      if (text[i] === c) {
        out.push({ start, end: i, quote: c, content: text.slice(start + 1, i) });
      }
      i += 1;
      continue;
    }
    i += 1;
  }
  return out;
}

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

/* -------------------------------------------------------------- detection */

// A property or variable whose NAME says it holds a credential.
const SECRET_NAME = /(api[_-]?key|apikey|access[_-]?key|secret|token|client[_-]?id|app[_-]?id|auth)/i;
// A credential passed as a URL query parameter.
const URL_PARAM = /[?&](api[_-]?key|apikey|key|token|access_token|client_id|app_id|auth)=([A-Za-z0-9._~-]{8,})/gi;
// Values that match a secret-ish name but are plainly not secrets.
const NOT_SECRET = /^(true|false|null|undefined|production|development||https?:\/\/[^\s]*)$/i;

const findings = []; // {file, line, value, envName, kind}
const byValue = new Map(); // value -> envName (dedupe: one var per distinct key)

function register(file, line, value, preferredName) {
  if (byValue.has(value)) {
    findings.push({ file, line, value, envName: byValue.get(value), kind: 'repeat' });
    return byValue.get(value);
  }
  let envName = screamingSnake(preferredName);
  const taken = new Set([...byValue.values()]);
  if (taken.has(envName)) {
    let n = 2;
    while (taken.has(envName + '_' + n)) n += 1;
    envName = envName + '_' + n;
  }
  byValue.set(value, envName);
  findings.push({ file, line, value, envName, kind: 'new' });
  return envName;
}

/** Turn gifs.service.ts / gif-room into a prefix like GIFS. */
function prefixFor(file) {
  const base = path.basename(file).replace(/\.(service|component)?\.?ts$/, '');
  return screamingSnake(base.replace(/[.-]/g, '_'));
}

/* ---------------------------------------------------- pass 1: environment */

const envFiles = fs.existsSync(envDir)
  ? fs.readdirSync(envDir).filter((f) => /^environment.*\.ts$/.test(f)).map((f) => path.join(envDir, f))
  : [];

for (const file of envFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const re = /(\w+)\s*:\s*(['"`])([^'"`]*)\2/g;
  let m;
  while ((m = re.exec(text))) {
    const [, name, , value] = m;
    if (name === 'production' || NOT_SECRET.test(value)) continue;
    register(file, lineOf(text, m.index), value, name);
  }
}

/* ------------------------------------------------ pass 2: everything else */

const otherFiles = fs.existsSync(srcDir)
  ? walk(srcDir).filter((f) => !envFiles.includes(f) && !f.endsWith('.spec.ts'))
  : [];

const planned = new Map(); // file -> Set of secret values found in it

for (const file of otherFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const literals = findStringLiterals(text);
  const hits = new Set();

  for (const lit of literals) {
    // (a) whole literal assigned to a credential-ish name
    const before = text.slice(Math.max(0, lit.start - 80), lit.start);
    // Handles  apiKey: 'x'  |  'X-RapidAPI-Key': 'x'  |  .set('x-api-key', 'x')
    const nameMatch = before.match(/['"]?([\w-]+)['"]?\s*[:=,]\s*$/);
    if (nameMatch && SECRET_NAME.test(nameMatch[1]) && !NOT_SECRET.test(lit.content)) {
      let base = nameMatch[1];
      // Names like 'key', 'X-RapidAPI-Key' or 'x-api-key' say nothing about
      // WHICH service they belong to, so prefix them with the file's name and
      // reduce the vendor noise to a plain suffix.
      if (/^[\w-]*(api)?[_-]?(key|token|secret|auth)$/i.test(base)) {
        const suffix = /token/i.test(base) ? 'TOKEN'
          : /secret/i.test(base) ? 'SECRET'
          : /auth/i.test(base) ? 'AUTH'
          : 'API_KEY';
        base = prefixFor(file) + '_' + suffix;
      }
      register(file, lineOf(text, lit.start), lit.content, base);
      hits.add(lit.content);
      continue;
    }
    // (b) credential embedded in a URL inside the literal
    URL_PARAM.lastIndex = 0;
    let um;
    while ((um = URL_PARAM.exec(lit.content))) {
      const value = um[2];
      if (NOT_SECRET.test(value)) continue;
      register(file, lineOf(text, lit.start), value, prefixFor(file) + '_' + um[1]);
      hits.add(value);
    }
  }
  if (hits.size) planned.set(file, hits);
}

/* -------------------------------------------------------------- rewriting */

function importPathFor(file) {
  let rel = path
    .relative(path.dirname(file), path.join(envDir, 'environment'))
    .replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

function rewrite(file, values) {
  let text = fs.readFileSync(file, 'utf8');
  // Rewrite from the end so earlier offsets stay valid.
  const literals = findStringLiterals(text).sort((a, b) => b.start - a.start);

  for (const lit of literals) {
    const present = [...values].filter((v) => lit.content.includes(v));
    if (!present.length) continue;

    const whole = present.find((v) => v === lit.content);
    if (whole) {
      const expr = 'environment.' + camel(byValue.get(whole));
      text = text.slice(0, lit.start) + expr + text.slice(lit.end + 1);
      continue;
    }
    // Secret sits inside a longer string: emit a template literal.
    let content = lit.content;
    if (lit.quote !== '`') {
      content = content.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
    }
    for (const v of present) {
      content = content.split(v).join('${environment.' + camel(byValue.get(v)) + '}');
    }
    text = text.slice(0, lit.start) + '`' + content + '`' + text.slice(lit.end + 1);
  }

  if (!/from\s+['"][^'"]*environments\/environment['"]/.test(text)) {
    const importLine =
      "import { environment } from '" + importPathFor(file) + "';\n";
    const imports = [...text.matchAll(/^import .*?;[ \t]*$/gm)];
    if (imports.length) {
      const last = imports[imports.length - 1];
      const at = last.index + last[0].length;
      text = text.slice(0, at) + '\n' + importLine.trimEnd() + text.slice(at);
    } else {
      text = importLine + text;
    }
  }
  fs.writeFileSync(file, text);
}

/* ---------------------------------------------------------------- report */

if (!findings.length) {
  console.log('\n  No hard-coded keys found under src/. Nothing to do.\n');
  process.exit(0);
}

console.log('\n  Found ' + byValue.size + ' distinct key(s) in ' +
  new Set(findings.map((f) => f.file)).size + ' file(s):\n');
for (const f of findings) {
  console.log(
    '    ' + path.relative(root, f.file).replace(/\\/g, '/') + ':' + f.line +
    '\n        ' + f.envName + ' = ' + describe(f.value) +
    (f.kind === 'repeat' ? '   (same key again)' : '')
  );
}

if (!WRITE) {
  console.log(
    '\n  Dry run - nothing changed.\n' +
    '  Re-run with --write to create .env and update these files.\n'
  );
  process.exit(0);
}

/* ------------------------------------------------------------------ apply */

const envLines = ['# Local API keys. Never commit this file.', ''];
for (const [value, name] of byValue) envLines.push(name + '=' + value);
fs.writeFileSync(path.join(root, '.env'), envLines.join('\n') + '\n');

const exampleLines = ['# Copy to .env and fill in your own keys.', ''];
for (const name of byValue.values()) exampleLines.push(name + '=');
fs.writeFileSync(path.join(root, '.env.example'), exampleLines.join('\n') + '\n');

for (const [file, values] of planned) rewrite(file, values);

// environment.ts / environment.prod.ts become generated files.
for (const file of envFiles) fs.rmSync(file);

const gitignorePath = path.join(root, '.gitignore');
const ignoreEntries = [
  '.env',
  '/src/environments/environment.ts',
  '/src/environments/environment.prod.ts',
];
let gitignore = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
const toAdd = ignoreEntries.filter(
  (e) => !gitignore.split(/\r?\n/).some((l) => l.trim() === e)
);
if (toAdd.length) {
  if (gitignore && !gitignore.endsWith('\n')) gitignore += '\n';
  gitignore += '\n# Local API keys and the environment files generated from them\n' +
    toAdd.join('\n') + '\n';
  fs.writeFileSync(gitignorePath, gitignore);
}

// Wire the generator into npm start / build / test.
const pkgPath = path.join(root, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.scripts = pkg.scripts || {};
  const wire = {
    start: 'ng serve',
    build: 'ng build',
    test: 'ng test',
    watch: 'ng build --watch --configuration development',
  };
  for (const [name, cmd] of Object.entries(wire)) {
    const current = pkg.scripts[name] || cmd;
    if (!current.includes('set-env')) {
      pkg.scripts[name] = 'node scripts/set-env.js && ' + current;
    }
  }
  pkg.scripts['config'] = pkg.scripts['config'] || 'node scripts/set-env.js';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

console.log(
  '\n  Wrote .env (' + byValue.size + ' keys) and .env.example' +
  '\n  Rewrote ' + planned.size + ' source file(s) to use environment.*' +
  '\n  Deleted the old environment.ts / environment.prod.ts (now generated)' +
  '\n  Updated .gitignore and package.json scripts' +
  '\n\n  Next:  node scripts/set-env.js  &&  npm start\n'
);
