import React, { useState, useEffect } from "react";
import SideBar from "./SideBar.Component";
import * as AiIcons from "react-icons/ai";
import Dashboard from "../Pages/Dashboard";
import ManageSprints from "../Pages/ManageSprints";
import Task from "../Pages/Task";
import Users from "../Pages/Users";
import CreateUser from "../Pages/Create";
import { Route, Routes, useNavigate } from "react-router-dom";
import ManageProjects from "../Pages/ManageProjects";
import ProfileSettings from "../Pages/ProfileSettings";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../slices/userSlices";
import ManageRoles from "../Pages/manageRoles";
import ProtectedRoute from "./ProtectedRoute";

const Home = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isOpenProfile, setIsOpenProfile] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userRole, userEmail, userFName, userLName, userProfilePhoto } =
    useSelector((state) => state.user);

  const baseUrl = "https://agile-pm.agilebiz.co.ke/storage/";
  // Use useEffect to check login status on component mount
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    // Check if user exists in sessionStorage
    if (user) {
      // Dispatch the login action to update the user state
      dispatch(login(user));
    } else {
      // User details not found, navigate to login page or perform other actions
      navigate("/");
    }
  }, [dispatch, navigate]);
  const handleLinkClick = () => {
    // Perform additional actions here
    // Navigate to the specified URL
    navigate("/dashboard/editprofile");
  };
  const handleLogout = () => {
    // Dispatch the logout action
    dispatch(logout());
    // Redirect to the login page or any other desired page
    navigate("/");
  };
  const toggleDropdown = () => {
    setIsOpenProfile(!isOpenProfile);
  };

  return (
    <div className="flex flex-col h-screen min-w-[400px]">
      {/* Header */}
      <div className="flex items-center justify-start bg-white px-4 py-2">
        {/* Logo */}
        <img
          src={process.env.PUBLIC_URL + "/logo192.png"}
          className="w-10 h-10"
          alt="Logo"
        />
        <h1 className="ml-1 text-2xl font-bold text-blue-800">Agile PM</h1>
        {/* Sidebar toggle button */}
        <div className="text-3xl">
          <AiIcons.AiOutlineMenu
            onClick={() => setIsOpen(!isOpen)}
            className="text-black ml-3 cursor-pointer"
          />
        </div>
        {/* User profile */}
        <div className="ml-auto flex items-center">
          <div className="ml-auto flex items-center">
            <div className="ml-auto mr-3 flex flex-col items-center">
              <p className="text-center">
                {userFName} {userLName}
              </p>
              <div className="text-sm text-gray-500 text-center">
                <span className="hidden sm:inline">{userEmail}</span>
                <br className="hidden sm:hidden" />
                <span className="sm:hidden">{userRole}</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full cursor-pointer ${
                  isOpenProfile ? "animate-bounce" : ""
                }`}
                onClick={toggleDropdown}
              >
                <img
                  src={
                    userProfilePhoto
                      ? baseUrl + userProfilePhoto
                      : process.env.PUBLIC_URL + "/profile2.jpeg"
                  }
                  alt="User"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>

            {/* Dropdown menu */}
            {isOpenProfile && (
              <div className="absolute right-0 mt-2 bg-white rounded shadow-md">
                <ul className="flex flex-col w-48 py-2">
                  <li
                    className="px-4 py-2 hover:bg-blue-200"
                    onClick={handleLinkClick}
                    style={{ cursor: "pointer" }}
                  >
                    Profile Settings
                  </li>
                  <li
                    className="border-t px-4 py-2 hover:bg-blue-200"
                    onClick={handleLogout} // Add the onClick event for logging out
                    style={{ cursor: "pointer" }}
                  >
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <SideBar isOpen={isOpen} userRole={userRole} />
        <div className="flex-grow bg-blue-50">
          <Routes>
            <Route path="/home" element={<Dashboard />} />
            <Route
              path="/project"
              element={
                <ProtectedRoute
                  page={<ManageProjects />}
                  requiredActivity={"../dashboard/project"}
                />
              }
            />
            <Route
              path="/sprints"
              element={
                <ProtectedRoute
                  page={<ManageSprints />}
                  requiredActivity={"../dashboard/sprints"}
                />
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute
                  page={<Task />}
                  requiredActivity={"../dashboard/tasks"}
                />
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute
                  page={<Users />}
                  requiredActivity={"../dashboard/users"}
                />
              }
            />
            <Route
              path="/roles"
              element={
                <ProtectedRoute
                  page={<ManageRoles />}
                  requiredActivity={"../dashboard/roles"}
                />
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute
                  page={<CreateUser />}
                  requiredActivity={"../dashboard/create"}
                />
              }
            />
            <Route path="/editprofile" element={<ProfileSettings />} />
          </Routes>
        </div>
      </div>
      {/* Footer component */}
      <footer className="bg-white text-center sticky bottom-0  py-4">
        Designed by © {new Date().getFullYear()}
        <a
          href="https://agilebiz.co.ke/"
          rel="noopener noreferrer"
          target="_blank"
          className="text-blue-600"
        >
          {" "}
          Agile Business Solutions Limited
        </a>
      </footer>
    </div>
  );
};

export default Home;
