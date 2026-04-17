export type TenantsAddRequest = {
    name : string
}

export type Tenants = {
    name : string,
    tenant_id : string,
    is_personal:boolean
}

export type TenantsSelectRequest = {
    tenant_id : string,
}

export type TenantsSelectResponse = {
    tenant_id : string,
    scoped_token: string
}

export type TenantsSetting = {
  tenant_id: string
  name: string
  max_agents?: number
  max_users?: number
  billing_id?: string
  is_personal: boolean
  suspended: boolean
  created_at: string
  updated_at: string
}

export type TenantMemberList = {
    tenant_id: string
    members: Member[]
}

export type Member = {
    user_uuid: string
    email: string
    display_name: string
    role_id: number
    role_name: "owner" | "admin" | "user"
    is_active: boolean
    suspended: boolean
    joined_at: string
    profile_pic:number
}

export type TenantInfoUpdateRequest = {
  name: string
  max_agents?: number
  max_users?: number
  billing_id?: string
}

export type TenantInfoUpdateResponse = {
    success: boolean
}

export type InviteMemberRequest = {
    email: string
}

export type InviteMemberResponse = {
    email: string,
    role_id: number,
    invite_uuid:string,
    status: "added" | "refused" | "pending" //FIX
}

export type DeleteMemberResponse = {
    status: "removed" | "", //FIX
    user_uuid: string
}

export type UpdateRoleRequest = {
    user_uuid: string
    role_id: number
}

export type UpdateRoleResponse = {
    new_role_id: number
    status: "updated"
    user_uuid: string 
}

export type AgentsOfTenantsFullResponse = {
    tenant_id: string
    agents: AgentTenant[]
}

export type AgentTenant = {
    agent_uuid: string
    agent_name: string
    assigned_at: string
    online: boolean
}

export type UpdateAgentOfTenantRequest = {
    agent_id: string
    display_name: string
}

export type UpdateAgentOfTenantResponse = {
    tenant_id:string
    agent_id:string
    display_name:string
}

export type AgentRemoveFromTenantResponse = {
    tenant_id:string
    removed: number
}

export type AgentAddToTenantResponse = {
    tenant_id:string
    assigned: number
}
