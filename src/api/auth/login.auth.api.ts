import { api } from "../axios";
import { type LoginDataRequest, type AuthResponse } from "../../types/auth.types";
import { AUTH_ENDPOINTS } from "../endpoints";

export async function loginUser(
  data: LoginDataRequest
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, data);
  return response.data;
}
