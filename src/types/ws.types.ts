export type WsOrigin = {
  agent_uuid: string
  user_uuid: string
  tenant_uuid: string
  source: string
}

export type WsOriginPayload = {
  agent_uuid: string
  user_uuid: string
  tenant_uuid: string
  origin: string
  conn_id?: string
}

export type WsRequest = {
  id: string
  type: string
  ts?: string
}

export type WsEnvelope<TPayload = unknown> = {
  origin: WsOrigin
  request: WsRequest
  destination?: {
    mode?: string
    agent_uuid?: string
  }
  payload?: TPayload
}

export function isWsOrigin(value: unknown): value is WsOrigin {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  return (
    typeof v.agent_uuid === "string" &&
    typeof v.user_uuid === "string" &&
    typeof v.tenant_uuid === "string" &&
    typeof v.source === "string"
  )
}

export function isWsOriginPayload(value: unknown): value is WsOriginPayload {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  return (
    typeof v.agent_uuid === "string" &&
    typeof v.user_uuid === "string" &&
    typeof v.tenant_uuid === "string" &&
    typeof v.origin === "string"
  )
}

export function toWsOrigin(payload: WsOriginPayload): WsOrigin {
  return {
    agent_uuid: payload.agent_uuid,
    user_uuid: payload.user_uuid,
    tenant_uuid: payload.tenant_uuid,
    source: payload.origin,
  }
}
