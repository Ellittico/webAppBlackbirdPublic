// feature/tenant/tenantSlice.ts
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { AgentsOfTenantsFullResponse, AgentTenant, Member, TenantInfoUpdateRequest, TenantsSelectResponse, TenantsSetting, UpdateAgentOfTenantResponse, UpdateRoleResponse } from "../../types/tenants.type"
import type { AgentListUserItem } from "../../types/auth.types"
import { TENANTS_ENDPOINT } from "../../api/endpoints"
import {api} from "../../api/axios"

export const fetchAgentsFromTenantThunk = createAsyncThunk<
  AgentTenant[],
  void,
  { state: { tenant: TenantState } }
>(
  "tenant/fetchAgentsFromTenant",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const scopedToken = state.tenant.scopedToken

      if (!scopedToken) {
        return rejectWithValue("Missing scoped token")
      }

     const response = await api.get<AgentsOfTenantsFullResponse>(
      TENANTS_ENDPOINT.AGENTSLISTFULL,
      {
        headers: {
          Authorization: `Bearer ${scopedToken}`,
        },
      }
    )

    //console.log(response)

      return response.data.agents
    } catch (err) {
      return rejectWithValue(err)
    }
  }
)

type TenantState = {
  scopedToken: string | null
  info: TenantsSetting | null
  members: Member[]
  agents: AgentTenant []
  personalAgent: AgentListUserItem[]
  thisAgentUuid: string | null
}

const initialState: TenantState = {
  scopedToken: null,
  info: null,
  members: [],
  agents: [],
  personalAgent: [],
  thisAgentUuid: null,
}

const roleNameMap: Record<number, "owner" | "admin" | "user"> = {
  1: "owner",
  2: "admin",
  3: "user",
}

const tenantSlice = createSlice({
  name: "tenant",
  initialState,
  reducers: {

    setScopedToken(state, action: PayloadAction<TenantsSelectResponse>) {
      state.scopedToken = action.payload.scoped_token
    },

    setTenantInfo(state, action: PayloadAction<TenantsSetting>) {
      state.info = action.payload
    },

    setTenantMembers(state, action:PayloadAction<Member[]> ){
      state.members = action.payload
    },

    /*updateSingleMember(state, action:PayloadAction<InviteMemberResponse>){
      if(!state.members) return

      const newMember: Member = {
        user_uuid: action.payload.user_id.toString() , 
        email: action.payload.email,
        display_name: action.payload.email.split("@")[0], // fallback
        role_id: action.payload.role_id,
        role_name: roleNameMap[action.payload.role_id] ?? "user",
        is_active: false,
        suspended: false,
        joined_at: new Date().toISOString(),
      }

       state.members.push(newMember)
    },*/

    setUpdateTenantInfo(state, action:PayloadAction<TenantInfoUpdateRequest>){
      if(!state.info) return
      state.info.name = action.payload.name
      state.info.max_agents = action.payload.max_agents
      state.info.max_users = action.payload.max_users
      state.info.billing_id = action.payload.billing_id
    },

    deleteMemberReducer(state, action: PayloadAction<string>) {
      if (!state.members) return

      state.members = state.members.filter(
        m => m.user_uuid !== action.payload
      )
    },

    updateRoleMember(state, action:PayloadAction<UpdateRoleResponse>){
      if(!state.members) return

      const member = state.members.find(
        m => m.user_uuid === action.payload.user_uuid
      )

      if (!member) return

      member.role_id = action.payload.new_role_id
      member.role_name = roleNameMap[action.payload.new_role_id]
  
    },

    setAgentofTenant(state, action: PayloadAction<AgentTenant[]>){
      state.agents = action.payload
    },

    setAgentoPersonalfTenant(state, action: PayloadAction<AgentListUserItem[]>){
      state.personalAgent = action.payload
    },

    setThisAgentUuid(state, action: PayloadAction<string | null>) {
      state.thisAgentUuid = action.payload
    },

    updateAgentNameReducer(state,action:PayloadAction<UpdateAgentOfTenantResponse>){
      if(state.info?.tenant_id !== action.payload.tenant_id) return      
      const agent = state.agents.find(agent => agent.agent_uuid === action.payload.agent_id)
      const personalAgent = state.personalAgent.find(agent => agent.agent_uuid === action.payload.agent_id)
      if(agent) {
        agent.agent_name = action.payload.display_name
      }
      if(personalAgent) {
        personalAgent.agent_display_name = action.payload.display_name
      }
    },

    removeAgentFromTenantReducer(state, action: PayloadAction<string>) {
      const agentId = action.payload

      state.agents = state.agents.filter(
        agent => agent.agent_uuid !== agentId
      )

      state.personalAgent = state.personalAgent.filter(
        agent => agent.agent_uuid !== agentId
      )
    },

    clearTenant() {
      return initialState
    },

    AddAgentToTenantReducer(state, action: PayloadAction<AgentTenant>) {
      const exists = state.agents.some(
        agent => agent.agent_uuid === action.payload.agent_uuid
      );

      if (!exists) {
        state.agents.push(action.payload);
        state.personalAgent.push() //TO DO FIX AGGiungere i dati dell'agent anche per l'utente --> incosistenza dati
      }
    },


  },
  extraReducers: builder => {
    builder
      .addCase(fetchAgentsFromTenantThunk.fulfilled, (state, action) => {
        state.agents = action.payload  
      })
  },
})

export const {
  setScopedToken,
  setTenantInfo,
  setTenantMembers,
  setUpdateTenantInfo,
  clearTenant,
  //updateSingleMember,
  deleteMemberReducer,
  setAgentofTenant,
  setAgentoPersonalfTenant,
  updateAgentNameReducer,
  removeAgentFromTenantReducer,
  AddAgentToTenantReducer,
  setThisAgentUuid,
} = tenantSlice.actions

export default tenantSlice.reducer



