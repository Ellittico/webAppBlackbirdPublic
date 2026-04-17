import type { UpdateRoleRequest, UpdateRoleResponse } from "../../types/tenants.type";
import { axiosScopedInterceptor } from "../axios.scopedInterceptor";
import { TENANTS_ENDPOINT } from "../endpoints";

export async function updateRoleApi(data:UpdateRoleRequest):Promise<any> {
    const response = await axiosScopedInterceptor.post<UpdateRoleResponse>(TENANTS_ENDPOINT.UPDATEROLE, data)
    return response
}