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
 * It also keeps itself safe to leave on the public internet -- security
 * headers, a per-visitor limit on /api; see security.js -- and tells a CDN
 * exactly what it may cache.
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
const { handleStories } = require('./plugs');
const {
  contentSecurityPolicy,
  inlineScriptHashes,
  rateLimit,
  securityHeaders,
} = require('./security');

loadEnvFile();

const app = express();
const port = process.env.PORT || 3000;
const browserBuildDir = path.resolve(__dirname, '..', 'dist');
const indexFile = path.join(browserBuildDir, 'index.html');

// Nobody needs to be told what the server runs on.
app.disable('x-powered-by');

/*
 * Requests arrive through the host's proxy, and through a CDN when that is
 * on. Trusting only proxies on private and local addresses means a
 * visitor's address is the one the last public hop reported, which they
 * cannot forge by sending their own X-Forwarded-For. With a CDN, that is the
 * CDN node's address. TRUST_PROXY overrides it if the host needs otherwise.
 */
app.set('trust proxy', process.env.TRUST_PROXY || 'loopback, linklocal, uniquelocal');

app.use(securityHeaders);

/** Requests per minute one visitor may make to /api. */
const API_LIMIT = Number(process.env.API_RATE_LIMIT) || 240;
app.use('/api', rateLimit({ limit: API_LIMIT }));

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

// The site owner's own stories, for the books room to recommend; see plugs.js.
app.get('/api/silverfoot', handleStories);

// Pictures fetched on the browser's behalf; see images.js.
for (const source of imageSources) {
  app.get(`/api/images/${source.id}/:imageId`, createImageHandler(source));
}

/**
 * Reports which rooms are usable, so a misconfigured deploy is obvious
 * without reading logs. Names variables, never values.
 */
app.get('/api/health', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  const configured = {};
  for (const api of apis) {
    configured[api.id] =
      !api.auth.keyName || Boolean(process.env[api.auth.keyName]);
  }
  res.json({ ok: true, built: isBuilt(), rooms: configured });
});

// An /api address that is not a room is a mistake, not a page.
app.use('/api', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.status(404).json({ error: 'There is no such room.' });
});

/*
 * How long browsers and a CDN may keep each kind of file.
 *
 *   - The scripts and styles have a fingerprint in their names, which
 *     changes whenever they do, so they can be kept for a year.
 *   - The page itself, and the service worker's files, must be checked
 *     every time, or a deploy would not reach anyone until the cache
 *     expired.
 *   - Everything else -- icons, lettering, sounds -- for a week.
 */
// main-EZHG4BLR.js, chunk-BE-nQdEx.js, styles-TYU6QRRS.css.
const FINGERPRINTED = /^(main|polyfills|styles|chunk)-[\w-]{8}\.(js|css)$/;
const ALWAYS_CHECK = new Set([
  'index.html',
  'ngsw.json',
  'ngsw-worker.js',
  'safety-worker.js',
  'worker-basic.min.js',
  'manifest.webmanifest',
]);

app.use(
  express.static(browserBuildDir, {
    index: false,
    setHeaders(res, filePath) {
      const name = path.basename(filePath);
      if (FINGERPRINTED.test(name)) {
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (ALWAYS_CHECK.has(name)) {
        res.set('Cache-Control', 'no-cache');
      } else {
        res.set('Cache-Control', 'public, max-age=604800');
      }
    },
  })
);

/*
 * The page, with its Content Security Policy. Worked out once from the
 * built page, and again if the page changes, since it allows the page's own
 * inline script by its fingerprint.
 */
let policy = { mtime: 0, header: '' };
function pagePolicy() {
  const mtime = fs.statSync(indexFile).mtimeMs;
  if (mtime !== policy.mtime) {
    policy = { mtime, header: contentSecurityPolicy(inlineScriptHashes(indexFile)) };
  }
  return policy.header;
}

// Anything else without a file extension is an Angular route, so hand back
// the app and let the client router deal with it. A missing file -- an old
// script after a deploy, say -- is a 404, not the page: a CDN that stored
// the page under a script's name would break the site until it expired.
app.get(/.*/, (req, res) => {
  if (path.extname(req.path)) {
    res.set('Cache-Control', 'no-store');
    return res.status(404).type('text/plain').send('Not found.\n');
  }
  if (!isBuilt()) {
    res.set('Cache-Control', 'no-store');
    return res.status(503).type('text/plain').send(NOT_BUILT);
  }
  res.set('Cache-Control', 'no-cache');
  res.set('Content-Security-Policy', pagePolicy());
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
