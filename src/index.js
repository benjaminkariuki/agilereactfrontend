import React from "react";
import ReactDOM from "react-dom/client";
import "./css/index.css";
import { Provider } from "react-redux";
import store from "./store/store";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Navigate,
} from "react-router-dom";
import App from "./App";
import ManageProjects from "./Pages/ManageProjects";
import ForgotPass from "./ForgetPassword";
import PasswordReset from "./PasswordReset";
import Dashboard from "./Pages/Dashboard";
import Home from "./Home/Home";
import ManageSprints from "./Pages/ManageSprints";
import Task from "./Pages/Task";
import Users from "./Pages/Users";
import CreateUser from "./Pages/Create";
import ProfileSettings from "./Pages/ProfileSettings";
import LoginForm from "./Login";
import { useSelector } from "react-redux";

import "primereact/resources/themes/lara-light-indigo/theme.css"; // theme
import "primereact/resources/primereact.css"; // core css
import "primeicons/primeicons.css"; // icons

const ProtectedRoute = ({ element, redirectPath }) => {
  const loggedIn = useSelector((state) => state.user);

  return loggedIn ? element : <Navigate to={redirectPath} />;
};

const router = createBrowserRouter([
  {
    path: "/*",
    element: <App />,
    children: [
      {
        path: "login",
        element: <LoginForm />,
      },
      {
        path: "forgetpassword",
        element: <ForgotPass />,
      },
      {
        path: "resetpassword",
        element: <PasswordReset />,
      },
    ],
  },
  {
    path: "/dashboard/*",
    element: <ProtectedRoute element={<Home />} redirectPath="/" />,
    children: [
      {
        path: "home",
        element: <ProtectedRoute element={<Dashboard />} redirectPath="/" />,
      },
      {
        path: "project",
        element: (
          <ProtectedRoute element={<ManageProjects />} redirectPath="/" />
        ),
      },
      {
        path: "sprints",
        element: <ProtectedRoute element={<ManageSprints />} redirectPath="/" />,
      },
      {
        path: "tasks",
        element: <ProtectedRoute element={<Task />} redirectPath="/" />,
      },
      {
        path: "users",
        element: <ProtectedRoute element={<Users />} redirectPath="/" />,
      },
      {
        path: "create",
        element: <ProtectedRoute element={<CreateUser />} redirectPath="/" />,
      },
      {
        path: "editprofile",
        element: (
          <ProtectedRoute element={<ProfileSettings />} redirectPath="/" />
        ),
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}>
        <Route path="/" element={<App />} />
      </RouterProvider>
    </Provider>
  </React.StrictMode>
);
