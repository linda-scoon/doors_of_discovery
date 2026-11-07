# Doors of Discovery

A website of doors. Each door opens into a room, and each room is powered by a
different API — facts, gifs, images, jokes, music, quotes, stories, videos.

Built with Angular 22. Live at
[doors.purplefootsteps.co.uk](https://doors.purplefootsteps.co.uk).

## Getting started

```bash
git clone git@github.com:linda-scoon/doors_of_discovery.git
cd doors_of_discovery
npm install
cp .env.example .env     # then fill in your keys
npm start
```

The app runs at http://localhost:4200.

**Without `.env` the app still builds and runs** — the rooms whose keys are
missing simply won't load their data, and the build prints a warning saying
which ones.

## API keys

`.env.example` lists every key the app expects and where to get it. It is the
single source of truth: `scripts/set-env.js` reads the key names from it, so
adding a new key to the project means adding one line there.

`.env` itself is gitignored and must never be committed.

| Key | Used by | Where to get it |
|---|---|---|
| `RAPID_API_KEY` | fact, image, music, quotes rooms | [RapidAPI](https://rapidapi.com/developer/apps) |
| `GIFS_API_KEY` | gif room | [Giphy](https://developers.giphy.com/dashboard/) |
| `TMDB_API_KEY` | video room | [TMDB](https://www.themoviedb.org/settings/api) |

### How configuration reaches the app

A browser has no `process.env`, so Angular cannot read configuration at
runtime. Instead `scripts/set-env.js` runs at build time and generates
`src/environments/environment.ts` from your configuration.

**`src/environments/environment.ts` and `environment.prod.ts` are generated
files.** They are gitignored, they are overwritten on every build, and editing
them by hand achieves nothing. Change `.env` instead.

Values are looked up in this order:

1. **`.env`** — your machine
2. **`process.env`** — a build host or CI, where there is no `.env` file
   because it is gitignored. On Hostinger, set the same names as environment
   variables in the control panel.

`npm start`, `npm run build`, `npm test` and `npm run watch` all run the
generator first, so you never call it directly. If you want to regenerate on
its own:

```bash
npm run config
```

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Dev server at http://localhost:4200 |
| `npm run build` | Production build into `dist/web_of_doors/` |
| `npm test` | Unit tests (Karma + Jasmine) |
| `npm run watch` | Development build, rebuilding on change |
| `npm run config` | Regenerate the environment files from `.env` |

## Before you commit

`.env` is gitignored, but a key pasted directly into a service file is not.
There is a check for that:

```bash
git add -A
sh check-no-keys.sh
```

It searches everything you have staged for the values in your `.env` and
refuses the ones it finds. It prints variable names only, never values, so the
output is safe to paste anywhere.

It is worth knowing what it does **not** catch: a key that is in your code but
not in `.env` is invisible to it. That is exactly how a hard-coded key reached
a public commit once before.

## A note on API keys and the browser

Keeping keys in `.env` keeps them out of git. It does **not** keep them out of
the browser — `environment.ts` is compiled into `main.js`, so anyone can read
the deployed keys with devtools. An Angular app cannot hold a secret.

Moving the API calls behind a small backend, so the keys stay on the server,
is tracked in the issues.

## Project layout

```
src/app/
  components/
    doors/        the door a room sits behind
    handles/      door handles
    rooms/        one component per room, plus its API service
  pipes/
    safe.pipe.ts  validates embed URLs before they reach an iframe
scripts/
  set-env.js      generates environment.ts from .env or the environment
```
