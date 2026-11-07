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

const cities = require('../shared/cities.json');

/**
 * Some APIs ask callers to say who they are. Wikimedia refuses requests
 * without a descriptive User-Agent, and Radio Browser asks for one.
 */
const IDENTIFY = { 'User-Agent': 'WebOfDoors/1.0 (https://doors.purplefootsteps.co.uk)' };

/** How a given API expects its key to be presented. */
const AuthStyle = {
  /** RapidAPI wants the key in an X-RapidAPI-Key header. None use it now. */
  RAPIDAPI_HEADER: 'rapidapi-header',
  /** Some APIs want the key as a query parameter instead. */
  QUERY_PARAM: 'query-param',
  /** Some want it, as it is, in a header of their choosing. */
  HEADER: 'header',
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
 *   pathParamPatterns  what each of those must look like, if not anything.
 *   headers       sent with every request upstream.
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
    // What is trending on Giphy, G-rated, fifty at a time. A new key is
    // limited to about a hundred calls an hour, so each page is kept for an
    // hour and the room picks a gif from it.
    id: 'gifs',
    url: 'https://api.giphy.com/v1/gifs/trending?limit=50&rating=g',
    auth: {
      style: AuthStyle.QUERY_PARAM,
      keyName: 'GIFS_API_KEY',
      paramName: 'api_key',
    },
    queryParams: { offset: { min: 0, max: 450 } },
    cacheSeconds: 3600,
  },
  {
    id: 'jokes',
    url:
      'https://v2.jokeapi.dev/joke/Any?safe-mode' +
      '&blacklistFlags=nsfw,religious,political,racist,sexist,explicit',
    auth: { style: AuthStyle.NONE },
  },

  {
    // Pexels' hand-picked photos, forty to a page. The free key allows 200
    // calls an hour, so each page is kept for an hour and the room picks a
    // photo from it. Pexels wants the key bare in the Authorization header.
    id: 'photos',
    url: 'https://api.pexels.com/v1/curated?per_page=40',
    auth: { style: AuthStyle.HEADER, keyName: 'PEXELS_API_KEY', headerName: 'Authorization' },
    queryParams: { page: { min: 1, max: 100 } },
    cacheSeconds: 3600,
  },
  {
    // Fifty quiz questions at a time; the room picks one. Open Trivia DB
    // allows one request every five seconds, so the list is kept a while.
    // url3986 encoding, because its default is HTML entities.
    id: 'trivia',
    url: 'https://opentdb.com/api.php?amount=50&type=multiple&encode=url3986',
    auth: { style: AuthStyle.NONE },
    cacheSeconds: 300,
  },
  {
    // Wikipedia's featured articles -- its best-written pages, a few
    // thousand of them -- rather than any random page, which is mostly
    // stubs about villages and companies. There is no "random member of a
    // category", so the room sends two random letters and gets the five
    // featured articles that sort from there.
    id: 'wikipedia',
    url:
      'https://en.wikipedia.org/w/api.php?action=query&format=json' +
      '&generator=categorymembers&gcmtitle=Category:Featured_articles' +
      '&gcmnamespace=0&gcmlimit=5&gcmstartsortkeyprefix=:prefix' +
      '&prop=extracts|pageimages|info|pageprops&ppprop=disambiguation&inprop=url' +
      '&exintro=1&explaintext=1&exsentences=3&exlimit=5&piprop=thumbnail&pithumbsize=400',
    auth: { style: AuthStyle.NONE },
    pathParams: ['prefix'],
    pathParamPatterns: { prefix: /^[A-Z]{2}$/ },
    cacheSeconds: 86400,
    headers: IDENTIFY,
  },
  {
    // What happened on this day in history. The room sends today's date, so
    // it is the visitor's day, not the server's.
    id: 'onthisday',
    url: 'https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/:month/:day',
    auth: { style: AuthStyle.NONE },
    headers: IDENTIFY,
    pathParams: ['month', 'day'],
    cacheSeconds: 86400,
  },
  {
    // Where the International Space Station is right now.
    id: 'iss',
    url: 'https://api.wheretheiss.at/v1/satellites/25544',
    auth: { style: AuthStyle.NONE },
  },
  {
    // The weather now in every city in shared/cities.json, in one call; the
    // room picks a city. Weather does not change by the minute.
    id: 'weather',
    url:
      'https://api.open-meteo.com/v1/forecast' +
      `?latitude=${cities.map((c) => c.latitude).join(',')}` +
      `&longitude=${cities.map((c) => c.longitude).join(',')}` +
      '&current=temperature_2m,weather_code,is_day,wind_speed_10m&timezone=auto',
    auth: { style: AuthStyle.NONE },
    cacheSeconds: 900,
  },
  // Four animals, each from its own free API. The room picks one.
  {
    id: 'animals/dog',
    url: 'https://dog.ceo/api/breeds/image/random',
    auth: { style: AuthStyle.NONE },
  },
  {
    id: 'animals/cat',
    url: 'https://cataas.com/cat?json=true',
    auth: { style: AuthStyle.NONE },
  },
  {
    id: 'animals/fox',
    url: 'https://randomfox.ca/floof/',
    auth: { style: AuthStyle.NONE },
  },
  {
    id: 'animals/duck',
    url: 'https://random-d.uk/api/v2/random',
    auth: { style: AuthStyle.NONE },
  },
  {
    // Ten random radio stations that are up and stream over https -- a page
    // served over https may not play anything else. The room tries them in
    // turn until one plays.
    id: 'radio',
    url:
      'https://de1.api.radio-browser.info/json/stations/search' +
      '?limit=10&order=random&hidebroken=true&is_https=true',
    auth: { style: AuthStyle.NONE },
    headers: IDENTIFY,
  },
  {
    // A random recipe. "1" is TheMealDB's public key for non-commercial use.
    id: 'recipe',
    url: 'https://www.themealdb.com/api/json/v1/1/random.php',
    auth: { style: AuthStyle.NONE },
  },
  {
    // Old films from the Internet Archive's Prelinger collection: adverts,
    // public information films, home movies. Fifty to a page.
    id: 'films',
    url:
      'https://archive.org/advancedsearch.php' +
      '?q=collection%3Aprelinger+AND+mediatype%3Amovies' +
      '&fl[]=identifier&fl[]=title&fl[]=year&rows=50&output=json',
    auth: { style: AuthStyle.NONE },
    // About ten thousand films, so two hundred pages of fifty.
    queryParams: { page: { min: 1, max: 200 } },
    cacheSeconds: 86400,
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
