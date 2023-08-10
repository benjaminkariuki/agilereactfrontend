import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../slices/userSlices";

const storedUser = localStorage.getItem("user");

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : {},
};

const store = configureStore({
  reducer: {
    user: userReducer,

    // Add other reducers here
  },
  preloadedState: initialState, // Set the preloaded state with the initial state
});

store.subscribe(() => {
  const userState = store.getState().user;
  localStorage.setItem("user", JSON.stringify(userState)); // Update local storage with updated user state
});

export default store;
