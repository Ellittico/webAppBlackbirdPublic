import type { InviteMemberRequest, InviteMemberResponse } from "../../types/tenants.type";
import { axiosScopedInterceptor } from "../axios.scopedInterceptor";
import { TENANTS_ENDPOINT } from "../endpoints";



export async function inviteMemberTenant(
    data:InviteMemberRequest) : Promise<InviteMemberResponse> {
       const response = await axiosScopedInterceptor.post<InviteMemberResponse>(
           TENANTS_ENDPOINT.INVITEMEMBER,
           data
         )
    return response.data
} 