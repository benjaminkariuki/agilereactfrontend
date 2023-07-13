import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  projects: [],
  loading: false,
  error: null,
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    fetchProjectsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchProjectsSuccess(state, action) {
      state.projects = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchProjectsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    createProjectStart(state) {
      state.loading = true;
      state.error = null;
    },
    createProjectSuccess(state, action) {
      state.projects.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    createProjectFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    deleteProjectStart(state) {
      state.loading = true;
      state.error = null;
    },
    deleteProjectSuccess(state, action) {
      state.projects = state.projects.filter(
        (project) => project.id !== action.payload
      );
      state.loading = false;
      state.error = null;
    },
    deleteProjectFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchProjectsStart,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  createProjectStart,
  createProjectSuccess,
  createProjectFailure,
  deleteProjectStart,
  deleteProjectSuccess,
  deleteProjectFailure,
} = projectsSlice.actions;

export const fetchProjects = () => async (dispatch) => {
  try {
    dispatch(fetchProjectsStart());

    const response = await axios.get("http://192.168.88.188:8000/api/projects");

    dispatch(fetchProjectsSuccess(response.data));
  } catch (error) {
    dispatch(fetchProjectsFailure(error.message));
  }
};

export const createProject = (projectData) => async (dispatch) => {
  try {
    dispatch(createProjectStart());

    const response = await axios.post(
      "http://192.168.88.188:8000/api/projects",
      projectData
    );

    dispatch(createProjectSuccess(response.data));
  } catch (error) {
    dispatch(createProjectFailure(error.message));
  }
};

export const deleteProject = (projectId) => async (dispatch) => {
  try {
    dispatch(deleteProjectStart());

    await axios.delete(`http://192.168.88.188:8000/api/projects/${projectId}`);

    dispatch(deleteProjectSuccess(projectId));
  } catch (error) {
    dispatch(deleteProjectFailure(error.message));
  }
};

export default projectsSlice.reducer;
