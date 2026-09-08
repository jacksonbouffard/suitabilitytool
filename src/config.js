/**
 * Every path, ID, and tunable parameter for the app lives here.
 * Nothing else in src/ should contain a hard-coded ID or layer title.
 */

// ── Portal and credentials ──────────────────────────────────────────────────
// Safe to commit. Neither value grants access on its own — AGOL still checks
// the signed-in user's permissions on every request.

export const PORTAL_URL = 'https://www.arcgis.com'

/** OAuth client ID from the AGOL developer credential. Fill in after item 2. */
export const APP_ID = 'REPLACE_WITH_OAUTH_CLIENT_ID'

/** Portal item ID of the Web Map authored in AGOL (item 3). */
export const WEBMAP_ITEM_ID = 'REPLACE_WITH_WEBMAP_ITEM_ID'

// ── Criteria ────────────────────────────────────────────────────────────────
// `layerTitle` must match the layer title in the Web Map exactly, including
// case. A mismatch surfaces as a red notice in the panel rather than a
// silent no-op.

/**
 * Soft criteria. Weighted by slider, summed into the composite.
 *
 * `invert: true` means a high raster value is bad (steep slope, dense karst).
 * Applied as a negative weight in the sum. If direction-of-goodness ever moves
 * upstream into the publish-time normalization, drop this flag.
 */
export const FACTORS = [
  {
    id: 'slope',
    label: 'Slope',
    layerTitle: 'Township Slope (normalized)',
    defaultWeight: 50,
    invert: true
  },
  {
    id: 'karst',
    label: 'Karst density',
    layerTitle: 'Township Karst Density (normalized)',
    defaultWeight: 50,
    invert: true
  }
]

/**
 * Hard criteria. Toggled on or off, never weighted. Each expects a binary
 * 0/1 raster with NoData already filled to 0 so it masks rather than gaps.
 * Defaulted on — a legal exclusion is opt-out, not opt-in.
 */
export const CONSTRAINTS = [
  {
    id: 'floodplain',
    label: 'Exclude regulatory floodplain',
    layerTitle: 'Township Floodplain (SFHA binary)',
    defaultOn: true
  }
]

/** The layer whose rasterFunction is reassigned on every state change. */
export const OUTPUT_LAYER_TITLE = 'Suitability Composite'

/**
 * Enriched parcel layer. Present for click-to-popup context only; the popup
 * itself is authored in AGOL, so nothing in this app touches it. Listed here
 * so a failed load is reported instead of quietly missing.
 */
export const PARCEL_LAYER_TITLE = 'Township Parcels (enriched)'

/** Slider drags fire continuously; hold the recompute until the hand stops. */
export const REDRAW_DEBOUNCE_MS = 200
