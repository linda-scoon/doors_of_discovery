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
  /** RapidAPI wants the key in an X-RapidAPI-Key header. None use it now. */
  RAPIDAPI_HEADER: 'rapidapi-header',
  /** Some APIs want the key as a query parameter instead. */
  QUERY_PARAM: 'query-param',
  /** Open APIs need nothing at all. */
  NONE: 'none',
};

/*
 * Each entry: an id (its route is /api/<id>), the upstream url, how it
 * authenticates, and optionally:
 *
 *   cacheSeconds  how long to reuse a response. Leave it off for anything
 *                 that returns one random item, or every door of that kind
 *                 shows the same one; see proxy.js.
 *   queryParams   numbers the browser may pass through, each with the range
 *                 it must fall in. Anything else in the query is ignored.
 *   pathParams    named :segments of the url, filled from the route.
 */
const apis = [
  {
    id: 'facts',
    url: 'https://uselessfacts.jsph.pl/api/v2/facts/random?language=en',
    auth: { style: AuthStyle.NONE },
  },
  {
    // Public-domain paintings from the Art Institute of Chicago, twenty to a
    // page. The room asks for a random page and picks one from it.
    id: 'paintings',
    url:
      'https://api.artic.edu/api/v1/artworks/search' +
      '?query[bool][must][][term][is_public_domain]=true' +
      '&query[bool][must][][term][artwork_type_id]=1' +
      '&limit=20&fields=id,title,artist_title,date_display,image_id',
    auth: { style: AuthStyle.NONE },
    // The museum only pages through the first thousand results of a search,
    // so fifty pages of twenty. Past that it answers 403.
    queryParams: { page: { min: 1, max: 50 } },
    cacheSeconds: 86400,
  },
  {
    // The top hundred tracks on Deezer, each with a 30-second preview. Kept
    // for ten minutes only: the preview links stop working after fifteen.
    id: 'music',
    url: 'https://api.deezer.com/chart/0/tracks?limit=100',
    auth: { style: AuthStyle.NONE },
    cacheSeconds: 600,
  },
  {
    // Fifty quotes at a time; the room picks one. ZenQuotes allows five
    // requests every thirty seconds, so the list is kept for five minutes.
    id: 'quotes',
    url: 'https://zenquotes.io/api/quotes',
    auth: { style: AuthStyle.NONE },
    cacheSeconds: 300,
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
    url:
      'https://v2.jokeapi.dev/joke/Any?safe-mode' +
      '&blacklistFlags=nsfw,religious,political,racist,sexist,explicit',
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
