import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TaskItem } from "../../types/task.type";


interface TaskState {
  tasks: TaskItem[];
  active: TaskItem[];
  completed: TaskItem[];
}

const initialState: TaskState = {
  tasks: [],
  active: [],
  completed: [],
};

function splitTasks(tasks: TaskItem[]) {
  const active: TaskItem[] = [];
  const completed: TaskItem[] = [];

  tasks.forEach((task) => {
    if (task.state === "completed") {
      completed.push(task);
    } else {
      active.push(task);
    }
  });

  return { active, completed };
}

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<TaskItem[]>) => {
      state.tasks = action.payload;
      const { active, completed } = splitTasks(action.payload);
      state.active = active;
      state.completed = completed;
    },
    clearTasks: (state) => {
      state.tasks = [];
      state.active = [];
      state.completed = [];
    },
  },
});

export const { setTasks, clearTasks } = taskSlice.actions;
export default taskSlice.reducer;
