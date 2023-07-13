import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../slices/userSlices";
import projectsReducer from "../slices/projectsSlice";

const storedUser = localStorage.getItem("user");
const storedProject = localStorage.getItem("project");
const initialState = {
  user: storedUser ? JSON.parse(storedUser) : {},
  project: storedProject ? JSON.parse(storedProject) : {}, 
  // Initialize user state from local storage
  // Add other initial state properties for other reducers if needed
};

const store = configureStore({
  reducer: {
    user: userReducer,
    project: projectsReducer,
    // Add other reducers here
  },
  preloadedState: initialState, // Set the preloaded state with the initial state
});

store.subscribe(() => {
  const userState = store.getState().user;
  localStorage.setItem("user", JSON.stringify(userState)); // Update local storage with updated user state
  const projectState = store.getState().project;
  localStorage.setItem("project", JSON.stringify(projectState));
});


export default store;
