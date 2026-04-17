// src/api/axios.scoped.ts
import axios from "axios"

export const axiosScoped = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})
