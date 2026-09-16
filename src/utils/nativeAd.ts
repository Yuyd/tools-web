const NATIVE_AD_ORIGIN = 'https://pl31325646.profitableratecpmnetwork.com'
export const NATIVE_AD_SCRIPT_SRC = `${NATIVE_AD_ORIGIN}/fbcb838137ee667edfeeabc0229c433c/invoke.js`

export const preloadNativeAd = () => {
  if (typeof document === 'undefined') return
  if (document.getElementById('native-ad-preload')) return

  const preconnect = document.createElement('link')
  preconnect.rel = 'preconnect'
  preconnect.href = NATIVE_AD_ORIGIN
  preconnect.crossOrigin = 'anonymous'
  document.head.appendChild(preconnect)

  const dnsPrefetch = document.createElement('link')
  dnsPrefetch.rel = 'dns-prefetch'
  dnsPrefetch.href = NATIVE_AD_ORIGIN
  document.head.appendChild(dnsPrefetch)

  const preload = document.createElement('link')
  preload.id = 'native-ad-preload'
  preload.rel = 'preload'
  preload.as = 'script'
  preload.href = NATIVE_AD_SCRIPT_SRC
  preload.setAttribute('fetchpriority', 'high')
  document.head.appendChild(preload)
}

export const loadNativeAd = (scriptId: string) => {
  if (typeof document === 'undefined') return
  preloadNativeAd()
  if (document.getElementById(scriptId)) return

  const script = document.createElement('script')
  script.id = scriptId
  script.async = true
  script.dataset.cfasync = 'false'
  script.src = NATIVE_AD_SCRIPT_SRC
  script.setAttribute('fetchpriority', 'high')
  document.body.appendChild(script)
}

export const unloadNativeAd = (scriptId: string) => {
  document.getElementById(scriptId)?.remove()
}
