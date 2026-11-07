# Doors of Discovery

A website of doors. Each door opens into a room, and each room is powered by a
different API — facts, gifs, images, jokes, music, quotes, stories, videos.

Angular 22 front end, small Express server behind it. Live at
[doors.purplefootsteps.co.uk](https://doors.purplefootsteps.co.uk).

## Getting started

```bash
git clone git@github.com:linda-scoon/doors_of_discovery.git
cd doors_of_discovery
npm install
cp .env.example .env     # then fill in your keys
```

Then run both halves, in two terminals:

```bash
npm run serve:api        # the API server, on :3000
npm run dev              # the Angular dev server, on :4200
```

Open http://localhost:4200. The dev server forwards `/api/*` to the API
server (see `proxy.conf.json`), so the app behaves exactly as it does in
production.

**Without `.env` the site still runs.** Rooms whose keys are missing return
503 and say which variable is absent; everything else works. The jokes room
needs no key at all, so it is a good smoke test.

To run it the way the host does — one server, production build:

```bash
npm run build
npm start                # serves dist/ and /api on :3000
```

## How the API keys are handled

**Keys live on the server and never reach the browser.**

This matters more than it might sound. An Angular bundle is downloadable, so
anything compiled into it is public — putting a key in `environment.ts` is the
same as publishing it. So the browser never talks to an upstream API at all:

```
browser  ──►  /api/facts  ──►  server adds the key  ──►  upstream API
```

`server/apis.js` is the single place that describes the upstreams and which
environment variable holds each key. The server builds one route per entry, so
**adding a room means adding one entry there** and nothing else.

Keys are read from `.env` locally, or from real environment variables on the
host. A real environment variable always wins.

| Key | Used by | Where to get it |
|---|---|---|
| `RAPID_API_KEY` | fact, image, music, quotes rooms | [RapidAPI](https://rapidapi.com/developer/apps) |
| `GIFS_API_KEY` | gif room | [Giphy](https://developers.giphy.com/dashboard/) |
| `TMDB_API_KEY` | video room | [TMDB](https://www.themoviedb.org/settings/api) |

To see which rooms are configured on a running server:

```bash
curl localhost:3000/api/health
```

It reports a true/false per room and never prints a key.

## Scripts

| Command | What it does |
|---|---|
| `npm start` | The server: serves the built app and `/api`. This is what the host runs. |
| `npm run dev` | Angular dev server on :4200, proxying `/api` to :3000 |
| `npm run serve:api` | The API server on its own, on :3000 |
| `npm run build` | Production build into `dist/web_of_doors/` |
| `npm test` | Unit tests (Karma + Jasmine) |
| `npm run watch` | Development build, rebuilding on change |

## Deployment

Hostinger builds from `master` automatically on every push.

### Settings it needs

| Setting | Value |
|---|---|
| Framework preset | **Express** |
| Entry file | **`server/index.js`** |
| Package manager | npm |

There is no build setting for Express: Hostinger installs dependencies and
starts the entry file. The build runs anyway, from `postinstall` (see
`scripts/build-on-install.js`), so installing is what produces `dist/`.
Set `SKIP_BUILD=1` to install without building.

Each one matters:

- With the framework set to **Angular**, Hostinger serves `dist` as static
  files and never starts the server — the doors appear, but **`/api/*` does
  not exist**, so no room can load anything.
- If `dist` is missing, the server still starts but has no page to serve.
  It says so in place of the page, and `/api/health` reports
  `"built": false`.

Set `RAPID_API_KEY`, `GIFS_API_KEY` and `TMDB_API_KEY` as environment
variables in the panel. They are read only by the server process, so they
never reach the public site.

After a deploy, `https://doors.purplefootsteps.co.uk/api/health` reports
whether the site was built and which rooms came up configured. Open it in a
private window: a browser that has visited the site before may answer with
the wall from its offline copy. If it returns the page's HTML instead of
JSON, the server is not running and the site is being served statically.

### If it is served statically anyway

The build also emits an `.htaccess` that sends unknown paths to `index.html`,
so client-side routes survive a refresh. The site will load, but every room
will fail to fetch, because there is no `/api` without the server.

## Project layout

```
server/
  index.js        Express: /api routes, then the built app
  apis.js         every upstream API and which key it needs — start here
  proxy.js        turns an apis.js entry into a request handler
  load-env.js     reads .env when there is one

src/app/
  components/
    doors/        the door a room sits behind
    handles/      door handles
    rooms/        one component per room, plus its service
  pipes/
    safe.pipe.ts  validates embed URLs before they reach an iframe
```

## Before you commit

`.env` is gitignored, but a key pasted directly into a source file is not.
There is a check for that:

```bash
git add -A
sh check-no-keys.sh
```

It searches everything staged for the values in your `.env`, printing variable
names only, never values.

Worth knowing what it does **not** catch: a key that is in your code but not in
`.env` is invisible to it. That is exactly how a hard-coded key reached a
public commit once before.
