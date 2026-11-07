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

test('books are only fetched on the subjects the room knows', async () => {
  assert.equal((await get('/api/books/dragons?offset=50')).status, 200);
  assert.match(upstreamCalls[0].url, /openlibrary\.org\/subjects\/dragons\.json/);
  assert.equal((await get('/api/books/anything-else')).status, 400);
  assert.equal((await get('/api/books/dragons?offset=25')).status, 400);
});

test('the owner\'s stories are read from the sitemap and each page\'s tags', async () => {
  upstreamReply = (url) => {
    const pages = {
      'https://silverfootfalls.com/sitemap.xml':
        '<sitemapindex><sitemap><loc>https://silverfootfalls.com/sitemaps/stories-1.xml</loc></sitemap></sitemapindex>',
      'https://silverfootfalls.com/sitemaps/stories-1.xml':
        '<urlset><url><loc>https://silverfootfalls.com/story/well-then</loc></url>' +
        '<url><loc>https://silverfootfalls.com/read/abc</loc></url>' +
        '<url><loc>https://elsewhere.example/story/x</loc></url></urlset>',
      'https://silverfootfalls.com/story/well-then':
        '<meta property="og:title" content="Well Then"/>' +
        '<meta property="og:description" content="Clara&#x27;s marriage&hellip;"/>' +
        '<img src="/covers/well_then.webp">',
    };
    return new Response(pages[url] ?? 'missing', { status: pages[url] ? 200 : 404 });
  };

  const res = await get('/api/silverfoot');
  const { stories } = await res.json();

  assert.equal(stories.length, 1);
  assert.deepEqual(stories[0], {
    title: 'Well Then',
    description: "Clara's marriage…",
    url: 'https://silverfootfalls.com/story/well-then',
    cover: 'https://silverfootfalls.com/covers/well_then.webp',
  });
  // Only story pages on the owner's own site are ever fetched.
  assert.ok(upstreamCalls.every((call) => call.url.startsWith('https://silverfootfalls.com/')));
  assert.ok(!upstreamCalls.some((call) => call.url.includes('/read/')));
});

test('a chapter comes only from the books on our list, cut into chapters', async () => {
  const chapter = (n) => `CHAPTER ${n}.\n\nThe ${n} Part\n\n${'Words and more words. '.repeat(100)}\n\n`;
  upstreamReply = () =>
    new Response(
      'Header\r\n*** START OF THE PROJECT GUTENBERG EBOOK X ***\r\nContents\n\nCHAPTER I.\nCHAPTER II.\nCHAPTER III.\n\n' +
        `A preface. ${'More preface. '.repeat(150)}\n\n` +
        `${chapter('I')}${chapter('II')}${chapter('III')}*** END OF THE PROJECT GUTENBERG EBOOK X ***\nLicence`,
      { status: 200 }
    );

  const response = await get('/api/chapter/11');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const body = await response.json();
  assert.equal(body.title, "Alice's Adventures in Wonderland");
  // The chapter's name joins its number, and the contents page and the
  // preface after it are never served as a chapter.
  assert.match(body.heading, /^CHAPTER (I|II|III): The (I|II|III) Part$/);
  assert.ok(!body.paragraphs.join(' ').includes('preface'));
  assert.ok(body.paragraphs.length > 0);
  assert.ok(!body.paragraphs.join(' ').includes('Licence'));
  assert.match(upstreamCalls[0].url, /^https:\/\/www\.gutenberg\.org\/cache\/epub\/11\/pg11\.txt$/);

  assert.equal((await get('/api/chapter/999999')).status, 400);
  assert.equal((await get('/api/chapter/..%2F..%2Fetc')).status, 400);
});

test('space pictures and dictionary words are only looked up on what the rooms ask for', async () => {
  assert.equal((await get('/api/space/nebula?page=2')).status, 200);
  assert.match(upstreamCalls[0].url, /images-api\.nasa\.gov\/search\?q=nebula/);
  assert.equal((await get('/api/space/earth%20from%20space')).status, 200);
  assert.equal((await get('/api/space/anything')).status, 400);
  assert.equal((await get('/api/space/nebula?page=9')).status, 400);

  assert.equal((await get('/api/dictionary/serendipity')).status, 200);
  assert.equal((await get('/api/dictionary/%3Cscript%3E')).status, 400);
  assert.equal((await get('/api/dictionary/a')).status, 400);
});

test('the chess puzzle is fetched from Lichess', async () => {
  assert.equal((await get('/api/chess')).status, 200);
  assert.match(upstreamCalls[0].url, /^https:\/\/lichess\.org\/api\/puzzle\/daily/);
});
