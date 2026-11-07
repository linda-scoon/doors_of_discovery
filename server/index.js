/**
 * The server for doors.purplefootsteps.co.uk.
 *
 * It does two jobs:
 *
 *   1. Proxies each room's API, adding the key here rather than in the
 *      browser. This is the whole reason it exists — an Angular bundle is
 *      downloadable, so any key compiled into it is public.
 *
 *   2. Serves the built Angular app, with a fallback to index.html so the
 *      client-side routes survive a refresh.
 *
 * Run it with `npm run serve:api` locally, or `npm run serve:prod` to serve
 * the production build the way the host does.
 */
const fs = require('fs');
const path = require('path');
const express = require('express');

const { loadEnvFile } = require('./load-env');
const { apis } = require('./apis');
const { createHandler } = require('./proxy');
const { imageSources, createImageHandler } = require('./images');

loadEnvFile();

const app = express();
const port = process.env.PORT || 3000;
const browserBuildDir = path.resolve(__dirname, '..', 'dist');
const indexFile = path.join(browserBuildDir, 'index.html');

/**
 * Whether `npm run build` has run. The server only serves what the build
 * produced, so without it /api works and every page is missing -- which is
 * what a host does if it starts the server but skips the build step.
 */
const isBuilt = () => fs.existsSync(indexFile);

const NOT_BUILT =
  'The doors have not been built yet.\n\n' +
  'The server is running, but dist/ is missing, so there is nothing to show. ' +
  'Run `npm run build` before starting the server -- on the host, set the ' +
  'build script to `build` and redeploy.\n';

// One route per API, built from the config table rather than written by hand,
// so adding a room is a one-entry change in apis.js.
for (const api of apis) {
  // An api that declares pathParams takes them as trailing route segments,
  // so { id: 'videos/trailer', pathParams: ['movieId'] } serves
  // /api/videos/trailer/:movieId.
  const segments = [`/api/${api.id}`, ...(api.pathParams || []).map((p) => `:${p}`)];
  app.get(segments.join('/'), createHandler(api));
}

// Pictures fetched on the browser's behalf; see images.js.
for (const source of imageSources) {
  app.get(`/api/images/${source.id}/:imageId`, createImageHandler(source));
}

/**
 * Reports which rooms are usable, so a misconfigured deploy is obvious
 * without reading logs. Names variables, never values.
 */
app.get('/api/health', (_req, res) => {
  const configured = {};
  for (const api of apis) {
    configured[api.id] =
      !api.auth.keyName || Boolean(process.env[api.auth.keyName]);
  }
  res.json({ ok: true, built: isBuilt(), rooms: configured });
});

app.use(express.static(browserBuildDir));

// Anything not matched above is an Angular route, so hand back the app and
// let the client router deal with it. Without this, refreshing on a deep link
// returns 404.
app.get(/.*/, (_req, res) => {
  if (!isBuilt()) {
    res.status(503).type('text/plain').send(NOT_BUILT);
    return;
  }
  res.sendFile(indexFile);
});

// Only listen when run directly, so tests can import the app without binding
// a port.
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
    console.log(`Serving the app from ${browserBuildDir}`);

    if (!isBuilt()) {
      console.warn(`\n  WARNING: ${indexFile} does not exist. Run \`npm run build\`.\n`);
    }

    const missing = apis
      .filter((api) => api.auth.keyName && !process.env[api.auth.keyName])
      .map((api) => api.auth.keyName);

    if (missing.length) {
      console.warn(
        `\n  WARNING: not set: ${[...new Set(missing)].join(', ')}` +
          `\n  Those rooms will return 503 until the values are provided,` +
          `\n  in .env locally or in the host's environment variables.\n`
      );
    }
  });
}

module.exports = app;
