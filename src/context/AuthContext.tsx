import { createContext, useContext, type ReactNode, useEffect, useState } from "react";
import type { AuthResponse } from "../types/auth.types";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearSession, setFullSession, setSession, setSessionToken } from "../feature/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { refreshSession } from "../api/auth/auth.refresh.api";

interface AuthContextType { 
  login: (data: AuthResponse) => void;
  logout: () => void;
  authReady : boolean
}

//creazione context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const sessionToken = useAppSelector(state => state.auth.sessionToken)
  const tenants = useAppSelector(state => state.auth.tenants)
  const [authReady, setAuthReady] = useState(false)

  const storageKey = "session_token"

  const persistToken = (token: string) => {
    sessionStorage.setItem(storageKey, token)
    localStorage.setItem(storageKey, token)
  }

  const clearStoredToken = () => {
    sessionStorage.removeItem(storageKey)
    localStorage.removeItem(storageKey)
  }

  const login = (userData: AuthResponse ) => {
    dispatch(
      setSession({
        sessionToken: userData.session_token,
        userId: userData.user_id,
        tenants: userData.tenants,
      })
    )
    persistToken(userData.session_token)
    navigate('/core', { replace: true })
  };

  const logout = () => {
    dispatch(clearSession())
    clearStoredToken()
    navigate('/', { replace: true })
  };

  useEffect(() => {
    // 🟢 Caso 1: login normale → sessione già pronta
    if (sessionToken && tenants.length > 0) {
      setAuthReady(true)
      return
    }

    const storedToken =
      sessionStorage.getItem(storageKey) || localStorage.getItem(storageKey)

    // 🔴 Caso 2: nessun token → non loggata
    if (!storedToken) {
      setAuthReady(true)
      return
    }

    // 🟡 Caso 3: ho token ma NON sessione → ricostruisco
   refreshSession()
  .then(data => {
    const storedToken =
      sessionStorage.getItem(storageKey) ||
      localStorage.getItem(storageKey)

    if (storedToken) {
      dispatch(setSessionToken(storedToken)) // 🔑 QUESTA ERA LA CHIAVE
    }

    dispatch(setFullSession(data))
    setAuthReady(true)
  })
  .catch(() => {
    clearStoredToken()
    dispatch(clearSession())
    setAuthReady(true)
  })

  }, [dispatch, sessionToken, tenants.length])

  return (
    <AuthContext.Provider value={{ login, logout , authReady}}>
      {children}
    </AuthContext.Provider>
  );
}

//use del del context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
