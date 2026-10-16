import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProjectState {
  activeProjectId: string | null;
  tasksLastUpdated: string | null;
}

const initialState: ProjectState = {
  activeProjectId: null,
  tasksLastUpdated: null,
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setActiveProject(state, action: PayloadAction<string | null>) {
      state.activeProjectId = action.payload;
    },
    setTasksLastUpdated(state, action: PayloadAction<string>) {
      state.tasksLastUpdated = action.payload;
    },
  },
});

export const { setActiveProject, setTasksLastUpdated } = projectSlice.actions;

export const store = configureStore({
  reducer: {
    project: projectSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
