import type { TenantsSelectRequest, TenantsSelectResponse } from "../../types/tenants.type";
import { axiosSession } from "../axios.session"
import { TENANTS_ENDPOINT } from "../endpoints";

export async function selectTenant (
    data: TenantsSelectRequest
): Promise<TenantsSelectResponse> {
    const response = await axiosSession.post<TenantsSelectResponse>(TENANTS_ENDPOINT.SELECT, data);
    return response.data;
}