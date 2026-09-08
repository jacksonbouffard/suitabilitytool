import {
  PORTAL_URL,
  APP_ID,
  WEBMAP_ITEM_ID,
  FACTORS,
  CONSTRAINTS,
  OUTPUT_LAYER_TITLE,
  PARCEL_LAYER_TITLE
} from './config.js'
import { initAuth, signIn, signOut } from './auth.js'
import { resolveLayersByTitle, loadAll } from './layers.js'
import { createInitialState, createDebouncedApply } from './suitability.js'
import { buildControls, resetControls, showNotice } from './ui.js'

const el = {
  map: document.querySelector('arcgis-map'),
  factors: document.querySelector('#factors'),
  constraints: document.querySelector('#constraints'),
  reset: document.querySelector('#reset'),
  account: document.querySelector('#account'),
  notice: document.querySelector('#notice'),
  noticeMessage: document.querySelector('#notice-message'),
  loader: document.querySelector('#loader')
}

async function start () {
  // Auth first. A WebMap created before the credential is registered will
  // request the item anonymously and fail on anything not public.
  const { signedIn, user } = await initAuth({
    portalUrl: PORTAL_URL,
    appId: APP_ID
  })

  if (!signedIn) {
    el.loader.hidden = true
    el.account.textContent = 'Sign in'
    el.account.addEventListener('click', () => signIn({ portalUrl: PORTAL_URL }))
    showNotice(el.notice, el.noticeMessage, [
      'Sign in with your ArcGIS Online account to load the suitability layers.'
    ])
    return
  }

  el.account.textContent = `Sign out (${user})`
  el.account.addEventListener('click', signOut)

  const WebMap = await $arcgis.import('@arcgis/core/WebMap.js')
  const webmap = new WebMap({ portalItem: { id: WEBMAP_ITEM_ID } })

  el.map.map = webmap
  await el.map.viewOnReady()

  const { found, missing } = resolveLayersByTitle(webmap, [
    ...FACTORS.map(f => f.layerTitle),
    ...CONSTRAINTS.map(c => c.layerTitle),
    OUTPUT_LAYER_TITLE,
    PARCEL_LAYER_TITLE
  ])

  await loadAll(found)
  el.loader.hidden = true

  showNotice(
    el.notice,
    el.noticeMessage,
    missing.length ? [`Not found in the web map: ${missing.join(', ')}`] : []
  )

  const state = createInitialState(FACTORS, CONSTRAINTS)
  const apply = createDebouncedApply({
    layers: found,
    outputLayer: found.get(OUTPUT_LAYER_TITLE)
  })

  const controlArgs = {
    factorsEl: el.factors,
    constraintsEl: el.constraints,
    factors: FACTORS,
    constraints: CONSTRAINTS,
    state,
    onChange: apply
  }

  buildControls(controlArgs)
  el.reset.addEventListener('click', () => resetControls(controlArgs))

  // Draw once at the default state so the map is never blank on arrival.
  apply(state)
}

start().catch(error => {
  el.loader.hidden = true
  showNotice(el.notice, el.noticeMessage, [error.message ?? String(error)])
  console.error(error)
})
