import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
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
  const baseUrl = "https://agile-pm.agilebiz.co.ke/storage/";
  const [filteredRoles, setfilteredroles] = useState([]);
  const toast = useRef(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updatedUser, setUpdateUser] = useState({
    contacts: "",
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
    if (error) {
      toast.current?.show({
        severity: "warn",
        summary: "Error updating user",
        detail: `${error}`,
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

  const onError = (error) => {
    if (error) {
      toast.current?.show({
        severity: "danger",
        summary: "Error Encountered",
        detail: `${error}`,
        life: 3000,
      });
    }
  };

  const confirmDelete = (id) => {
    confirmDialog({
      message: "Do you want to delete this record?",
      header: "Delete Confirmation",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept: () => handleDeleteUser(id),
    });
  };

  useEffect(() => {
    if (updatedUser.department in departmentRolesMapping) {
      const departmentRoles = departmentRolesMapping[updatedUser.department];
      const filteredRoles = roles.filter((role) =>
        departmentRoles.includes(role.name)
      );
      setfilteredroles(filteredRoles);
    }
  }, [updatedUser]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = () => {
    axios
      .get("https://agile-pm.agilebiz.co.ke/api/allUsers")
      .then((response) => {
        setUsers(response.data.users);
      })
      .catch((error) => {
        onError(error.response.data.message);
      });
  };

  const fetchRoles = () => {
    axios
      .get("https://agile-pm.agilebiz.co.ke/api/allRoles")
      .then((response) => {
        setRoles(response.data.roles);
      })
      .catch((error) => {
        onError(error.response.data.message);
      });
  };

  const handleDeleteUser = (userId) => {
    axios
      .delete(`https://agile-pm.agilebiz.co.ke/api/deleteUsers/${userId}`)
      .then((response) => {
        onDeleteUser(response.data.message);
        fetchUsers();
      })
      .catch((error) => {
        onError(error.response.data.message);
      });
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleUpdateUser = () => {
    console.log(updatedUser);
    console.log(selectedUser);
    setUpdateLoading(true);
    const formData = new FormData();
    formData.append("contacts", updatedUser.contacts);
    formData.append("department", updatedUser.department);
    formData.append("role", updatedUser.role);
    axios
      .post(
        `https://agile-pm.agilebiz.co.ke/api/updateUserDetails/${selectedUser.id}`,
        formData
      )
      .then((response) => {
        setTimeout(() => {
          onSuccessUpdate(response.data.message);
        }, 1000);
        setEditModalOpen(false);
        setSelectedUser([]);
        setUpdateLoading(false);
        setUpdateUser({
          contacts: "",
          department: "",
          role: "",
        });
        fetchUsers();
      })
      .catch((error) => {
        onErrorUpdate(error.response.data.message);
        setUpdateLoading(false);
      });
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
    setSelectedUser([]);
    setUpdateUser({
      contacts: "",
      department: "",
      role: "",
    });
  };

  const departmentOprions = departments.map((department) => ({
    label: department,
    value: department,
  }));
  const roleOptions = filteredRoles.map((role) => ({
    label: role.name,
    value: role.id,
  }));

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
                    onClick={() => confirmDelete(user.id)}
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
      <Toast ref={toast} />
      <ConfirmDialog />
      <h1 className="text-3xl font-bold mb-4 text-center text-blue-800">
        Users
      </h1>
      {renderUserList()}

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
            <label htmlFor="contact" className="block font-semibold mb-1">
              Contact:
            </label>
            <input
              type="text"
              id="contact"
              className="border rounded px-2 py-1 w-full"
              defaultValue={selectedUser.contacts}
              onChange={(e) =>
                setUpdateUser({
                  ...updatedUser,
                  contacts: e.target.value,
                })
              }
            />
          </div>
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
