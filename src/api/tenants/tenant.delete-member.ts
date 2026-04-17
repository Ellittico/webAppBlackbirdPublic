import type { DeleteMemberResponse } from "../../types/tenants.type"
import { axiosScopedInterceptor } from "../axios.scopedInterceptor"
import { TENANTS_ENDPOINT } from "../endpoints"


export async function deleteMemberApi (uuid:string | null):Promise<DeleteMemberResponse> {
    if(!uuid){ 
        return {
            status: "",
            user_uuid: ""
        }
    }
    const data={ user_uuid: uuid }
    const response = await axiosScopedInterceptor.post<DeleteMemberResponse>(
        TENANTS_ENDPOINT.DELETEMEMBER, data
    )
    return response.data
}