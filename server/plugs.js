/**
 * Stories from Silver Footfalls, the site owner's other site, for the books
 * room to recommend now and then.
 *
 * Found the way a search engine finds them: the sitemap lists the stories,
 * and each story's page describes itself with Open Graph tags. So a new
 * story appears here on its own, a few hours after it is published.
 *
 * Only ever talks to silverfootfalls.com, and only reads: nothing the
 * browser sends goes into a request.
 */

const SITE = 'https://silverfootfalls.com';
const STORY_URL = /^https:\/\/silverfootfalls\.com\/story\/[a-z0-9-]{1,100}$/;
const TIMEOUT_MS = 8_000;
const MAX_STORIES = 40;
const KEEP_FOR_MS = 6 * 60 * 60 * 1000;
const HEADERS = { 'User-Agent': 'WebOfDoors/1.0 (https://doors.purplefootsteps.co.uk)' };

let kept = { until: 0, stories: [] };

async function fetchText(url) {
  const response = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`${response.status} from ${url}`);
  return response.text();
}

/** Every <loc> in a sitemap. */
function locations(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(([, url]) => url);
}

/** Named characters that turn up in titles and descriptions. */
const NAMED = {
  rsquo: '\u2019', lsquo: '\u2018', rdquo: '\u201d', ldquo: '\u201c',
  hellip: '\u2026', mdash: '\u2014', ndash: '\u2013', nbsp: '\u00a0',
};

/** The handful of entities that turn up in titles and descriptions. */
function decodeEntities(text) {
  return text
    .replace(/&(rsquo|lsquo|rdquo|ldquo|hellip|mdash|ndash|nbsp);/g, (_m, name) => NAMED[name])
    .replace(/&#x([0-9a-f]+);/gi, (_m, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_m, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** An Open Graph property's content, if the page has it. */
function openGraph(html, property) {
  const tag = html.match(new RegExp(`<meta[^>]+property="og:${property}"[^>]*>`, 'i'))?.[0];
  const content = tag?.match(/content="([^"]*)"/i)?.[1];
  return content ? decodeEntities(content).trim() : undefined;
}

async function describe(url) {
  const html = await fetchText(url);
  const cover = html.match(/\/covers\/[a-z0-9_-]{1,100}\.(?:webp|jpe?g|png)/i)?.[0];
  return {
    title: openGraph(html, 'title'),
    description: openGraph(html, 'description'),
    url,
    image: openGraph(html, 'image'),
    cover: cover ? SITE + cover : undefined,
  };
}

async function loadStories() {
  const index = await fetchText(`${SITE}/sitemap.xml`);
  const storyMaps = locations(index).filter((url) => url.startsWith(`${SITE}/sitemaps/stories`));
  const urls = (await Promise.all(storyMaps.map(fetchText)))
    .flatMap(locations)
    .filter((url) => STORY_URL.test(url))
    .slice(0, MAX_STORIES);

  const stories = await Promise.allSettled(urls.map(describe));
  return stories
    .filter((result) => result.status === 'fulfilled' && result.value.title)
    .map((result) => result.value);
}

async function handleStories(_req, res) {
  try {
    if (Date.now() > kept.until) {
      const stories = await loadStories();
      if (!stories.length) throw new Error('No stories found');
      kept = { until: Date.now() + KEEP_FOR_MS, stories };
    }
    res.set('Cache-Control', `public, max-age=300, s-maxage=${KEEP_FOR_MS / 1000}`);
    return res.json({ stories: kept.stories });
  } catch (error) {
    console.error('[silverfoot] could not read the stories:', error.message);
    res.set('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'The stories could not be read.' });
  }
}

module.exports = { handleStories, openGraph, locations, decodeEntities };
