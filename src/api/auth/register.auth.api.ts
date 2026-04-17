import { api } from "../axios";
import { type RegisterDatarRequest, type AuthResponse } from "../../types/auth.types";
import { AUTH_ENDPOINTS } from "../endpoints";

export async function registerUser(
  data: RegisterDatarRequest
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, data);
  return response.data;
}
