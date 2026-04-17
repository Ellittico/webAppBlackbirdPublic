import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { UserInvite } from "../../types/user.type"



type UserState = {
  invites: UserInvite[]
  invitesLoaded: boolean
}

const initialState: UserState = {
  invites: [],
  invitesLoaded: false,
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserInvites(state, action: PayloadAction<UserInvite[]>) {
      state.invites = action.payload
      state.invitesLoaded = true
    },
    setUserInvitesLoading(state) {
      state.invitesLoaded = false
    },
    clearUser() {
      return initialState
    },
  },
})

export const { setUserInvites, setUserInvitesLoading, clearUser } = userSlice.actions

export default userSlice.reducer
