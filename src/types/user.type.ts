export type UserInvite = {
  invite_token: string
  status: "pending" | "accepted" | "refused" | string
  tenant_id: string
  tenant_name: string
  role_id: number
  role_name: string
  invited_at: string
}


export type UserInvitesResponse = {
  invites: UserInvite[]
}

export type UserInviteActionResponse = {
  status: "accepted" | "rejected" | string
  invite_token: string
  tenant_id: string
}
