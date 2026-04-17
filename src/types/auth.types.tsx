

export type LoginDataRequest = {
  email: string;
  password: string;
};

export type RegisterDatarRequest = {
  email: string;
  password: string;
  confirmPassword: string;
};

export interface AuthResponse {
  session_expires_at: string;
  user_id: string
  session_token: string
  tenants: ApiTenants[]
}

export type ApiTenants = {
  name : string,
  id : string,
  is_personal: boolean
}

export type AgentListUserItem = {
  user_uuid: string
  user_display_name: string
  agent_uuid: string
  agent_display_name: string
  tenant_uuid: string
  tenant_display_name: string
  online: boolean
  first_seen_at: string
  last_seen_at: string
}

export type AgentListUserResponse = {
  user_id: string
  items: AgentListUserItem[]
}



export interface AuthState {
  sessionToken: string | null
  userId: string | null
  email: string
  displayName: string
  isActive: boolean
  mfaEnabled: boolean
  lastLoginAt: string | null
  lastLoginIp: string | null
  loginFailures: number
  sessionExpiresAt: string | null
  tenants: ApiTenants[]
  agents: AgentListUserItem[]
  profile_pic: number
}

export interface AuthRefreshResponse {
  session_expires_at: string
  user_id: string
  email: string
  display_name: string
  is_active: boolean
  mfa_enabled: boolean
  last_login_at: string | null
  last_login_ip: string | null
  login_failures: number
  tenants: ApiTenants[]
  profile_pic: number
}
