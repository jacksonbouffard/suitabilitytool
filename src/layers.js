/**
 * Layer lookup. Cartography and the layer list stay editable in the AGOL Web
 * Map; this app only asks for layers by title. Renaming a layer in AGOL should
 * therefore produce a clear message here, not a silent failure.
 */

/**
 * @param {object} map      The WebMap instance, already loaded.
 * @param {string[]} titles Titles to look for.
 * @returns {{ found: Map<string, object>, missing: string[] }}
 */
export function resolveLayersByTitle (map, titles) {
  const found = new Map()
  const missing = []

  titles.forEach(title => {
    // allLayers flattens group layers, so nesting in AGOL is harmless.
    const layer = map.allLayers.find(l => l.title === title)
    if (layer) {
      found.set(title, layer)
    } else {
      missing.push(title)
    }
  })

  return { found, missing }
}

/**
 * Waits for the resolved layers to finish loading, so downstream code can
 * count on rasterFunction and pixel properties being available.
 */
export async function loadAll (found) {
  await Promise.all(
    Array.from(found.values()).map(layer => layer.load?.() ?? Promise.resolve())
  )
}
