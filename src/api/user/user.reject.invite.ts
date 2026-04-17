import type { AxiosResponse } from "axios"
import { axiosSession } from "../axios.session"
import { USER_ENDPOINT } from "../endpoints"
import type { UserInviteActionResponse } from "../../types/user.type"

export async function rejectUserInvite(
  invite_token: string
): Promise<AxiosResponse<UserInviteActionResponse>> {
  const requestData = { invite_token }
  const response = await axiosSession.post<UserInviteActionResponse>(
    USER_ENDPOINT.REJECTINVITE,
    requestData
  )
  return response
}
