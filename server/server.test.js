/**
 * Tests for the server: what it lets through to the APIs, what it caches,
 * what it tells a CDN, and how it holds up to misuse. The upstream APIs are
 * replaced with a fake, so nothing here leaves the machine.
 *
 *     npm run test:server
 */
const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

process.env.TMDB_API_KEY = 'test-tmdb-key';
process.env.GIFS_API_KEY = 'test-gifs-key';
process.env.PEXELS_API_KEY = 'test-pexels-key';
process.env.API_RATE_LIMIT = '1000';

const realFetch = globalThis.fetch;
const app = require('./index');

let server;
let base;
/** Every request the server made upstream, as URLs. */
let upstreamCalls;
/** What the fake upstream answers with. */
let upstreamReply;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.closeAllConnections();
  server.close();
});

beforeEach(() => {
  upstreamCalls = [];
  upstreamReply = () => new Response(JSON.stringify({ ok: true }), { status: 200 });
  globalThis.fetch = async (url, init) => {
    upstreamCalls.push({ url: String(url), headers: init?.headers ?? {} });
    return upstreamReply(String(url));
  };
});

const get = (path, headers) => realFetch(base + path, { headers });

/**
 * A request sent exactly as written. fetch tidies "%2E%2E" away before it
 * leaves, as a browser would; someone attacking the server would not.
 */
function getRaw(path) {
  const http = require('node:http');
  return new Promise((resolve, reject) => {
    http
      .get({ host: '127.0.0.1', port: server.address().port, path }, (res) => {
        res.resume();
        resolve(res.statusCode);
      })
      .on('error', reject);
  });
}

test('a path value cannot walk up the upstream API with our key on it', async () => {
  assert.equal(await getRaw('/api/videos/trailer/%2E%2E'), 400);
  assert.equal(await getRaw('/api/videos/trailer/..%2F..%2Fconfiguration'), 400);
  assert.equal(upstreamCalls.length, 0);
});

test('a path value must look like what the API expects', async () => {
  assert.equal((await get('/api/videos/trailer/12x')).status, 400);
  assert.equal((await get('/api/onthisday/13/01')).status, 400);
  assert.equal((await get('/api/wikipedia/ab')).status, 400);
  assert.equal(upstreamCalls.length, 0);

  assert.equal((await get('/api/videos/trailer/550')).status, 200);
  assert.match(upstreamCalls[0].url, /\/movie\/550\/videos/);
});

test('a query number must be in range and on its step', async () => {
  assert.equal((await get('/api/gifs?offset=7')).status, 400);
  assert.equal((await get('/api/gifs?offset=500')).status, 400);
  assert.equal((await get('/api/gifs?offset=50')).status, 200);
});

test('junk in the address cannot get round the cache', async () => {
  await get('/api/quotes?x=1');
  await get('/api/quotes?x=2');
  await get('/api/quotes');
  assert.equal(upstreamCalls.length, 1);
});

test('random answers are never cached, by us or by a CDN', async () => {
  const first = await get('/api/jokes');
  await get('/api/jokes');
  assert.equal(upstreamCalls.length, 2);
  assert.equal(first.headers.get('cache-control'), 'no-store');
});

test('a list may be cached by a CDN for as long as we keep it', async () => {
  const res = await get('/api/trivia');
  assert.equal(res.headers.get('cache-control'), 'public, max-age=60, s-maxage=300');
});

test('an upstream error is not passed on, and is not cached', async () => {
  upstreamReply = () =>
    new Response(JSON.stringify({ message: 'bad key test-pexels-key' }), { status: 401 });
  const res = await get('/api/photos?page=3');
  const body = await res.text();

  assert.equal(res.status, 502);
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.ok(!body.includes('test-pexels-key'));
});

test('keys go upstream, in the way each API wants, and never back', async () => {
  const res = await get('/api/photos?page=1');
  assert.equal(upstreamCalls[0].headers.Authorization, 'test-pexels-key');
  assert.ok(!(await res.text()).includes('test-pexels-key'));
});

test('the page carries a security policy that allows its own inline script', async () => {
  const res = await get('/');
  if (res.status === 503) return; // Not built; nothing to check.

  const policy = res.headers.get('content-security-policy');
  assert.match(policy, /default-src 'self'/);
  assert.match(policy, /script-src 'self' 'sha256-/);
  assert.match(policy, /frame-ancestors 'self'/);
  assert.equal(res.headers.get('x-frame-options'), 'SAMEORIGIN');
  assert.equal(res.headers.get('cache-control'), 'no-cache');
  assert.equal(res.headers.get('x-powered-by'), null);
});

test('a missing file is a 404, not the page under the wrong name', async () => {
  const res = await get('/main.0123456789abcdef.js');
  assert.equal(res.status, 404);
  assert.equal(res.headers.get('cache-control'), 'no-store');
});

test('an /api address that is not a room is a 404', async () => {
  assert.equal((await get('/api/nothing-here')).status, 404);
});

test('one visitor is slowed down after too many requests', async () => {
  const { rateLimit } = require('./security');
  const limit = rateLimit({ limit: 3 });
  const outcomes = [];
  for (let i = 0; i < 5; i += 1) {
    const res = {
      headers: {},
      set(name, value) { this.headers[name] = value; return this; },
      status(code) { outcomes.push(code); return this; },
      json() { return this; },
    };
    limit({ ip: '203.0.113.9' }, res, () => outcomes.push(200));
  }
  assert.deepEqual(outcomes, [200, 200, 200, 429, 429]);
});

test('a visitor cannot dodge the limit by forging where they came from', async () => {
  // Trusting only private and local proxies, the address used is the one
  // the last public hop reported, not whatever the visitor claims.
  const res = await get('/api/health', { 'X-Forwarded-For': '1.2.3.4' });
  assert.equal(res.status, 200);
  assert.equal(app.get('trust proxy fn')('127.0.0.1', 0), true);
  assert.equal(app.get('trust proxy fn')('1.2.3.4', 0), false);
});
