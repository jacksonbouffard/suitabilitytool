/**
 * Suitability state and recompute.
 *
 * The state object is the whole model: slider positions and toggle positions,
 * nothing else. No composite score is stored anywhere, because there isn't
 * one — the surface on screen is whatever the current state produces.
 */

import { REDRAW_DEBOUNCE_MS } from './config.js'

export function createInitialState (factors, constraints) {
  return {
    weights: Object.fromEntries(factors.map(f => [f.id, f.defaultWeight])),
    constraints: Object.fromEntries(constraints.map(c => [c.id, c.defaultOn]))
  }
}

/**
 * ── Action item 7 seam ──────────────────────────────────────────────────────
 * The only place raster logic goes. Everything else in this app is auth,
 * layer lookup, and UI.
 *
 * The shape it will take:
 *   1. Build [{ raster, weight }] from the factors, negating weight when the
 *      factor is inverted.
 *   2. rasterFunctionUtils.weightedSum({ rasters, weights }) for the soft part.
 *   3. For each constraint that is on, multiply the result by its binary
 *      raster, so an excluded cell goes to 0 rather than merely scoring low.
 *      This is the difference the item 8 smoke test is checking for.
 *   4. outputLayer.rasterFunction = fn
 *
 * Left as a log so the auth, map, and UI wiring can be verified on their own.
 *
 * @param {object} args
 * @param {object} args.state        Current weights and constraints.
 * @param {Map}    args.layers       Title -> layer, already loaded.
 * @param {object} args.outputLayer  Layer whose rasterFunction gets replaced.
 */
export async function applySuitability ({ state, layers, outputLayer }) {
  console.log('[suitability] recompute', {
    weights: state.weights,
    constraints: state.constraints,
    resolvedLayers: Array.from(layers.keys()),
    outputLayer: outputLayer?.title ?? null
  })
}

/**
 * Wraps applySuitability so a slider drag produces one recompute at the end
 * rather than sixty along the way.
 */
export function createDebouncedApply (context) {
  let timer = null
  return state => {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      applySuitability({ ...context, state })
    }, REDRAW_DEBOUNCE_MS)
  }
}
