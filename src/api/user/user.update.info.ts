import type { AxiosResponse } from "axios"
import { axiosSession } from "../axios.session"
import { USER_ENDPOINT } from "../endpoints"

export type UpdateUserRequest = {
  display_name?: string
  profile_pic?: number
}

export type UpdateUserResponse = {
  status: "updated" | string
  display_name?: string
  profile_pic?: number
}

export async function updateUserInfo(
  data: UpdateUserRequest
): Promise<AxiosResponse<UpdateUserResponse>> {
  const response = await axiosSession.post<UpdateUserResponse>(
    USER_ENDPOINT.UPDATEUSER,
    data
  )
  return response
}
