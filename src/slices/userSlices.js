import { createSlice } from "@reduxjs/toolkit";

// Create the createUser asynchronous action
const storedUser = JSON.parse(sessionStorage.getItem("user")) || {};

const userSlice = createSlice({
  name: "user",
  initialState: {
     loggedIn: storedUser ? true : false,


    userId: storedUser.id || null,
    userFName: storedUser.firstName || "",
    userLName: storedUser.lastName || "",
    userEmail: storedUser.email || "",
    userContacts: storedUser.contacts || "",
    userDepartment: storedUser.department || "",
    userRole: storedUser.roleName || "",
    userProfilePhoto: storedUser.profile_pic || "",
    userActivities: storedUser.activities || [],
    users: [],
    error: null,
  },
  reducers: {
    login: (state, action) => {
     state.loggedIn = true;
      state.userId = action.payload.id;
      state.userFName = action.payload.firstName;
      state.userLName = action.payload.lastName;
      state.userRole = action.payload.roleName;
      state.userDepartment = action.payload.department;
      state.userEmail = action.payload.email;
      state.userContacts = action.payload.contacts;
      state.userProfilePhoto = action.payload.profile_pic;
      state.userActivities = action.payload.activities;
    },
    logout: (state) => {
     state.loggedIn = false;
      state.userFName = "";
      state.userLName = "";
      state.userEmail = "";
      state.userContacts = "";
      state.userDepartment = "";
      state.userRole = "";
      state.userProfilePhoto = "";
      state.userActivities = [];
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
    },
    updateUser: (state, action) => {
       state.loggedIn = true;
      state.userId = action.payload.id;
      state.userFName = action.payload.firstName;
      state.userLName = action.payload.lastName;
      state.userRole = action.payload.roleName;
      state.userEmail = action.payload.email;
      state.userDepartment = action.payload.department;
      state.userContacts = action.payload.contacts;
      state.userProfilePhoto = action.payload.profile_pic;
      state.userActivities = action.payload.activities;
    },
  },
});

export const { login, logout, updateUser } = userSlice.actions;
export default userSlice.reducer;
