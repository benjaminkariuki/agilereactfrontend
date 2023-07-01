import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const Users = () => {
  const [users, setUsers] = useState([]);
  const userProfilePhoto = useSelector((state) => state.user.userProfilePhoto);
  const userRole = useSelector((state) => state.user.userRole);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios
      .get("http://192.168.1.106:8001/users")
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.log("Error fetching users:", error);
      });
  };

  const handleDeleteUser = (userId) => {
    if (userRole === "COO") {
      axios
        .delete(`http://192.168.1.106:8001/users/${userId}`)
        .then(() => {
          setUsers((prevUsers) =>
            prevUsers.filter((user) => user.id !== userId)
          );
        })
        .catch((error) => {
          console.log("Error deleting user:", error);
        });
    }
  };

  const renderUserListByRole = (role, roleHeaderClass) => {
    return (
      <div key={role}>
        <h2 className={`text-2xl font-bold mt-8 ${roleHeaderClass}`}>{role}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users
            .filter((user) => user.role === role)
            .map((user) => (
              <div key={user.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-center mb-2">
                  <img
                    src={process.env.PUBLIC_URL + userProfilePhoto}
                    alt="Profile"
                    className="rounded-full h-20 w-20 object-cover"
                  />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold">{`${user.firstName} ${user.lastName}`}</h2>
                  {userRole === "COO" && (
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-500 font-semibold"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div className="mb-2">
                  <span className="text-gray-500">{user.email}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-center text-3xl font-bold mb-4 text-blue-800">
        Users
      </h1>
      {renderUserListByRole("COO", "text-red-500 text-center")}
      {renderUserListByRole("Project Manager", "text-blue-500 text-center")}
      {renderUserListByRole("Team Lead", "text-yellow-500 text-center")}
      {renderUserListByRole("Developer", "text-green-500 text-center")}
      {renderUserListByRole("Business Analyst", "text-purple-500 text-center")}
    </div>
  );
};

export default Users;
