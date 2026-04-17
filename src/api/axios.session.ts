import { api } from "./axios"

export const axiosSession = api

axiosSession.interceptors.request.use(config => {
  const token =
  sessionStorage.getItem("session_token") ||
  localStorage.getItem("session_token")


  if (token  && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
