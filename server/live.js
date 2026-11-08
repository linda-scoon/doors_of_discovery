/**
 * Live streams that are on right now: space station cameras, animal cams,
 * aquariums. Only from the channels in shared/live-channels.json, which
 * were chosen by hand to suit everyone.
 *
 * A YouTube live stream gets a new address each time it restarts, so the
 * room cannot keep a fixed list. The server asks YouTube which streams
 * those channels have live, and keeps the answer.
 *
 * YouTube's API allows 10,000 units a day. Asking what a channel has live
 * costs 100; checking that known streams are still on costs 1. So each
 * channel is asked at most every six hours, the streams already known are
 * checked every ten minutes, and nothing is asked at all while nobody is
 * opening the door. A hard daily cap on searches stays well inside the
 * allowance even if something goes wrong.
 *
 * The key is sent in a header, never in a URL, so it cannot end up in a
 * log line or an error message.
 */
const channels = require('../shared/live-channels.json');

const API = 'https://www.googleapis.com/youtube/v3';
const TIMEOUT_MS = 10_000;
const SEARCH_EVERY_MS = 6 * 60 * 60 * 1000;
const CHECK_EVERY_MS = 10 * 60 * 1000;
const MAX_SEARCHES_PER_DAY = 60;
const RETRY_AFTER_MS = 30 * 60 * 1000;
const VIDEO_ID = /^[\w-]{11}$/;

/** channel id -> { searchedAt, ids } */
const found = new Map();
/** The streams known to be live, embeddable and public. */
let live = [];
let checkedAt = 0;
let refreshing = null;
const budget = { day: '', searches: 0 };

function spendSearch() {
  const today = new Date().toISOString().slice(0, 10);
  if (budget.day !== today) Object.assign(budget, { day: today, searches: 0 });
  if (budget.searches >= MAX_SEARCHES_PER_DAY) return false;
  budget.searches += 1;
  return true;
}

async function youtube(path, params, key) {
  const response = await fetch(`${API}/${path}?${new URLSearchParams(params)}`, {
    headers: { 'X-Goog-Api-Key': key, Accept: 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`${response.status} from YouTube (${path})`);
  return response.json();
}

async function searchChannel(channel, key) {
  const body = await youtube(
    'search',
    { part: 'id', channelId: channel.id, eventType: 'live', type: 'video', maxResults: '25', safeSearch: 'strict' },
    key
  );
  return (body.items ?? []).map((item) => item?.id?.videoId).filter((id) => VIDEO_ID.test(id ?? ''));
}

/** Which of these are still live, public and allowed on other sites. */
async function check(ids, key) {
  const streams = [];
  for (let i = 0; i < ids.length; i += 50) {
    const body = await youtube('videos', { part: 'snippet,status', id: ids.slice(i, i + 50).join(','), maxResults: '50' }, key);
    for (const video of body.items ?? []) {
      const channel = channels.find((c) => c.id === video?.snippet?.channelId);
      if (
        channel &&
        VIDEO_ID.test(video.id) &&
        video.snippet.liveBroadcastContent === 'live' &&
        video.status?.embeddable === true &&
        video.status?.privacyStatus === 'public'
      ) {
        streams.push({
          id: video.id,
          title: String(video.snippet.title ?? '').slice(0, 140),
          channel: channel.name,
          topic: channel.topic,
        });
      }
    }
  }
  return streams;
}

async function refresh(key) {
  const now = Date.now();
  let searched = false;

  for (const channel of channels) {
    const known = found.get(channel.id);
    if (known && now - known.searchedAt < SEARCH_EVERY_MS) continue;
    if (!spendSearch()) break;
    try {
      found.set(channel.id, { searchedAt: now, ids: await searchChannel(channel, key) });
      searched = true;
    } catch (error) {
      // Keep what was known before, and try this channel again in half an
      // hour rather than on the very next visit, which would burn through
      // the day's searches if YouTube were down.
      console.error('[live] could not ask YouTube about a channel:', error.message);
      found.set(channel.id, { searchedAt: now - SEARCH_EVERY_MS + RETRY_AFTER_MS, ids: known?.ids ?? [] });
    }
  }

  if (searched || now - checkedAt >= CHECK_EVERY_MS) {
    const ids = [...new Set([...found.values()].flatMap((f) => f.ids))];
    live = ids.length ? await check(ids, key) : [];
    checkedAt = now;
    // Forget streams that have ended, so they are not checked again.
    const stillLive = new Set(live.map((s) => s.id));
    for (const f of found.values()) f.ids = f.ids.filter((id) => stillLive.has(id));
  }
}

async function handleLive(_req, res) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    res.set('Cache-Control', 'no-store');
    return res.status(503).json({ error: 'Live streams are not set up.' });
  }

  try {
    refreshing ??= refresh(key).finally(() => (refreshing = null));
    await refreshing;
  } catch (error) {
    console.error('[live] could not check the streams:', error.message);
    // Fall through: what was live a few minutes ago is better than nothing.
  }

  if (!live.length) {
    res.set('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'Nothing is live just now.' });
  }
  res.set('Cache-Control', 'public, max-age=60, s-maxage=300');
  return res.json({ streams: live });
}

/** For tests: start again from nothing. */
function forget() {
  found.clear();
  live = [];
  checkedAt = 0;
  refreshing = null;
  Object.assign(budget, { day: '', searches: 0 });
}

module.exports = { handleLive, forget, MAX_SEARCHES_PER_DAY };
