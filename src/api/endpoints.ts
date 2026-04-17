export const AUTH_ENDPOINTS = {
  REGISTER: "/user/register",
  LOGIN: "/user/login",
  REFRESH: "/user/me/full"
};
 export const TENANTS_ENDPOINT = {
  ADD: "/tenant/create",
  SELECT: "/tenant/select-tenant",
  SELECTSETTING: "/tenant/settings",
  MEMBERLIST: "/tenant/members/list",
  UPDATEINFO: "/tenant/settings/update",
  INVITEMEMBER: "/tenant/members/invite",
  DELETEMEMBER: "/tenant/members/remove",
  UPDATEROLE: "/tenant/members/update-role",
  AGENTSLISTFULL: "/tenant/agents/list",
  AGENTSLISTPERSONAL : "/user/agents/list",
  UPDATENAMEAGENT: "/tenant/agents/custom-value",
  REMOVEAGENT: "/tenant/agents/remove",
  ADDAGENT:"/tenant/agents/assign",
 }

 export const AGENT_ENDPOINT = {
  LISTFULL: "/user/agents/list-all"
 }


 export const USER_ENDPOINT = {
  USERINVITELIST: "/user/invites",
  REJECTINVITE: "/user/invites/reject",
  ACCEPTINVITE: "/user/invites/accept",
  UPDATEUSER: "/user/update"
 }