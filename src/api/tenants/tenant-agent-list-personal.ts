import type { AgentListUserResponse } from "../../types/auth.types"
import { axiosSession } from "../axios.session"
import { TENANTS_ENDPOINT } from "../endpoints"


export async function selectAgentsPersonalFromTenant(tenant_id:string):Promise<AgentListUserResponse> {
    const response = await axiosSession.get<AgentListUserResponse>(TENANTS_ENDPOINT.AGENTSLISTPERSONAL + "?tenant_id=" + tenant_id)
    return response.data
}