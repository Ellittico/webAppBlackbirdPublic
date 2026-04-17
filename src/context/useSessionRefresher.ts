import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { refreshSession } from "../api/auth/auth.refresh.api"
import { clearSession, setFullSession } from "../feature/auth/authSlice"

const FIFTEEN_MINUTES = 15 * 60 * 1000

export function useSessionRefresher(authReady: boolean) {
  const dispatch = useAppDispatch()
  const token = useAppSelector(s => s.auth.sessionToken)

  useEffect(() => {
    if (!authReady || !token) {
      return
    }

    let cancelled = false

    const run = async () => {
      if (cancelled) return
      try {
        const data = await refreshSession()
        dispatch(setFullSession(data))
      } catch (err: any) {
        if (err?.response?.status === 401) {
          console.warn("[SessionRefresher] token expired → logout")
          dispatch(clearSession())
        }
      }
    }

    const interval = setInterval(run, FIFTEEN_MINUTES)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [authReady, token, dispatch])
}
