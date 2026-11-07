/**
 * Pictures the server fetches on the browser's behalf.
 *
 * Some image hosts sit behind a bot check that an <img> tag cannot pass: the
 * Art Institute of Chicago's answers some browsers with a challenge page
 * instead of the painting, which shows as a broken image. The server is not
 * challenged, so it fetches the picture and hands it on.
 *
 * Each source names exactly one upstream url and the only shape of id it
 * accepts, so this cannot be used to fetch anything else.
 */

const imageSources = [
  {
    id: 'paintings',
    // 843 pixels wide is the size the museum keeps ready, so it is fastest.
    url: 'https://www.artic.edu/iiif/2/:imageId/full/843,/0/default.jpg',
    idPattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    // The museum asks API users to say who they are.
    headers: { 'AIC-User-Agent': 'WebOfDoors (https://doors.purplefootsteps.co.uk)' },
  },
];

const IMAGE_TIMEOUT_MS = 10_000;

function createImageHandler(source) {
  return async function handleImageRequest(req, res) {
    const { imageId } = req.params;
    if (!source.idPattern.test(imageId)) {
      return res.status(400).json({ error: 'Not an image id.' });
    }

    try {
      const upstream = await fetch(source.url.replace(':imageId', imageId), {
        headers: source.headers,
        signal: AbortSignal.timeout(IMAGE_TIMEOUT_MS),
      });
      const type = upstream.headers.get('content-type') || '';

      if (!upstream.ok || !type.startsWith('image/')) {
        return res.status(502).json({ error: 'The picture could not be fetched.' });
      }

      res.set('Content-Type', type);
      // A given id is always the same picture, so the browser can keep it.
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(Buffer.from(await upstream.arrayBuffer()));
    } catch (error) {
      console.error(`[images/${source.id}] fetch failed:`, error.message);
      return res.status(502).json({ error: 'The picture could not be fetched.' });
    }
  };
}

module.exports = { imageSources, createImageHandler };
