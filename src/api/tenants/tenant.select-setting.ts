import { axiosScoped } from "../axios.scoped"
import { TENANTS_ENDPOINT } from "../endpoints"
import type { TenantsSetting } from "../../types/tenants.type"

export async function selectSettingTenant(
  scopedToken: string
): Promise<TenantsSetting> {

  const response = await axiosScoped.get<TenantsSetting>(
    TENANTS_ENDPOINT.SELECTSETTING,
    {
      headers: {
        Authorization: `Bearer ${scopedToken}`,
      },
    }
  )

  return response.data
}
