import type { TenantInfoUpdateRequest, TenantInfoUpdateResponse } from "../../types/tenants.type"
import { axiosScopedInterceptor } from "../axios.scopedInterceptor"
import { TENANTS_ENDPOINT } from "../endpoints"

export async function setTenantInfoUpdate(
  data: TenantInfoUpdateRequest
): Promise<TenantInfoUpdateResponse> {

  const response = await axiosScopedInterceptor.post<TenantInfoUpdateResponse>(
    TENANTS_ENDPOINT.UPDATEINFO,
    data
  )

  return response.data
}
