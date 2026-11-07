/**
 * Loads .env into process.env, if there is one.
 *
 * On a developer's machine the keys live in .env. On a host such as Hostinger
 * there is no .env file — it is gitignored — and the keys are set as real
 * environment variables in the control panel instead. Both work, and a real
 * environment variable wins, so a host's configuration is never overridden by
 * a stray file.
 *
 * Deliberately dependency-free: this is twenty lines, and it runs before
 * anything else in the process.
 */
const fs = require('fs');
const path = require('path');

function loadEnvFile(file = path.resolve(__dirname, '..', '.env')) {
  if (!fs.existsSync(file)) return;

  for (const rawLine of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
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

    // Anything already in the environment was set deliberately by the host.
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

module.exports = { loadEnvFile };
