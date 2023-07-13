import React, { useEffect, useState } from "react";
import axios from "axios";

const ViewRoles = () => {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get(
        "http://192.168.88.187:8000/api/allRoles"
      );
      const fetchedRoles = response.data.roles;
      setRoles(fetchedRoles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setError("Failed to fetch roles");
    }
  };
  const handleDeleteRole = async (roleId) => {
    setIsLoading(true);

    try {
      const response = await axios.delete(
        `http://192.168.88.187:8000/api/deleteRoles/${roleId}`
      );

      if (response.status === 200) {
        setIsLoading(false);
        // Handle successful deletion
      } else {
        console.log("Failed to delete role:", response.data.message);
        setError("Failed to delete role:", response.data.message);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("Failed to delete role");
      }
    }
  };

  return (
    <div className="flex justify-center items-center pt-6">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded shadow">
          <h2 className="text-2xl font-bold mb-4 text-center">View Roles</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="table-responsive">
            <table className="table-auto w-full">
              <thead>
                <tr>
                  <th className="py-2">Role Name</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td className="py-2">{role.name}</td>
                    <td className="py-2">
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                        disabled={isLoading}
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        {isLoading ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRoles;
