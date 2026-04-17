import type { TenantMemberList } from "../../types/tenants.type"
import { axiosScopedInterceptor } from "../axios.scopedInterceptor"
import { TENANTS_ENDPOINT } from "../endpoints"

export async function selectMembersTenants(
   data: string | null
): Promise<TenantMemberList> {
  if(!data){
      return {
        tenant_id: "",
        members: []
      }
    }
  const response = await axiosScopedInterceptor.get<TenantMemberList>(
    TENANTS_ENDPOINT.MEMBERLIST
  )
  return response.data
}
