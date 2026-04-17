import type { AgentAddToTenantResponse } from "../../types/tenants.type"
import { axiosScopedInterceptor } from "../axios.scopedInterceptor"
import { TENANTS_ENDPOINT } from "../endpoints"


export async function AddAgentToTenant(data:string) {   
    const structured = {agent_ids: [data]}
    const response = await axiosScopedInterceptor.post<AgentAddToTenantResponse>(TENANTS_ENDPOINT.ADDAGENT, structured  )
    return response
}