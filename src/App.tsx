import React, { useEffect, useState } from 'react'
import {
  onNativeMessage,
  reportErrorToNative,
  sendToNative,
  type BridgeMessage,
  type SessionInitPayload,
} from './bridge/nativeBridge'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type AppState = 'waiting' | 'ready' | 'expired'

interface Session {
  cedula: string
  coordenadas: { latitud: number; longitud: number }
  deeplink?: string
}

// ─── Error Boundary (WEBVIEW_ERROR) ───────────────────────────────────────────
// Ante un crash de React, reporta WEBVIEW_ERROR a la app nativa.

interface ErrorBoundaryState {
  hasError: boolean
}

class BridgeErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  componentDidCatch(error: Error): void {
    reportErrorToNative('REACT_CRASH', error.message)
    this.setState({ hasError: true })
  }

  render(): React.ReactNode {
    if (this.state.hasError) return null
    return this.props.children
  }
}

// ─── Contenido principal ──────────────────────────────────────────────────────

function AppContent() {
  const [appState, setAppState] = useState<AppState>('waiting')
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    function handleNativeMessage(msg: BridgeMessage): void {
      if (msg.type === 'SESSION_INIT') {
        // SESSION_INIT: guardar sesión y mostrar la app
        const { cedula, coordenadas, deeplink } =
          msg.payload as SessionInitPayload
        setSession({ cedula, coordenadas, deeplink })
        setAppState('ready')
      } else if (msg.type === 'LOGOUT_INACTIVITY') {
        // LOGOUT_INACTIVITY: limpiar estado sensible y mostrar vista neutra
        // La app nativa cerrará el WebView en breve — no navegar al login
        setSession(null)
        setAppState('expired')
      }
    }

    // Regla crítica del documento:
    // Paso 1 — suscribirse a onNativeMessage ANTES de emitir WEBVIEW_READY
    // para no perder el SESSION_INIT que llega inmediatamente después.
    const off = onNativeMessage(handleNativeMessage)

    // Paso 2 — notificar a la app nativa que la SPA está lista.
    // El secreto se agrega automáticamente por el helper.
    sendToNative('WEBVIEW_READY')

    return off
  }, [])

  // Antes de SESSION_INIT: plataforma no disponible
  if (appState === 'waiting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 gap-2">
        <p className="text-gray-500 text-lg font-medium">Plataforma no disponible</p>
        <p className="text-gray-400 text-sm">Esperando conexión con la app nativa...</p>
      </div>
    )
  }

  // Después de LOGOUT_INACTIVITY: vista neutra — la app cierra el WebView en breve
  if (appState === 'expired') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-500 text-lg font-medium">Sesión finalizada</p>
      </div>
    )
  }

  function handleOpenBrowser(): void {
    sendToNative('OPEN_BROWSER', { url: 'https://www.google.com' })
  }

  function handleWebviewError(): void {
    reportErrorToNative('TEST_ERROR', 'Error de prueba enviado desde la SPA')
  }

  // Después de SESSION_INIT: pantalla de bienvenida
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-6">
      <h1 className="text-4xl font-bold text-primary-600">Bienvenido a Blu-Benefits</h1>
      {session && (
        <p className="text-gray-400 text-sm">Cédula: {session.cedula}</p>
      )}

      <div className="flex flex-col gap-3 mt-4">
        <button
          onClick={handleOpenBrowser}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800"
        >
          Probar OPEN_BROWSER
        </button>
        <button
          onClick={handleWebviewError}
          className="px-6 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 active:bg-red-700"
        >
          Probar WEBVIEW_ERROR
        </button>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  return (
    <BridgeErrorBoundary>
      <AppContent />
    </BridgeErrorBoundary>
  )
}

export default App
