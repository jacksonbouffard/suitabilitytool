# Township Land Suitability

A standalone web app for exploring land suitability across the township. Soft
factors are weighted by slider, hard constraints are toggled on and off, and no
composite score is baked in anywhere — the surface on screen is whatever the
current settings produce.

Built directly on the ArcGIS Maps SDK for JavaScript. No framework, no build
step, no bundler. The whole app is static files served as-is.

## Layout

```
index.html          Calcite shell, one CDN script tag
styles/app.css      layout only; Calcite supplies the visual system
src/
  config.js         portal, IDs, criteria — the only file with hard-coded values
  auth.js           OAuth 2.0 user sign-in against AGOL
  layers.js         resolve web map layers by title
  suitability.js    state object and the raster function seam
  ui.js             builds the sliders and toggles from config
  main.js           orchestration
```

## Before it runs

Fill in two values in `src/config.js`:

- `APP_ID` — the OAuth client ID from the AGOL developer credential
- `WEBMAP_ITEM_ID` — the portal item ID of the Web Map

Then confirm every `layerTitle` matches the layer titles in that Web Map
exactly, including case. Mismatches show up as a red notice in the panel rather
than failing silently.

Both IDs are safe to commit to a public repository. Neither grants access on
its own, because AGOL still checks the signed-in user's permissions on every
request. There is no service credential and no API key anywhere in this app.

## Running locally

The SDK loads as an ES module, so `file://` will not work. Any static server
does:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

Add `http://localhost:8080` to the Redirect URLs of the AGOL developer
credential alongside the eventual GitHub Pages URL. The app uses a full-page
redirect rather than a popup, so the redirect URL is just the app's own URL —
there is no separate callback page.

## Deploying to GitHub Pages

Push to `main` and point Pages at the repository root. There is nothing to
build. `.nojekyll` is present so Jekyll does not interfere with the `src/`
directory.

Once the Pages URL exists, add it to the credential's Redirect URLs. That is
action item 2, and it is the only step that has to wait for hosting.

## SDK version

Pinned to `https://js.arcgis.com/5.1/`. A few things worth knowing about the 5.x
line:

- One script tag now serves the core API, map components, and Calcite together,
  on coordinated version numbers. No separate Calcite tag is needed.
- AMD and `require()` are deprecated as of 5.0 and go away at 6.0. This app uses
  `$arcgis.import()` throughout, which is the supported CDN pattern.
- Widgets are deprecated in favour of web components, which is why the map is
  `<arcgis-map>` rather than a `MapView` constructed in JavaScript.

Minor version bumps within 5.x are non-breaking, so `5.1` to `5.2` should be a
one-character edit. The jump to 6.0 will not be.

## Where this sits in the action item list

| Item | Status |
| --- | --- |
| 1. Repository and Pages | this repo; enable Pages on the root |
| 2. OAuth redirect URLs | after the Pages URL exists |
| 3. Author the Web Map | do in AGOL, then copy the titles into `config.js` |
| 5. Read the layers by title | done — see the console and the red notice |
| 6. Sliders and toggle, state only | done |
| 7. Raster function on state change | seam in `suitability.js`, `applySuitability` |
| 8. Smoke test redraw and exclusion | after item 7 |

Items 4 and 5 as originally written assumed an Experience Builder widget shell
and no longer apply.
