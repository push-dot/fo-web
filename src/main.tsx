import '@fontsource-variable/noto-sans-kr'
import '@push/design-system/tokens.css'
import './styles.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { applyMockSearch } from './app/mock-bootstrap'
import Providers from './app/providers'
import AppRouter from './app/router'
import { restoreSession } from './shared/api/client'
import { sessionStore } from './shared/auth/session'
import { isWebView } from './shared/lib/bridge'
import { holdForFonts } from './shared/lib/hold-for-fonts'

if (isWebView()) holdForFonts()

void applyMockSearch(window.location.search, sessionStore).then(restoreSession).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Providers>
        <AppRouter />
      </Providers>
    </StrictMode>,
  )
})
