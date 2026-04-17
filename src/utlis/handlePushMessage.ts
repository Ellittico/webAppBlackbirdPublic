import { store } from "../store"
import { fetchAgentsFromTenantThunk, setThisAgentUuid } from "../feature/tenants/tenantsSlice"
import { sendMessage } from "../ws/tenantSocket"
import { pingPong } from "../ws/message/webPingPong"
import { toWsOrigin } from "../types/ws.types"
import {
    markScanStarted,
    resolveLanTarget,
    setScanLocalMeta,
    setScanOutputFormat,
    terminateScanThunk,
    updateScanStream,
} from "../feature/scan/scanSlice"
import { addPerf } from "../feature/performance/performanceSlice"
import { addLine } from "../feature/log/logSlice"
import { setTasks } from "../feature/task/taskSlice"
import { removeRemoteAgent, upsertRemoteAgent } from "../feature/remoteAgent/remoteAgentSlice"
import { respondToHelloWorldThunk } from "../feature/tenants/tenantThunk"


export function handlePushMessage(msg: any) {
    //console.log("handlepush: ",msg)
    switch (msg?.request?.type) {
        case "hello.world": {
            const agentUuid = msg?.payload?.AgentUUID
            if (typeof agentUuid === "string" && agentUuid.length > 0) {
                store.dispatch(setThisAgentUuid(agentUuid))
            }
            store.dispatch(respondToHelloWorldThunk(msg))
            break
        }

        case "server.ping": {
            const mex = pingPong(toWsOrigin(msg.payload))
            sendMessage(mex)
            break
        }

        case "remote.get.lan.current.response":
        case "remote.get.lan.all.response":
            store.dispatch(resolveLanTarget(msg.payload));
            break;
        
        case "scan.lan.start":
        case "response.start.scan.lan": {
            const taskId =
                msg.payload?.meta?.task_id ||
                msg.payload?.task_id ||
                msg.payload?.scan_id ||
                msg.payload?.ScanID
            if (typeof taskId === "string" && taskId.length > 0) {
                store.dispatch(markScanStarted(taskId));
            }
            if (typeof taskId === "string" && taskId.length > 0) {
                const state = store.getState();
                const hasFormat = Boolean(state.scan.format[taskId]);
                const format = state.scan.lastRequestedFormat;
                const target = state.scan.lastRequestedTarget;
                if (!hasFormat && format && target) {
                    store.dispatch(setScanOutputFormat({ task_id: taskId, format }));
                    store.dispatch(setScanLocalMeta({ task_id: taskId, target, startedAt: Date.now() }));
                }
            }
            if (msg.payload?.meta?.task_id) {
                const payloadWithOrigin = msg.origin
                    ? { ...msg.payload, origin: msg.origin }
                    : msg.payload;
                store.dispatch(updateScanStream(payloadWithOrigin));
            }
            break;
        }

        case "scan.lan.update": {
            //controllo stato
            /*const started = taskId && store.getState().scan.startedTaskIds[taskId];
            if (!started) {
                return;
            }*/
            const payloadWithOrigin = msg.origin
                ? { ...msg.payload, origin: msg.origin }
                : msg.payload;
            store.dispatch(updateScanStream(payloadWithOrigin));
            break;
        }

        case "scan.lan.finished": {
            const taskId =
                msg.payload?.meta?.task_id ||
                msg.payload?.task_id ||
                msg.payload?.scan_id ||
                msg.payload?.ScanID;
            const payloadWithOrigin = msg.origin
                ? { ...msg.payload, origin: msg.origin }
                : msg.payload;
            store.dispatch(updateScanStream(payloadWithOrigin));

            const state = store.getState();

            if (!taskId) {
                console.warn("scan.lan.finished senza task_id", msg.payload);
                return;
            }

            const format = state.scan.format[taskId] ?? state.scan.lastRequestedFormat;
            if (!format) {
                return;
            }

            const reportPayload = msg.payload?.payload ?? msg.payload;
            store.dispatch(terminateScanThunk({
                task_id: taskId,
                format,
                report: reportPayload,
            }));
            break;
        }

        case "remote.perf.logs.update":
                store.dispatch(addPerf(msg))
                break;
            
        case "remote.base.logs.update":
            if (msg.payload?.lines) {
                store.dispatch(addLine({ ...msg.payload, origin: msg.origin }));
            }
            break;
        case "remote.get.task.response":
            store.dispatch(setTasks(msg.payload.tasks ?? []))
            break;

        
        //RIALLINEAMENTO AGENTI E UPDATES
        case "remote.agent.disconnected":
        if (msg?.payload?.agent_uuid) {
            const agentId = msg.payload.agent_uuid
            store.dispatch(removeRemoteAgent(agentId))
            store.dispatch(fetchAgentsFromTenantThunk())
        }
        break;

       case "remote.agent.connected":
        if (msg?.payload) {
            store.dispatch(upsertRemoteAgent(msg.payload))
            store.dispatch(fetchAgentsFromTenantThunk())
        }
        break;


        case "remote.agent.update":
            if (msg?.payload) {
                store.dispatch(upsertRemoteAgent(msg.payload))
            }
            break;

        default:
            break
    }
}
