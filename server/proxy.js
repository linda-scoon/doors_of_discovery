/**
 * Turns an entry from apis.js into an Express request handler.
 *
 * The handler is the whole point of the backend: it adds the API key on the
 * server, where the browser cannot see it, and passes the upstream's answer
 * back. Because a good answer passes through untouched, the Angular rooms
 * only had to change the URL they call.
 *
 * What the browser may send is narrow on purpose. Path and query values are
 * checked against what each api declares before anything is sent upstream,
 * so a request cannot steer the server at another endpoint with our key on
 * it, and cannot get round the cache by adding junk to the address.
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

/**
 * The most answers kept at once. Enough for every page of every list, with
 * room over; past it the oldest is dropped, so a stream of odd requests
 * cannot grow the cache until the server runs out of memory.
 */
const MAX_CACHED = 1_000;

/** key -> { expiresAt, body } */
const cache = new Map();

/** A value is never "." or "..", which a URL would read as a step up a path. */
const DOTS = /^\.{1,2}$/;

/**
 * The checked values from the request: each declared path parameter, and
 * each declared query parameter that was given. Throws, with a message safe
 * to show, on anything out of bounds.
 */
function readParams(api, req) {
  const path = {};
  for (const name of api.pathParams || []) {
    const value = req.params[name];
    const pattern = api.pathParamPatterns?.[name];
    if (value === undefined || DOTS.test(value) || (pattern && !pattern.test(value))) {
      throw new Error(`"${name}" is not in the expected form`);
    }
    path[name] = value;
  }

  // Only whole numbers in the range the api allows, and on its step if it
  // has one, so the browser can ask for page 12 but cannot rewrite the
  // request or make up pages that only cost quota.
  const query = {};
  for (const [name, { min, max, step = 1 }] of Object.entries(api.queryParams || {})) {
    const raw = req.query[name];
    if (raw === undefined) continue;

    const value = Number(raw);
    if (!Number.isInteger(value) || value < min || value > max || (value - min) % step) {
      throw new Error(`"${name}" must be a whole number from ${min} to ${max}`);
    }
    query[name] = value;
  }
  return { path, query };
}

function buildUpstreamUrl(api, { path, query }) {
  let url = api.url;
  for (const [name, value] of Object.entries(path)) {
    url = url.replace(`:${name}`, encodeURIComponent(value));
  }

  const parsed = new URL(url);
  for (const [name, value] of Object.entries(query)) {
    parsed.searchParams.set(name, String(value));
  }
  if (api.auth.style === AuthStyle.QUERY_PARAM) {
    parsed.searchParams.set(api.auth.paramName, process.env[api.auth.keyName]);
  }
  return parsed;
}

function buildUpstreamHeaders(api, upstreamUrl) {
  const headers = { ...(api.headers || {}) };

  if (api.auth.style === AuthStyle.HEADER) {
    return { ...headers, [api.auth.headerName]: process.env[api.auth.keyName] };
  }
  if (api.auth.style !== AuthStyle.RAPIDAPI_HEADER) return headers;

  return {
    ...headers,
    // RapidAPI routes on the host header, which is always the url's own host.
    'X-RapidAPI-Host': upstreamUrl.hostname,
    'X-RapidAPI-Key': process.env[api.auth.keyName],
  };
}

/**
 * Caching instructions for browsers and a CDN. A list kept here may be kept
 * there too, for as long; anything random, and every error, must not be,
 * or every visitor would get the same one.
 */
function setCacheHeaders(res, api) {
  res.set(
    'Cache-Control',
    api.cacheSeconds ? `public, max-age=60, s-maxage=${api.cacheSeconds}` : 'no-store'
  );
}

function remember(key, body, seconds) {
  if (cache.size >= MAX_CACHED) cache.delete(cache.keys().next().value);
  cache.set(key, { expiresAt: Date.now() + seconds * 1000, body });
}

function fail(res, status, message) {
  res.set('Cache-Control', 'no-store');
  return res.status(status).json({ error: message });
}

function createHandler(api) {
  return async function handleApiRequest(req, res) {
    const needsKey = api.auth.style !== AuthStyle.NONE;
    if (needsKey && !process.env[api.auth.keyName]) {
      // Deliberately names the variable but never a value, so this is safe to
      // read in a log or show in a browser.
      return fail(res, 503, `This room is not configured: ${api.auth.keyName} is not set.`);
    }

    let params;
    try {
      params = readParams(api, req);
    } catch (error) {
      return fail(res, 400, error.message);
    }

    // Built from the checked values only, never the raw address, so extra
    // junk in the query cannot force a fresh upstream call.
    const cacheKey = JSON.stringify([api.id, params.path, params.query]);
    const cached = api.cacheSeconds ? cache.get(cacheKey) : undefined;
    if (cached && cached.expiresAt > Date.now()) {
      setCacheHeaders(res, api);
      res.set('X-Cache', 'hit');
      return res.json(cached.body);
    }

    try {
      const upstreamUrl = buildUpstreamUrl(api, params);
      const upstream = await fetch(upstreamUrl, {
        headers: buildUpstreamHeaders(api, upstreamUrl),
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      });

      if (!upstream.ok) {
        // Not passed on: an upstream's error page is its business, and it is
        // safest never to repeat anything about a request we made with a key.
        console.error(`[${api.id}] upstream answered ${upstream.status}`);
        return fail(res, 502, 'The upstream API refused the request.');
      }

      const body = await upstream.json();
      if (api.cacheSeconds) remember(cacheKey, body, api.cacheSeconds);

      setCacheHeaders(res, api);
      res.set('X-Cache', 'miss');
      return res.json(body);
    } catch (error) {
      // Never pass the error through verbatim: it can contain the request we
      // sent, key included.
      console.error(`[${api.id}] upstream request failed:`, error.name);
      return fail(res, 502, 'The upstream API did not respond.');
    }
  };
}

module.exports = { createHandler, readParams, MAX_CACHED };
