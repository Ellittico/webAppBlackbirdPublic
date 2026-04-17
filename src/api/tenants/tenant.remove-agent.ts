import type { AgentRemoveFromTenantResponse } from "../../types/tenants.type";
import { axiosScopedInterceptor } from "../axios.scopedInterceptor";
import { TENANTS_ENDPOINT } from "../endpoints";


export async function removeAgentFromTenant(data:string) {
    const structured = {agent_ids: [data]}
    const response = await axiosScopedInterceptor.post<AgentRemoveFromTenantResponse>(TENANTS_ENDPOINT.REMOVEAGENT, structured)
    return response.data
}