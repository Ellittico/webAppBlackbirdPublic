import type { AgentsOfTenantsFullResponse } from "../../types/tenants.type";
import { axiosScopedInterceptor } from "../axios.scopedInterceptor";
import { TENANTS_ENDPOINT } from "../endpoints";


export async function selectAgentsFromTenant(
       data: string | null
):Promise<AgentsOfTenantsFullResponse> {
      if(!data){
      return {
        tenant_id: "",
        agents: []
      }
    }
    const response = await axiosScopedInterceptor.get<AgentsOfTenantsFullResponse>(
        TENANTS_ENDPOINT.AGENTSLISTFULL
    )
    return response.data
}

