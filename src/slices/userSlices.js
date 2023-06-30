import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    loggedIn: false,
    userId: null,
    userFName: "",
    userLName: "",
    userEmail: "",
    userRole: "",
    userProfilePhoto: "",
    users: [],
  },
  reducers: {
    login: (state, action) => {
      state.loggedIn = true;
      state.userId = action.payload.id;
      state.userFName = action.payload.firstName;
      state.userLName = action.payload.lastName;
      state.userRole = action.payload.role;
      state.userEmail = action.payload.email;
      state.userProfilePhoto = action.payload.profilephoto;
    },
    logout: (state) => {
      state.loggedIn = false;
      state.userFName = "";
      state.userLName = "";
      state.userEmail = "";
      state.userRole = "";
      state.userProfilePhoto = "";
      localStorage.removeItem("user");
    },
    updateUser: (state, action) => {
      state.userFName = action.payload.userFName;
      state.userLName = action.payload.userLName;
      state.userEmail = action.payload.userEmail;
      state.userRole = action.payload.userRole;
      state.userProfilePhoto = action.payload.userProfilePhoto;
      // Store the updated user data in local storage
      localStorage.setItem("user", JSON.stringify(state));
    },
    createUser: (state, action) => {
      // Dispatch an API request to the server
      fetch("http://192.168.88.188:8001/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(action.payload),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
});

export const { login, logout, updateUser, createUser } = userSlice.actions;
export default userSlice.reducer;
