import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import _ from "lodash";
import { Paginator } from "primereact/paginator";
import "react-phone-number-input/style.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";

import PhoneInput from "react-phone-number-input";

const Users = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const { userActivities } = useSelector((state) => state.user);
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);

  const [departments, setDepartments] = useState([]);

  //getting the permission for projects
  const UsersActivity = userActivities.find(
    (activity) => activity.name === "Manage users"
  );
  const hasReadPermissionUsers =
    UsersActivity.pivot.permissions.includes("read");

  const hasWritePermissionUsers =
    UsersActivity.pivot.permissions.includes("write");

  const [roles, setRoles] = useState([]);
  const baseUrl = "https://agile-pm.agilebiz.co.ke/storage/";
  const toast = useRef(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [contact, setcontact] = useState();
  const [filterClients, setFilterClients] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [updatedUser, setUpdateUser] = useState({
    department: "",
    role: "",
  });

  const onSuccessUpdate = (success) => {
    if (success) {
      toast.current?.show({
        severity: "success",
        summary: "Successfully",
        detail: `Name: ${success}`,
        life: 3000,
      });
    }
  };

  const onErrorUpdate = (error) => {
    if (error && toast.current) {
      toast.current?.show({
        severity: "warn",
        summary: "Error updating user",
        detail: handleErrorMessage(error),
        life: 3000,
      });
    }
  };

  const onDeleteUser = (error) => {
    if (error) {
      toast.current?.show({
        severity: "info",
        summary: "User deleted successfully",
        detail: `${error}`,
        life: 3000,
      });
    }
  };

  const onFetchingRoles = (error) => {
    if (error && toast.current) {
      toast.current.show({
        severity: "error",
        summary: "Error fetching roles",
        detail: `${error}`,
        life: 3000,
      });
    }
  };

  const onError = (error) => {
    if (error && toast.current) {
      toast.current?.show({
        severity: "danger",
        summary: "Error Encountered",
        detail: handleErrorMessage(error),
        life: 3000,
      });
    }
  };

  const handleProjectSelection = (e, projectId) => {
    const newSelection = [...selectedProjects];
    if (e.target.checked) {
      newSelection.push(projectId);
    } else {
      const index = newSelection.indexOf(projectId);
      if (index > -1) {
        newSelection.splice(index, 1);
      }
    }
    setSelectedProjects(newSelection);
  };

  const confirmDelete = (id) => {
    confirmDialog({
      message: "Do you want to delete this record?",
      header: "Delete Confirmation",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept: () => {
        handleDeleteUser(id);
      },
      reject: () => {
        // You can perform any logic if needed when the user clicks "No" or simply do nothing
      },
    });
  };

  useEffect(() => {
    fetchName();
    fetchUsers();
    fetchRoles();
    fetchDepartments();
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  useEffect(() => {
    if (filterClients) {
      const filtered = users.filter(user => 
        user.role && user.role.name.toLowerCase() === 'client'
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [users, filterClients]);

  const fetchName = async () => {
    try {
      const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

      const response = await fetch(`${API_BASE_URL}/appName`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        navigate("/");
      }

      // Rest of your code...
    } catch (error) {
      // Error handling code...
    }
  };

  const fetchUsers = () => {
    setIsLoading(true);
    const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios
      .get(`${API_BASE_URL}/allUsers?page=${page + 1}`, config)
      .then((response) => {
        if (response.status === 401) {
          navigate("/");
        }
        setUsers(response.data.users.data);
        setTotalRecords(response.data.users.total);

        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);

        onError(error);
      });
  };

  const fetchRoles = () => {
    const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios
      .get(`${API_BASE_URL}/allRoles`, config)
      .then((response) => {
        if (response.status === 401) {
          navigate("/");
        }
        setRoles(response.data.roles);
      })
      .catch((error) => {
        onError(error);
      });
  };

  const fetchDepartments = async () => {
    try {
      const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await fetch(`${API_BASE_URL}/getDepartments`, {
        method: "GET",
        headers: config.headers,
      });

      if (response.status === 401) {
        navigate("/");
      }

      const data = await response.json();
      setDepartments(data.departments);
    } catch (error) {
      onError(error);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await fetch(`${API_BASE_URL}/allProjectsClients`, {
        method: "GET",
        headers: config.headers,
      });

      if (response.status === 401) {
        navigate("/");
      }
      const data = await response.json();
      setProjects(data.data);
    } catch (error) {
      onFetchingRoles("Error  fetching projects");
    }
  };

  const handleDeleteUser = (userId) => {
    fetchName();

    const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios
      .delete(`${API_BASE_URL}/deleteUsers/${userId}`, config)
      .then((response) => {
        if (response.status === 401) {
          navigate("/");
        }
        onDeleteUser(response.data.message);
        fetchUsers();
      })
      .catch((error) => {
        onError(error);
      });
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
    // Update the selectedProjects with the IDs of the user's projects
    const projectIds = user.projects.map((project) => project.id);
    setSelectedProjects(projectIds);
  };

  const handleUpdateUser = () => {
    fetchName();
    setUpdateLoading(true);

    const formData = new FormData();
    formData.append("contacts", contact);
    formData.append("department", updatedUser.department);
    formData.append("role", updatedUser.role);

    // Append project IDs
    selectedProjects.forEach((projectId) => {
      formData.append("projectIds[]", projectId);
    });

    const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data", // This might be needed depending on your backend setup
      },
    };

    axios
      .post(
        `${API_BASE_URL}/updateUserDetails/${selectedUser.id}`,
        formData,
        config
      )
      .then((response) => {
        if (response.status === 401) {
          navigate("/");
        }
        setTimeout(() => {
          onSuccessUpdate(response.data.message);
        }, 1000);
        setEditModalOpen(false);
        setSelectedUser([]);
        setUpdateLoading(false);
        setcontact();
        setUpdateUser({
          department: "",
          role: "",
        });
        fetchUsers();
      })
      .catch((error) => {
        setUpdateLoading(false);
        onErrorUpdate(error);
      });
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
    setSelectedUser([]);
    setcontact();
    setUpdateUser({
      department: "",
      role: "",
    });
  };

  const handleSearch = () => {
    if (searchTerm && searchTerm.trim() !== "") {
      setIsLoading(true);

      const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Reset the page state to 0 whenever a search is performed
      setPage(0);
      // Modify the endpoint to accommodate the searchTerm in the query string
      axios
        .get(
          `${API_BASE_URL}/allUsers?page=${page + 1}&searchTerm=${searchTerm}`,
          config
        )
        .then((response) => {
          if (response.status === 401) {
            navigate("/");
          }
          setUsers(response.data.users.data);
          setTotalRecords(response.data.users.total);
          setIsLoading(false);
        })
        .catch((error) => {
          setIsLoading(false);

          onError(error);
        });
    } else {
      // If there is no search term, just fetch users normally
      fetchUsers();
    }
  };

  const handleErrorMessage = (error) => {
    if (
      error &&
      error.response &&
      error.response.data &&
      error.response.data.errors
    ) {
      // Extract error messages and join them into a single string
      return Object.values(error.response.data.errors).flat().join(" ");
    } else if (error && error.message) {
      // Client-side error (e.g., no internet)
      return error.message;
    }
    // If no errors property is found, return the main message or a default error message
    return error &&
      error.response &&
      error.response.data &&
      error.response.data.message
      ? error.response.data.message
      : "An unexpected error occurred.";
  };

  const departmentOprions = departments.map((department) => ({
    label: department.name,
    value: department.name,
  }));

  const roleOptions = roles.map((role) => ({
    label: role.name,
    value: role.id,
  }));

  const renderUserList = () => {

    const userList = filterClients ? filteredUsers : users;

    if (userList.length  === 0) {
      return <div>No users found</div>;
    }

    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {userList.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start md:items-center">
              <div className="w-2/3">
                <p className="text-gray-500 mb-2 break-words">
                  <span className="font-semibold">Full names:</span>{" "}
                  {_.startCase(`${user.firstName} ${user.lastName}`)}
                </p>
                <p className="text-gray-500 mb-2 break-words">
                  <span className="font-semibold">Email:</span> {user.email}
                </p>

                <p className="text-gray-500 mb-2 break-words">
                  <span className="font-semibold">Contact:</span>{" "}
                  {user.contacts}
                </p>

                {user.role && user.role.name.toLowerCase() !== "client" && (
                  <p className="text-gray-500 mb-2 break-words">
                    <span className="font-semibold">Department:</span>{" "}
                    {_.startCase(user.department)}
                  </p>
                )}

                <p className="text-gray-500 mb-2 break-words">
                  <span className="font-semibold">Role:</span>{" "}
                  {user.role ? _.startCase(user.role.name) : ""}
                </p>
              </div>
              <div className="w-1/3 flex flex-col items-end justify-between ml-4">
                <div className="w-20 h-20 rounded-full overflow-hidden">
                  <img
                    src={
                      user.profile_pic
                        ? baseUrl + user.profile_pic
                        : process.env.PUBLIC_URL + "/profile2.jpeg"
                    }
                    alt="User"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="flex flex-col mt-4">
                  {hasWritePermissionUsers && (
                    <button
                      onClick={() => handleEditUser(user)}
                      className="px-4 py-2 mb-2 bg-blue-500 text-white rounded-md"
                    >
                      Edit
                    </button>
                  )}

                  {hasWritePermissionUsers && (
                    <button
                      onClick={() => confirmDelete(user.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className="w-full"
      style={{ overflowY: "auto", maxHeight: "calc(100vh - 90px)" }}
    >
      <Toast ref={toast} />

      <h1 className="text-xl font-bold mb-4 text-center text-blue-500">
        Users
      </h1>

      <div className="mb-4 flex justify-between">
        <div className="flex justify-end">
          <input
            type="checkbox"
            id="filter-clients"
            checked={filterClients}
            onChange={(e) => setFilterClients(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="filter-clients" className="mr-2">
            Filter Clients
          </label>
          {/* Existing search bar here */}
        </div>

        <input
          type="text"
          placeholder="Search user"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            handleSearch();
          }}
          className="border rounded px-2 py-1 w-1/3 mr-2"
        />
      </div>

      {!isLoading ? (
        renderUserList()
      ) : (
        <div className="flex justify-center items-center h-24">
          <i className="pi pi-spin pi-spinner text-blue-500 text-4xl"></i>
        </div>
      )}

      <div className="mb-6">
        {users.length > 0 ? (
          <Paginator
            first={page * 12}
            rows={12}
            totalRecords={totalRecords}
            onPageChange={(e) => {
              setPage(e.page);
            }}
            template={{ layout: "PrevPageLink CurrentPageReport NextPageLink" }}
          />
        ) : (
          ""
        )}
      </div>

      {/* Edit User Modal */}
      <Dialog
        visible={editModalOpen}
        style={{ width: "60vw" }}
        onHide={handleModalClose}
        header={
          <h2 className="text-xl font-bold mb-4">
            Edit User: {selectedUser.firstName} {selectedUser.lastName}
          </h2>
        }
        className="bg-white p-4 shadow-lg rounded-lg "
        footer={
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={() => handleUpdateUser(selectedUser)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {updateLoading ? (
                <i
                  className="pi pi-spin pi-spinner"
                  style={{ fontSize: "1.38rem" }}
                ></i>
              ) : (
                "Update"
              )}
            </button>
          </div>
        }
      >
        <form>
          <div className="mb-4">
            <label htmlFor="email" className="block font-semibold mb-1">
              Email:
            </label>
            <input
              type="text"
              id="email"
              className="border rounded px-2 py-1 w-full"
              value={selectedUser.email}
              readOnly
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center">
              <label
                className="block text-gray-700  font-bold mb-2 mr-2"
                htmlFor="contact"
              >
                Contacts:
              </label>

              <label
                htmlFor="contact"
                className="block text-sm font-medium mb-2"
              >
                {selectedUser.contacts}
              </label>
            </div>

            <PhoneInput
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              international
              defaultCountry="KE"
              value={contact}
              onChange={setcontact}
            />
          </div>

          {selectedUser.role &&
          selectedUser.role.name.toLowerCase() !== "client" ? (
            <div className="mb-4">
              <label htmlFor="department" className="block font-semibold mb-1">
                Department:
              </label>
              <Dropdown
                id="department"
                value={updatedUser.department}
                options={departmentOprions}
                onChange={(e) =>
                  setUpdateUser({
                    ...updatedUser,
                    department: e.target.value,
                  })
                }
                scrollHeight="200px"
                placeholder={
                  selectedUser.department
                    ? selectedUser.department
                    : "Select a department"
                }
                className="w-full"
              />
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Projects
              </label>
              <input
                type="text"
                placeholder="Search projects"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
              />

              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {projects.map((project, index) => (
                  <div key={index} className="mb-2">
                    <input
                      type="checkbox"
                      id={`project-${project.id}`}
                      value={project.id}
                      checked={selectedProjects.includes(project.id)}
                      onChange={(e) => handleProjectSelection(e, project.id)}
                      className="mr-2 leading-tight"
                    />
                    <label
                      htmlFor={`project-${project.id}`}
                      className="text-gray-700 text-sm"
                    >
                      {project.title}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="role" className="block font-semibold mb-1">
              Role:
            </label>
            <Dropdown
              id="role"
              value={updatedUser.role || ""}
              options={roleOptions}
              onChange={(e) =>
                setUpdateUser({
                  ...updatedUser,
                  role: e.target.value,
                })
              }
              scrollHeight="200px" // Set the scroll height as needed
              className="w-full"
              placeholder={
                selectedUser.role ? selectedUser.role.name : "Select a role"
              }
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default Users;
