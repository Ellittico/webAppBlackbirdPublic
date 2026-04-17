import { handlePushMessage } from "../utlis/handlePushMessage"

let socket: WebSocket | null = null
let lastUrl = ""
let onMessageHandler: ((data: unknown) => void) | null = null
let onOpenHandler: (() => void) | null = null

const pendingRequests = new Map<
  string,
  { resolve: (data: unknown) => void; reject: (err: unknown) => void }
>()

function buildTenantSocketUrl(sessionToken: string, tenantId: string) {
  const token = encodeURIComponent(sessionToken)
  const tenant = encodeURIComponent(tenantId)
  return `wss://emerli.ddns.net/ws?token=${token}&tenant=${tenant}&origin=ui`
}

export function connectTenantSocket(
  sessionToken: string,
  tenantId: string,
  onMessage?: (data: unknown) => void,
  onOpen?: () => void
) {
  const url = buildTenantSocketUrl(sessionToken, tenantId)
  //console.log("building: ", url)
  if (socket && socket.readyState === WebSocket.OPEN && lastUrl === url) {
    return
  }

  onMessageHandler = onMessage ?? null
  onOpenHandler = onOpen ?? null
  disconnectTenantSocket()
  lastUrl = url
  socket = new WebSocket(url)

  socket.onopen = () => {
    //console.log("socket open")
    if (onOpenHandler) {
      onOpenHandler()
    }
  }

  socket.onmessage = (event: MessageEvent) => {
    // qui
    let data: unknown
    try {
      data = JSON.parse(event.data)
    } catch (error) {
      console.error("WS parse error:", error)
      return
    }

    const id =
      typeof data === "object" && data !== null && "request" in data
        ? (data as { request?: { id?: string } }).request?.id
        : undefined

    if (id && pendingRequests.has(id)) {
      pendingRequests.get(id)!.resolve(data)
      pendingRequests.delete(id)
      handlePushMessage(data)
      return
    }else{
      handlePushMessage(data)
    }
    if (onMessageHandler) {
      onMessageHandler(data)
    }
  }
}

export function disconnectTenantSocket() {
  if (!socket) return
   //console.log("socket close")
  socket.close()
  socket = null
  lastUrl = ""
  onMessageHandler = null
  onOpenHandler = null
  pendingRequests.clear()
}

export function sendMessage(msg: unknown) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(msg))
  } else {
    console.warn("Socket not open")
  }
}

export function sendMessageWithResponse<TResponse>(
  msg: { request?: { id?: string } }
): Promise<TResponse> {
  return new Promise((resolve, reject) => {
    const id = msg.request?.id
    if (!id) {
      reject(new Error("Missing request.id in message"))
      return
    }

    if (socket?.readyState !== WebSocket.OPEN) {
      reject(new Error("Socket not open"))
      return
    }

    pendingRequests.set(id, {
      resolve: (data) => resolve(data as TResponse),
      reject,
    })
    socket.send(JSON.stringify(msg))

    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id)
        reject(new Error("Timeout: no response from server"))
      }
    }, 5000)
  })
}
