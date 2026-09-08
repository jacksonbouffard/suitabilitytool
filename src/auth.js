/**
 * OAuth 2.0 user authentication.
 *
 * There is no service credential and no API key. Whoever signs in is the
 * identity the app runs as, and AGOL enforces their permissions on every
 * request. That is the whole reason this works as a public static site.
 */

/**
 * Registers the OAuth credential and reports whether a session already exists.
 * Must run before any WebMap is created, or the map will request the item
 * anonymously and fail on private content.
 *
 * @returns {Promise<{ esriId: object, signedIn: boolean, user: string|null }>}
 */
export async function initAuth ({ portalUrl, appId }) {
  const [config, esriId, OAuthInfo] = await $arcgis.import([
    '@arcgis/core/config.js',
    '@arcgis/core/identity/IdentityManager.js',
    '@arcgis/core/identity/OAuthInfo.js'
  ])

  config.portalUrl = portalUrl

  esriId.registerOAuthInfos([
    new OAuthInfo({
      appId,
      portalUrl,
      // Full-page redirect rather than a popup. One less thing for a browser
      // to block, and the redirect URL is just the app's own URL.
      popup: false,
      // 'auto' resolves to authorization code with PKCE, which is the correct
      // flow for a static app that cannot hold a client secret.
      flowType: 'auto'
    })
  ])

  try {
    const credential = await esriId.checkSignInStatus(`${portalUrl}/sharing`)
    return { esriId, signedIn: true, user: credential.userId }
  } catch {
    return { esriId, signedIn: false, user: null }
  }
}

/** Sends the browser to AGOL's sign-in page; returns to this URL afterward. */
export async function signIn ({ portalUrl }) {
  const esriId = await $arcgis.import(
    '@arcgis/core/identity/IdentityManager.js'
  )
  return esriId.getCredential(`${portalUrl}/sharing`)
}

/** Clears the local session. Does not sign the user out of AGOL itself. */
export async function signOut () {
  const esriId = await $arcgis.import(
    '@arcgis/core/identity/IdentityManager.js'
  )
  esriId.destroyCredentials()
  window.location.reload()
}
