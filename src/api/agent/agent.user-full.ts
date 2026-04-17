import type { AgentListUserResponse } from "../../types/auth.types";
import { axiosSession } from "../axios.session";
import { AGENT_ENDPOINT } from "../endpoints";

export async function getAgentFromUser():Promise<AgentListUserResponse> {
    const response = await axiosSession.get<AgentListUserResponse>(AGENT_ENDPOINT.LISTFULL)
    return response.data
}