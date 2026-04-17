import type { TenantsAddRequest, Tenants } from "../../types/tenants.type";
import { axiosSession } from "../axios.session"
import { TENANTS_ENDPOINT } from "../endpoints";

export async function addTenant (
    data: TenantsAddRequest
): Promise<Tenants> {
    const response = await axiosSession.post<Tenants>(TENANTS_ENDPOINT.ADD, data);
    return response.data;
}