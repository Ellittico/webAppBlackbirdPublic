import { axiosSession } from "../axios.session"
import type { AuthRefreshResponse  } from "../../types/auth.types"
import { AUTH_ENDPOINTS } from "../endpoints"

export async function refreshSession(): Promise<AuthRefreshResponse > {
  const res = await axiosSession.get<AuthRefreshResponse >(AUTH_ENDPOINTS.REFRESH)
  return res.data
}
