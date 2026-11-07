#!/usr/bin/env node
/**
 * Builds the site after `npm install`, so a host that installs and then
 * starts the server ends up with something to serve.
 *
 * Hostinger's Express preset has no build step: it installs dependencies and
 * runs server/index.js. Without this, dist/ never existed there and every
 * page was missing. Running the build from postinstall puts it inside the
 * one step the host does run.
 *
 * If the Angular CLI is not installed -- an install that left out
 * devDependencies -- this says so and steps aside rather than failing the
 * install; the server then explains that the site was not built. If the CLI
 * is there and the build fails, the install fails with it, so a broken
 * build shows up in the deploy log instead of as a blank site.
 *
 * Set SKIP_BUILD=1 to install without building.
 */
const { spawnSync } = require('child_process');

if (process.env.SKIP_BUILD) {
  console.log('postinstall: SKIP_BUILD is set, not building.');
  process.exit(0);
}

let ng;
try {
  ng = require.resolve('@angular/cli/bin/ng.js');
} catch {
  console.warn(
    'postinstall: the Angular CLI is not installed, so the site was not built.\n' +
      '  Install devDependencies too, or run `npm run build` before starting the server.'
  );
  process.exit(0);
}

const result = spawnSync(process.execPath, [ng, 'build'], {
  stdio: 'inherit',
  // Never stop to ask about analytics on a machine with nobody at it.
  env: { ...process.env, NG_CLI_ANALYTICS: 'false' },
});

process.exit(result.status ?? 1);
