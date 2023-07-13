import { createSlice } from "@reduxjs/toolkit";

// Create the createUser asynchronous action

const userSlice = createSlice({
  name: "user",
  initialState: {
    loggedIn: false,
    userId: null,
    baseUrl: "",
    userFName: "",
    userLName: "",
    userEmail: "",
    userContacts: "",
    userRole: "",
    userProfilePhoto: "",
    userActivities: [],
    users: [],
    error: null,
  },
  reducers: {
    login: (state, action) => {
      state.loggedIn = true;
      state.baseUrl = "http://192.168.88.187:8000/storage/";
      state.userId = action.payload.id;
      state.userFName = action.payload.firstName;
      state.userLName = action.payload.lastName;
      state.userRole = action.payload.roleName;
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
      state.userContact = "";
      state.userRole = "";
      state.userProfilePhoto = "";
      state.userActivities = [];
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
    },
    updateUser: (state, action) => {
      state.userFName = action.payload.firstName;
      state.userLName = action.payload.lastName;
      state.userEmail = action.payload.email;
      state.userContact = action.payload.contacts;
      state.userRole = action.payload.role;
      state.userProfilePhoto = action.payload.profilephoto;
      // Check if the password is present in the payload
      if (action.payload.password) {
        // Update the password
        state.userPassword = action.payload.password;
      }

      // Store the updated user data in local storage
    },
  },
});

export const { login, logout, updateUser } = userSlice.actions;
export default userSlice.reducer;
