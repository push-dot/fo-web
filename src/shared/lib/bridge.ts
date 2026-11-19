type PushEnv = { token?: string | null; apiBaseUrl?: string; mock?: boolean; plan?: string; fitParts?: number; theme?: 'light' | 'dark' }

export const themeOf = (value: unknown): 'light' | 'dark' | undefined => (value === 'light' || value === 'dark' ? value : undefined)

export const applyTheme = (value: unknown) => {
  const theme = themeOf(value)
  if (!theme || typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
}

export type BridgeMessage =
  | { type: 'title'; title: string }
  | { type: 'open'; path: string }
  | { type: 'error'; status: number }
  | { type: 'external'; url: string }
  | { type: 'ready' }

declare global {
  interface Window {
    __PUSH__?: PushEnv
    ReactNativeWebView?: { postMessage: (message: string) => void }
  }
}

/** The app's access token lives here, never on `window`: a script from another origin cannot read it off a global. */
let nativeToken: string | null | undefined
let resolveToken: ((token: string | null) => void) | undefined
const tokenWait = new Promise<string | null>((resolve) => (resolveToken = resolve))

export const setNativeToken = (token: string | null | undefined) => {
  nativeToken = token
  if (token !== undefined) resolveToken?.(token)
}

export const pushEnv = (): PushEnv => {
  if (typeof window === 'undefined') return {}
  const env = (window.__PUSH__ ??= {})
  // An older app still injects `token` into the global: take it once, then remove it.
  if ('token' in env && !Object.getOwnPropertyDescriptor(env, 'token')?.get) {
    setNativeToken(env.token)
    delete env.token
  }
  // The api client reads `.token` synchronously; before the app's first push:token in a WebView it gets a promise it awaits.
  if (!Object.getOwnPropertyDescriptor(env, 'token'))
    Object.defineProperty(env, 'token', {
      enumerable: false,
      configurable: true,
      get: () => (nativeToken !== undefined || !window.ReactNativeWebView ? nativeToken : (tokenWait as unknown as string)),
    })
  return env
}

/** Which app list opened the page; the app boards for one route differ by it. */
export type WebViewFrom = 'following' | 'bookmark'

export const webViewFrom = (search = typeof location === 'undefined' ? '' : location.search): WebViewFrom | undefined => {
  const from = new URLSearchParams(search).get('from')
  return from === 'following' || from === 'bookmark' ? from : undefined
}

export const isWebView = () => typeof window !== 'undefined' && !!window.ReactNativeWebView

export const mockBuild = import.meta.env.DEV || import.meta.env.VITE_PUSH_MOCK === '1'

let mockLatched = false

export const isMock = () => {
  if (!mockBuild) return false
  if (mockLatched) return true
  if (typeof window === 'undefined') return false
  mockLatched = !!pushEnv().mock || new URLSearchParams(location.search).has('mock')
  return mockLatched
}

if (typeof window !== 'undefined') {
  applyTheme(pushEnv().theme)
  // Ask the app for the token: it answers with push:token once, so the page never has it before it asks.
  window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'ready' }))
  window.addEventListener('push:token', (e) => {
    setNativeToken((e as CustomEvent<{ token?: string | null }>).detail?.token ?? null)
  })
  window.addEventListener('push:theme', (e) => {
    applyTheme((e as CustomEvent<{ theme?: unknown }>).detail?.theme)
  })
}

const HTTP_URL = /^https?:\/\//i

export const send = (message: BridgeMessage) => {
  if (message.type === 'external' && !HTTP_URL.test(message.url)) return
  if (message.type === 'title') document.title = message.title
  if (window.ReactNativeWebView) return window.ReactNativeWebView.postMessage(JSON.stringify(message))
  if (message.type === 'external') window.open(message.url, '_blank', 'noopener')
}
