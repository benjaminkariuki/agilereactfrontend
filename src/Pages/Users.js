import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import _ from "lodash";
import { Paginator } from "primereact/paginator";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const [departments] = useState([
    "Management",
    "Administration",
    "Web And Mobile",
    "Project Managers",
    "Business Central",
    "Infrastructure",
    "Implementation",
    "Finance",
    "Human Resource",
    "Sales and Marketing",
    "Sales",
  ]);

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

  const onError = (error) => {
    if (error) {
      toast.current?.show({
        severity: "danger",
        summary: "Error Encountered",
        detail: handleErrorMessage(error),
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
      accept: () => {
        handleDeleteUser(id);
      },
      reject: () => {
        // You can perform any logic if needed when the user clicks "No" or simply do nothing
      },
    });
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = () => {
    setIsLoading(true);
    const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

    axios
      .get(`https://agile-pm.agilebiz.co.ke/api/allUsers?page=${page + 1}`, config)
      .then((response) => {
        setUsers(response.data.users.data);
        setTotalRecords(response.data.users.total);
        setIsLoading(false);
      })
      .catch((error) => {
        onError(error);
        setIsLoading(false);
      });
  };

  const fetchRoles = () => {

    const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

    axios
      .get("https://agile-pm.agilebiz.co.ke/api/allRoles",config)
      .then((response) => {
        setRoles(response.data.roles);
      })
      .catch((error) => {
        onError(error);
      });
  };

  const handleDeleteUser = (userId) => {

    const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

    axios
      .delete(`https://agile-pm.agilebiz.co.ke/api/deleteUsers/${userId}`,config)
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

    const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

    axios
      .post(
        `https://agile-pm.agilebiz.co.ke/api/updateUserDetails/${selectedUser.id}`,
        formData,
        config
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
        const errorMessage = handleErrorMessage(error.response.data);

        onErrorUpdate(errorMessage);
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

  const handleSearch = () => {
    if (searchTerm && searchTerm.trim() !== '') {
      setIsLoading(true);

      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
      // Modify the endpoint to accommodate the searchTerm in the query string 
      axios
        .get(`https://agile-pm.agilebiz.co.ke/api/allUsers?page=${page + 1}&searchTerm=${searchTerm}`,config)
        .then((response) => {
          setUsers(response.data.users.data);
          setTotalRecords(response.data.users.total);
          setIsLoading(false);
        })
        .catch((error) => {
          onError(error);
          setIsLoading(false);
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
    label: department,
    value: department,
  }));
  const roleOptions = roles.map((role) => ({
    label: role.name,
    value: role.id,
  }));

  const renderUserList = () => {

    if (users.length === 0) {
      return <div>No users found</div>;
    }
    return (
     
      
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {users.map((user) => (
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
                <p className="text-gray-500 mb-2 break-words">
                  <span className="font-semibold">Department:</span>{" "}
                  {user.department ? _.startCase(user.department) : ""}
                </p>
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

      <h1 className="text-xl font-bold mb-4 text-center text-blue-500">
        Users
      </h1>

      <div className="mb-4 flex justify-end">
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

       {users.length > 0 ? (<Paginator
          first={page * 10}
          rows={10}
          totalRecords={totalRecords}
          onPageChange={(e) => {
            setPage(e.page);
          }}
          template={{ layout: "PrevPageLink CurrentPageReport NextPageLink" }}
        />): ''
}

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
