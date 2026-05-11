// Declaraciones de tipos para los globales inyectados por la app nativa
declare global {
  interface Window {
    __BLU_WEBVIEW__?: {
      platform: string
      version: string
      capabilities: string[]
    }
    __BLU_BRIDGE_SECRET__?: string
    __BLU_BRIDGE_SECRET_KEY__?: string
    ReactNativeWebView?: {
      postMessage: (message: string) => void
    }
  }
}

export interface BridgeMessage<T = unknown> {
  type: string
  payload: T
  meta?: {
    timestamp: number
    version: '1.0'
    requestId?: string
  }
}

export interface SessionInitPayload {
  cedula: string
  coordenadas: {
    latitud: number
    longitud: number
  }
  deeplink?: string
}

/** Detecta si la SPA está corriendo dentro del WebView nativo */
export const isInsideNativeApp = (): boolean =>
  typeof window !== 'undefined' &&
  !!window.__BLU_WEBVIEW__ &&
  !!window.ReactNativeWebView

/**
 * Envía un mensaje a la app nativa.
 * Agrega el secreto automáticamente — no lo agregues manualmente.
 */
export function sendToNative(
  type: string,
  payload: unknown = {},
  meta: Record<string, unknown> = {},
): void {
  if (!isInsideNativeApp()) return
  const secretKey = window.__BLU_BRIDGE_SECRET_KEY__!
  const secret = window.__BLU_BRIDGE_SECRET__!
  window.ReactNativeWebView!.postMessage(
    JSON.stringify({
      type,
      payload,
      [secretKey]: secret,
      meta: { timestamp: Date.now(), version: '1.0', ...meta },
    }),
  )
}

/**
 * Escucha mensajes provenientes de la app nativa via CustomEvent('nativeBridge').
 * Devuelve una función de limpieza — úsala en el return de useEffect.
 */
export function onNativeMessage(
  handler: (msg: BridgeMessage) => void,
): () => void {
  const listener = (event: Event) => {
    try {
      const msg = (event as CustomEvent<BridgeMessage>).detail
      if (!msg || typeof msg.type !== 'string') return
      handler(msg)
    } catch {
      /* observabilidad */
    }
  }
  window.addEventListener('nativeBridge', listener)
  return () => window.removeEventListener('nativeBridge', listener)
}

/** Reporta un error crítico irrecuperable a la app nativa */
export function reportErrorToNative(code: string, message: string): void {
  sendToNative('WEBVIEW_ERROR', { code, message })
}
