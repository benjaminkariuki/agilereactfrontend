import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Toast } from "primereact/toast";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [departments] = useState([
    "Porfolio Managers Department",
    "Web Department",
    "Business Central Department",
    "Infrastructure Department",
    "Business Analyst Department",
    "Implementation Department",
  ]);
  const departmentRolesMapping = {
    "Porfolio Managers Department": [
      "Project manager",
      "Senior project manager",
      "Administrator",
    ],

    "Web Department": ["Team lead web", "developer"],

    "Business Central Department": [
      "Team lead business central",
      "Business central team",
    ],

    "Infrastructure Department": [
      "Team lead infrastructure",
      "infrastructure team",
    ],

    "Business Analyst Department": [
      "business analyst",
      "Team lead business analyst",
    ],

    "Implementation Department": [
      "Team lead Implementation",
      "business analyst",
    ],
  };
  const [roles, setRoles] = useState([]);
  const baseUrl = "http://192.168.88.150:8000/storage/";
  const [filteredRoles, setfilteredroles] = useState([]);
  const toast = useRef(null);

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
    if (error) {
      toast.current?.show({
        severity: "warn",
        summary: "Error updating user",
        detail: `${error}`,
        life: 3000,
      });
    }
  };

  const onFetchingRoles = (error) => {
    if (error) {
      toast.current.show({
        severity: "warn",
        summary: "Error fetching roles",
        detail: `${error}`,
        life: 3000,
      });
    }
  };

  const onCreatingUserInfo = (error) => {
    if (error) {
      toast.current.show({
        severity: "info",
        summary: "Server Error",
        detail: `${error}`,
        life: 3000,
      });
    }
  };

  useEffect(() => {
    if (selectedUser && selectedUser.department in departmentRolesMapping) {
      const departmentRoles = departmentRolesMapping[selectedUser.department];
      console.log(roles);
      const filteredRoles = roles.filter((role) =>
        departmentRoles.includes(role.name)
      );
      setfilteredroles(filteredRoles);
    } else {
      console.log("Department not found in mapping.");
    }
  }, [selectedUser]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = () => {
    axios
      .get("http://192.168.88.150:8000/api/allUsers")
      .then((response) => {
        setUsers(response.data.users);
      })
      .catch((error) => {
        console.log("Error getting users:", error);
      });
  };

  const fetchRoles = () => {
    axios
      .get("http://192.168.88.150:8000/api/allRoles")
      .then((response) => {
        setRoles(response.data.roles);
      })
      .catch((error) => {
        console.log("Error getting roles:", error);
      });
  };

  const handleDeleteUser = (userId) => {
    axios
      .delete(`http://192.168.88.150:8000/api/deleteUsers/${userId}`)
      .then(() => {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      })
      .catch((error) => {
        console.log("Error deleting user:", error);
      });
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleUpdateUser = (updatedUser) => {
    console.log(updatedUser);
    axios
      .put(
        `http://192.168.88.150:8000/api/updateUsers/${updatedUser.id}`,
        updatedUser
      )
      .then((response) => {
        if (response.status === 200) {
          onSuccessUpdate(response.data.message);
          console.log(response);
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === response.data.id ? response.data : user
            )
          );
          setEditModalOpen(false);
          setSelectedUser(null);
          fetchUsers();
        }
      })
      .catch((error) => {
        onErrorUpdate(error.message);
        console.log("Error updating user:", error);
      });
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  const renderUserList = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start md:items-center">
              <div className="w-2/3">
                <p className="text-gray-500 mb-2 break-words">
                  <span className="font-semibold">Full names:</span>{" "}
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-gray-500 mb-2 break-words">
                  <span className="font-semibold">Email:</span> {user.email}
                </p>
                <p className="text-gray-500 mb-2 break-words">
                  <span className="font-semibold">Contact:</span>{" "}
                  {user.contacts}
                </p>
                <p className="text-gray-500 mb-2 break-words">
                  <span className="font-semibold">Department:</span>{" "}
                  {user.department ? user.department : ""}
                </p>
                <p className="text-gray-500 mb-2 break-words">
                  <span className="font-semibold">Role:</span>{" "}
                  {user.role ? user.role.name : ""}
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
                  <button
                    onClick={() => handleEditUser(user)}
                    className="px-4 py-2 mb-2 bg-blue-500 text-white rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md"
                  >
                    Delete
                  </button>
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
      <Toast ref={toast} position="top-rigth" />

      <h1 className="text-3xl font-bold mb-4 text-center text-blue-800">
        Users
      </h1>
      {renderUserList()}

      {/* Edit User Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="bg-white p-4 shadow-lg rounded-lg z-10">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <form>
              <div className="mb-4">
                <label htmlFor="email" className="block font-semibold mb-1">
                  Email:
                </label>
                <input
                  type="text"
                  id="email"
                  className="border rounded px-2 py-1 w-full"
                  defaultValue={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, email: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label htmlFor="contact" className="block font-semibold mb-1">
                  Contact:
                </label>
                <input
                  type="text"
                  id="contact"
                  className="border rounded px-2 py-1 w-full"
                  defaultValue={selectedUser.contacts}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      contacts: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="department"
                  className="block font-semibold mb-1"
                >
                  Department:
                </label>
                <select
                  className="border rounded w-full py-1 px-2"
                  id="department"
                  value={selectedUser.department || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      department: e.target.value,
                    })
                  }
                >
                  <option value="" disabled>
                    Select a department
                  </option>
                  {departments.map((department, index) => (
                    <option key={index} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="role" className="block font-semibold mb-1">
                  Role:
                </label>
                <select
                  className="border rounded w-full py-1 px-2"
                  id="role"
                  defaultValue={selectedUser.role ? selectedUser.role.id : ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      role_id: e.target.value,
                    })
                  }
                >
                  <option value="" disabled>
                    Select a role
                  </option>
                  {filteredRoles.map((role, index) => (
                    <option key={index} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 bg-red-500 text-white rounded-md mr-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateUser(selectedUser)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
