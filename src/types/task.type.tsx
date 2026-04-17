export type TaskState =
  | "active"
  | "completed"
  | "failed"
  | "stopped"
  | "queued"
  | "running";

export interface TaskItem {
  task_id: string;
  task_type: TaskType;
  state: TaskState;
  owner: string;
  from_agent: string;
  created_at: string;
  updated_at: string;
}

export interface UIGetTaskMessage {
  request: {
    id: string;
    type: "remote.get.task";
    ts: string;
  };
  destination: {
    mode: string;
    agent_uuid?:string
  };
  payload: Record<string, never>;
}

export interface UIGetTaskResponse {
  origin?: {
    agent_uuid?: string;
    source?: string;
  };
  request?: {
    id?: string;
    type?: "ui.get.task";
    ts?: string;
  };
  destination?: {
    mode?: string;
  };
  payload: {
    tasks: TaskItem[];
  };
}


  export type TaskType = "lanscan"