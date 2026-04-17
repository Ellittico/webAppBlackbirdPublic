import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AgentListUserItem, ApiTenants, AuthRefreshResponse, AuthState, } from "../../types/auth.types"


const initialState: AuthState = {
  sessionToken: null,
  userId: null,
  email: "",
  displayName: "",
  isActive: false,
  mfaEnabled: false,
  lastLoginAt: null,
  lastLoginIp: null,
  loginFailures: 0,
  sessionExpiresAt: null,
  profile_pic:1,
  tenants:[],
  agents:[]
}


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSessionToken(state, action: PayloadAction<string | null>) {
      state.sessionToken = action.payload
    },
    setSession(
      state,
      action: PayloadAction<{
        sessionToken: string
        userId: string
        tenants: ApiTenants[]
      }>
    ) {
      state.sessionToken = action.payload.sessionToken
      state.userId = action.payload.userId
      state.tenants = action.payload.tenants
    },

    clearSession(state) {
      state.sessionToken = null
      state.userId = null
      state.tenants = []
    },

    setTenants(state, action: PayloadAction<ApiTenants[]>) {
      state.tenants = action.payload
    },

    addTenant(state, action: PayloadAction<ApiTenants>) {
      state.tenants.push(action.payload)
    },

    setFullSession(state, action: PayloadAction<AuthRefreshResponse>) {
      const p = action.payload
      state.userId = p.user_id
      state.email = p.email
      state.displayName = p.display_name
      state.isActive = p.is_active
      state.mfaEnabled = p.mfa_enabled
      state.lastLoginAt = p.last_login_at
      state.lastLoginIp = p.last_login_ip
      state.loginFailures = p.login_failures
      state.sessionExpiresAt = p.session_expires_at
      state.tenants = p.tenants
      state.profile_pic = p.profile_pic
    },

    setAgentsUser(state, action: PayloadAction<AgentListUserItem[]>){
      state.agents = action.payload
    },
  },
})

export const { setSessionToken, setSession, clearSession, setTenants, addTenant, setFullSession,setAgentsUser } = authSlice.actions
export default authSlice.reducer
