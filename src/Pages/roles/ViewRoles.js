import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Toast } from "primereact/toast";

const ViewRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const toast = useRef(null);

  const onSuccessDeleteRole = (success) => {
    if (success) {
      toast.current.show({
        severity: "info",
        summary: "Deleted successfully",
        detail: `Name: ${success}`,
        life: 3000,
      });
    }
  };

  // Function to show a warning toast when fetching activities fails
  const onDeleteRole = (error) => {
    if (error) {
      toast.current.show({
        severity: "warn",
        summary: "Error deleting role",
        detail: `${error}`,
        life: 3000,
      });
    }
  };
  const onFetchingRoles = (error) => {
    if (error) {
      toast.current.show({
        severity: "warn",
        summary: "Error getting roles",
        detail: `${error}`,
        life: 3000,
      });
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [errorMessage]);

  const fetchRoles = async () => {
    try {
      const response = await axios.get(
        "http://192.168.88.150:8000/api/allRoles"
      );
      const fetchedRoles = response.data.roles;
      setRoles(fetchedRoles);
      if (response.status === 200) {
        setErrorMessage("");
      }
    } catch (error) {
      setErrorMessage("Failed to get roles");
      onFetchingRoles(errorMessage);
    }
  };

  const handleDeleteRole = async (roleId) => {
    setLoadingStates((prevStates) => ({
      ...prevStates,
      [roleId]: true,
    }));

    try {
      const response = await axios.delete(
        `http://192.168.88.150:8000/api/deleteRoles/${roleId}`
      );

      if (response.status === 200) {
        setLoadingStates((prevStates) => ({
          ...prevStates,
          [roleId]: false,
        }));
        fetchRoles();
        onSuccessDeleteRole(response.data.message);
      } else {
        if (response.status === 404) {
          onDeleteRole(response.data.message);
        }
        if (response.status === 500) {
          onDeleteRole(response.data.message);
        } else {
          onDeleteRole(response.data.message);
        }

        setLoadingStates((prevStates) => ({
          ...prevStates,
          [roleId]: false,
        }));
      }
    } catch (error) {
      setLoadingStates((prevStates) => ({
        ...prevStates,
        [roleId]: false,
      }));

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        onDeleteRole(error.response.data.message);
      } else {
        onDeleteRole("Failed to delete role");
      }
    }
  };

  return (
    <div className="flex justify-center items-center pt-6">
      <Toast ref={toast} />
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded shadow">
          <h2 className="text-2xl font-bold mb-4 text-center">View Roles</h2>

          <div className="space-y-4">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center justify-between">
                <span>{role.name}</span>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                  disabled={loadingStates[role.id]}
                  onClick={() => handleDeleteRole(role.id)}
                >
                  {loadingStates[role.id] ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRoles;
