import type { AxiosResponse } from "axios"
import { axiosSession } from "../axios.session"
import { USER_ENDPOINT } from "../endpoints"
import type {UserInvitesResponse } from "../../types/user.type"


export async function loadUserInvite(): Promise<AxiosResponse<UserInvitesResponse>> {
  const response = await axiosSession.get<UserInvitesResponse>(
    USER_ENDPOINT.USERINVITELIST
  )
  return response
}
