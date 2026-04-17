import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import "./styles/index.css";
import App from './App'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import { Provider } from 'react-redux'
import { store } from './store'
import "./providers/LanguageProvider";
import { Buffer } from "buffer";
import "./context/i18n";
import process from "process"

if (!(globalThis as { Buffer?: typeof Buffer }).Buffer) {
  globalThis.Buffer = Buffer
}
if (!(globalThis as { process?: typeof process }).process) {
  globalThis.process = process
}
if (!globalThis.process?.nextTick) {
  globalThis.process = {
    ...globalThis.process,
    nextTick: (cb: (...args: any[]) => void, ...args: any[]) => {
      Promise.resolve().then(() => cb(...args))
    },
  } as typeof process
}
createRoot(document.getElementById('root')!).render(
  
<GoogleOAuthProvider clientId="706655801662-e7r0iflm1s4nlr6221tau2svs2900d7t.apps.googleusercontent.com">
  <StrictMode>
    <Provider store={store}>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
    </Provider>
  </StrictMode>
</GoogleOAuthProvider>,
)
