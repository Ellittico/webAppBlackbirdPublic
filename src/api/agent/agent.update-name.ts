import type { UpdateAgentOfTenantRequest, UpdateAgentOfTenantResponse } from "../../types/tenants.type";
import { axiosScopedInterceptor } from "../axios.scopedInterceptor";
import { TENANTS_ENDPOINT } from "../endpoints";


export async function updateNameAgentofTenant(data:UpdateAgentOfTenantRequest):Promise<UpdateAgentOfTenantResponse> {
    const response = await axiosScopedInterceptor.post<UpdateAgentOfTenantResponse>(TENANTS_ENDPOINT.UPDATENAMEAGENT, data)
    return response.data
}