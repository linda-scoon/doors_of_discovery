/**
 * Every API the site talks to, and how to authenticate with it.
 *
 * This is the only place upstream URLs and credentials are described. Adding a
 * room means adding an entry here — the server builds its /api/<id> route
 * automatically, and nothing else needs to change on the server side.
 *
 * Keys are named, never written. They are read from the environment at
 * request time, so no key is ever committed or shipped to a browser.
 */

/** How a given API expects its key to be presented. */
const AuthStyle = {
  /** RapidAPI wants the key in an X-RapidAPI-Key header. */
  RAPIDAPI_HEADER: 'rapidapi-header',
  /** Some APIs want the key as a query parameter instead. */
  QUERY_PARAM: 'query-param',
  /** Open APIs need nothing at all. */
  NONE: 'none',
};

/*
 * Each entry: an id (its route is /api/<id>), the upstream url, how it
 * authenticates, and optionally cacheSeconds -- how long to reuse a response.
 * Leave caching off for anything that returns one random item, or every door
 * of that kind shows the same one; see proxy.js.
 */
const apis = [
  {
    id: 'facts',
    url: 'https://random-facts2.p.rapidapi.com/getfact',
    auth: { style: AuthStyle.RAPIDAPI_HEADER, keyName: 'RAPID_API_KEY' },
  },
  {
    id: 'images',
    url: 'https://programming-memes-images.p.rapidapi.com/v1/memes',
    auth: { style: AuthStyle.RAPIDAPI_HEADER, keyName: 'RAPID_API_KEY' },
  },
  {
    id: 'music',
    url: 'https://deezerdevs-deezer.p.rapidapi.com/playlist/1132739621',
    auth: { style: AuthStyle.RAPIDAPI_HEADER, keyName: 'RAPID_API_KEY' },
    // A whole playlist; the room picks a track from it.
    cacheSeconds: 3600,
  },
  {
    id: 'quotes',
    url: 'https://quotelibapi.p.rapidapi.com/quote?en',
    auth: { style: AuthStyle.RAPIDAPI_HEADER, keyName: 'RAPID_API_KEY' },
  },
  {
    id: 'gifs',
    url: 'https://api.giphy.com/v1/gifs/random?tag=',
    auth: {
      style: AuthStyle.QUERY_PARAM,
      keyName: 'GIFS_API_KEY',
      paramName: 'api_key',
    },
  },
  {
    id: 'jokes',
    url: 'https://v2.jokeapi.dev/joke/Any?safe-mode',
    auth: { style: AuthStyle.NONE },
  },

  // The video room needs two calls: pick a popular movie, then find its
  // trailer. Replaces imdb-api.com, which shut down.
  {
    id: 'videos/popular',
    url: 'https://api.themoviedb.org/3/movie/popular',
    auth: {
      style: AuthStyle.QUERY_PARAM,
      keyName: 'TMDB_API_KEY',
      paramName: 'api_key',
    },
    // A list of films the room picks from, and it changes slowly.
    cacheSeconds: 3600,
  },
  {
    id: 'videos/trailer',
    url: 'https://api.themoviedb.org/3/movie/:movieId/videos',
    auth: {
      style: AuthStyle.QUERY_PARAM,
      keyName: 'TMDB_API_KEY',
      paramName: 'api_key',
    },
    // Named segments in the url above are filled from the request's route
    // parameters. Only these names are accepted, so a request cannot reach a
    // part of the upstream API we did not intend.
    pathParams: ['movieId'],
    // Cached per film, and a film's trailers do not change.
    cacheSeconds: 86400,
  },
];

module.exports = { apis, AuthStyle };
