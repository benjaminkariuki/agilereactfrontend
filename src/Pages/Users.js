import React, { useEffect, useState } from "react";
//import { useSelector } from "react-redux";
import axios from "axios";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  //const userProfilePhoto = useSelector((state) => state.user.userProfilePhoto);
  //const userRole = useSelector((state) => state.user.userRole);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios
      .get("http://192.168.88.187:8000/api/allUsers")
      .then((response) => {
        setUsers(response.data.users);
      })
      .catch((error) => {
        console.log("Error fetching users:", error);
      });
  };

  const handleDeleteUser = (userId) => {
    axios
      .delete(`http://192.168.1.106:8000/api/users/${userId}`)
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
    // Make API call to update user details
    axios
      .put(`http://192.168.1.106:8000/api/users/${updatedUser.id}`, updatedUser)
      .then((response) => {
        // Update the users list with the updated user
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === response.data.id ? response.data : user
          )
        );
        setEditModalOpen(false);
        setSelectedUser(null);
      })
      .catch((error) => {
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
                  <span className="font-semibold">Role:</span>{" "}
                  {user.role ? user.role.name : ""}
                </p>
                <p className="text-gray-500 mb-2 break-words">
                  <span className="font-semibold">others:</span>{" "}
                  {user.secondaryRole}
                </p>
              </div>
              <div className="w-1/3 flex flex-col items-end justify-between ml-4">
                <div className="w-20 h-20 rounded-full overflow-hidden">
                  <img
                    src={process.env.PUBLIC_URL + "/profile2.jpeg"}
                    alt="Profile"
                    className="object-cover w-full h-full"
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
    <div className="w-full">
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
                  value={selectedUser.email}
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
                  value={selectedUser.contact}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      contact: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="primaryRole"
                  className="block font-semibold mb-1"
                >
                  Role:
                </label>
                <input
                  type="text"
                  id="primaryRole"
                  className="border rounded px-2 py-1 w-full"
                  value={selectedUser.primaryRole}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      primaryRole: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="secondaryRole"
                  className="block font-semibold mb-1"
                >
                  Acting Role:
                </label>
                <input
                  type="text"
                  id="secondaryRole"
                  className="border rounded px-2 py-1 w-full"
                  value={selectedUser.secondaryRole}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      secondaryRole: e.target.value,
                    })
                  }
                />
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
                  type="submit"
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
