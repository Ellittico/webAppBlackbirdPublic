import axios from "axios"
import { store } from "../store"

export const axiosScopedInterceptor = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

axiosScopedInterceptor.interceptors.request.use(config => {
  const token = store.getState().tenant.scopedToken

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
