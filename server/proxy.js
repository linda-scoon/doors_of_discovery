/**
 * Turns an entry from apis.js into an Express request handler.
 *
 * The handler is the whole point of the backend: it adds the API key on the
 * server, where the browser cannot see it, and returns the upstream response
 * unchanged. Because the response passes through untouched, the Angular
 * services only had to change the URL they call.
 */
const { AuthStyle } = require('./apis');

/*
 * Responses are not reused unless an api asks for it with cacheSeconds.
 *
 * Any number of doors open onto the same kind of room now, and each should
 * find something different: a cached random fact is the same fact behind
 * every fact door for as long as it is kept. Caching is for the APIs that
 * return a list for the room to pick from -- the list can be kept, and the
 * pick still differs -- or that would otherwise run out of quota.
 */

/** How long to wait for an upstream before giving up. */
const UPSTREAM_TIMEOUT_MS = 8_000;

/** id -> { expiresAt, status, body } */
const cache = new Map();

/**
 * Fills :named segments in an api's url from the request's route parameters.
 * Only the names the api declares in pathParams are substituted, so a request
 * cannot steer us at a different upstream path.
 */
function buildUpstreamUrl(api, req) {
  let url = api.url;

  for (const name of api.pathParams || []) {
    const value = req.params[name];
    if (value === undefined) {
      throw new Error(`Missing route parameter "${name}"`);
    }
    url = url.replace(`:${name}`, encodeURIComponent(value));
  }

  const parsed = new URL(url);

  // Only whole numbers in the range the api allows, so the browser can ask
  // for page 12 but cannot rewrite the request.
  for (const [name, { min, max }] of Object.entries(api.queryParams || {})) {
    const raw = req.query[name];
    if (raw === undefined) continue;

    const value = Number(raw);
    if (!Number.isInteger(value) || value < min || value > max) {
      throw new Error(`"${name}" must be a whole number from ${min} to ${max}`);
    }
    parsed.searchParams.set(name, String(value));
  }

  if (api.auth.style === AuthStyle.QUERY_PARAM) {
    parsed.searchParams.set(api.auth.paramName, process.env[api.auth.keyName]);
  }

  return parsed;
}

function buildUpstreamHeaders(api, upstreamUrl) {
  if (api.auth.style !== AuthStyle.RAPIDAPI_HEADER) return {};

  return {
    // RapidAPI routes on the host header, which is always the url's own host.
    'X-RapidAPI-Host': upstreamUrl.hostname,
    'X-RapidAPI-Key': process.env[api.auth.keyName],
  };
}

function createHandler(api) {
  return async function handleApiRequest(req, res) {
    const needsKey = api.auth.style !== AuthStyle.NONE;
    if (needsKey && !process.env[api.auth.keyName]) {
      // Deliberately names the variable but never a value, so this is safe to
      // read in a log or show in a browser.
      return res.status(503).json({
        error: `This room is not configured: ${api.auth.keyName} is not set.`,
      });
    }

    // Nor should the browser keep it, or reopening a door shows what it
    // showed last time.
    if (!api.cacheSeconds) res.set('Cache-Control', 'no-store');

    const cacheKey = req.originalUrl;
    const cached = api.cacheSeconds ? cache.get(cacheKey) : undefined;
    if (cached && cached.expiresAt > Date.now()) {
      res.set('X-Cache', 'hit');
      return res.status(cached.status).json(cached.body);
    }

    let upstreamUrl;
    try {
      upstreamUrl = buildUpstreamUrl(api, req);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    try {
      const upstream = await fetch(upstreamUrl, {
        headers: buildUpstreamHeaders(api, upstreamUrl),
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      });

      const body = await upstream.json();

      if (upstream.ok && api.cacheSeconds) {
        cache.set(cacheKey, {
          expiresAt: Date.now() + api.cacheSeconds * 1000,
          status: upstream.status,
          body,
        });
      }

      res.set('X-Cache', 'miss');
      return res.status(upstream.status).json(body);
    } catch (error) {
      // Never pass the upstream error through verbatim: it can contain the
      // request we sent, key included.
      console.error(`[${api.id}] upstream request failed:`, error.message);
      return res.status(502).json({ error: 'The upstream API did not respond.' });
    }
  };
}

module.exports = { createHandler };
