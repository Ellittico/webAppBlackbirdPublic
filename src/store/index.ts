import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../feature/auth/authSlice'
import tenantReducer from '../feature/tenants/tenantsSlice'
import scanReducer from "../feature/scan/scanSlice"
import userReducer from "../feature/user/userSlice"
import performanceReducer from "../feature/performance/performanceSlice"
import logReducer from "../feature/log/logSlice"
import traskReducer from "../feature/task/taskSlice"
import remoteAgentReducer from "../feature/remoteAgent/remoteAgentSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tenant: tenantReducer,
    scan: scanReducer,
    user: userReducer,
    performance:performanceReducer,
    log:logReducer,
    task:traskReducer,
    remoteAgent: remoteAgentReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppThunk<ReturnType = void> =
  (dispatch: AppDispatch, getState: () => RootState) => ReturnType