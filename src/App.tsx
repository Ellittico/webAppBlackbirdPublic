import './styles/App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Core from './Core'
import { useAppSelector } from './store/hooks'
import { useSessionRefresher } from './context/useSessionRefresher'
import { useAuth } from './context/AuthContext'

function App() {
  const { authReady } = useAuth()
  const sessionToken = useAppSelector(state => state.auth.sessionToken)

  // 🔒 refresher SOLO quando auth è pronta
  useSessionRefresher(authReady)

  // ⏳ finché auth non è decisa, non renderizzi nulla
  if (!authReady) {
    return null // oppure loader
  }

  return (
    <div className="mt-0">
      <div className="flex flex-row h-[calc(100%-45px)]">
        <div className="max-h-[100vh] w-full">
          <Routes>
            <Route
              path="/"
              element={sessionToken ? <Navigate to="/core" /> : <Login />}
            />
            <Route
              path="/core/*"
              element={sessionToken ? <Core /> : <Navigate to="/" />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>

      <span className="fixed bottom-[10px] right-[0px] mx-[10px] bg-[#1D4ED8] px-[5px] text-xs text-white z-[999999999]">
        v0.1.4-internal
      </span>
    </div>
  )
}

export default App
