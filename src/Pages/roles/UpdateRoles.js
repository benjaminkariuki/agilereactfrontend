import React, { useEffect, useState } from "react";
import axios from "axios";

const UpdateRoles = () => {
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [errorActivity, setErrorActivity] = useState(null);
  const [showEditActivities, setShowEditActivities] = useState(false);
  const [allActivities, setAllActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalData, setmodalData] = useState([]);

  useEffect(() => {
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

    fetchRoles();
  }, []);

  useEffect(() => {
    const fetchAllActivities = async () => {
      try {
        const response = await axios.get(
          "http://192.168.88.187:8000/api/activitiesAll"
        );
        const fetchedActivities = response.data.activities;
        setAllActivities(fetchedActivities);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    fetchAllActivities();
  }, []);

  useEffect(() => {
    const initializeSelectedActivities = () => {
      if (selectedRole) {
        const selectedRoleData = roles.find((role) => role.id === selectedRole);
        if (selectedRoleData) {
          setSelectedActivities(selectedRoleData.activities);
        }
      }
    };

    initializeSelectedActivities();
  }, [roles, selectedRole]);

  const handleRoleChange = async (event) => {
    const roleId = event.target.value;
    setSelectedRole(roleId);

    try {
      const roleResponse = await axios.get(
        `http://192.168.88.187:8000/api/allRolesWithId/${roleId}`
      );

      if (roleResponse.data.roles && roleResponse.data.roles.length > 0) {
        const selectedRoleData = roleResponse.data.roles[0];
        setmodalData(roleResponse.data.roles[0]);

        setSelectedActivities(selectedRoleData.activities);
        setErrorActivity(null);
      } else {
        setErrorActivity("Failed to fetch role activities");
        setSelectedActivities([]);
      }
    } catch (error) {
      console.error("Error fetching role activities:", error);
      setErrorActivity("Failed to fetch role activities");
      setSelectedActivities([]);
    }
  };
  const openEditActivities = () => {
    setShowEditActivities(!showEditActivities);
  };

  const closeEditActivities = () => {
    setShowEditActivities(!showEditActivities);
  };
  //THE NEW CODE FOR UPDATING ROLES

  const handleModalSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const selectedActivities = Array.from(event.target.activities)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => ({
        id: checkbox.value,
        permissions: getSelectedPermissions(checkbox.value),
      }));

    if (selectedActivities.length === 0) {
      setErrorActivity("Please select at least one activity.");
      setIsLoading(false);
      return;
    }

    const activitiesWithNoPermissions = selectedActivities.filter(
      (activity) => activity.permissions.length === 0
    );

    if (activitiesWithNoPermissions.length > 0) {
      setErrorActivity(
        "Assign at least one permission to each selected activity."
      );
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        `http://192.168.88.187:8000/api/updateRoles/${selectedRole}`,
        {
          roleName: event.target.rolename.value,
          activities: selectedActivities,
        }
      );

      if (response.status === 201) {
        event.target.reset();
        setIsLoading(false);
      } else {
        console.log("Failed to update role:", response.data.message);
        setError("Failed to update role:", response.data.message);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.mnameessage);
      } else {
        setError("Failed to create role");
      }
    }
  };

  const getSelectedPermissions = (activityId) => {
    const permissions = [];

    const readCheckbox = document.querySelector(
      `#read-permission-${activityId}`
    );
    const writeCheckbox = document.querySelector(
      `#write-permission-${activityId}`
    );

    if (readCheckbox && readCheckbox.checked) {
      permissions.push("read");
    }

    if (writeCheckbox && writeCheckbox.checked) {
      permissions.push("write");
    }

    return permissions;
  };

  return (
    <div className="flex justify-center items-center pt-6">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded shadow">
          <h2 className="text-2xl font-bold mb-4 text-center">Update Role</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {errorActivity && (
            <p className="text-red-500 mb-4">{errorActivity}</p>
          )}
          <form>
            <div className="mb-4">
              <label
                htmlFor="roleSelect"
                className="block text-gray-700 font-bold mb-2"
              >
                Select Role
              </label>
              <select
                name="role"
                id="roleSelect"
                className="w-full px-4 py-2 border rounded-lg"
                onChange={handleRoleChange}
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option value={role.id} key={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedRole && (
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Activities
                </label>
                <ol className="list-decimal pl-4">
                  {selectedActivities.map((activity, index) => (
                    <li
                      key={`${activity.activityId}-${index}`}
                      className="text-gray-700 mb-2"
                    >
                      <div className="font-medium">{activity.name}</div>
                      <div className="text-gray-500">
                        Permissions: {activity.pivot.permissions}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {selectedRole && (
              <div className="text-center">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold"
                  onClick={openEditActivities}
                  type="button"
                >
                  Edit Activities
                </button>
              </div>
            )}
          </form>
        </div>
        {showEditActivities && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded shadow max-h-full overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Edit Activities
              </h2>
              <form onSubmit={handleModalSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="roleName"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    Role Name
                  </label>
                  <input
                    type="text"
                    name="rolename"
                    className="w-full px-4 py-2 border rounded-lg"
                    id="roleName"
                    required
                    defaultValue={modalData.name}
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="activities"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    Activities
                  </label>
                  {allActivities.map((activity) => (
                    <div className="flex items-center mb-2" key={activity.id}>
                      <div className="w-full">
                        <label
                          className="flex items-center cursor-pointer"
                          htmlFor={`activity-${activity.id}`}
                        >
                          <input
                            className="form-checkbox text-blue-500 appearance-none h-5 w-5 mr-2 border border-gray-300 rounded-md checked:bg-blue-500 checked:border-transparent focus:outline-none"
                            type="checkbox"
                            name="activities"
                            value={activity.id}
                            id={`activity-${activity.id}`}
                            defaultChecked={modalData.activities.some(
                              (act) => act.id === activity.id
                            )}
                          />
                          <span className="text-gray-700">{activity.name}</span>
                        </label>
                        <div className="ml-7">
                          <label
                            className="inline-flex items-center cursor-pointer"
                            htmlFor={`read-permission-${activity.id}`}
                          >
                            <input
                              className="form-checkbox text-blue-500 appearance-none h-4 w-4 mr-1 border border-gray-300 rounded-md checked:bg-blue-500 checked:border-transparent focus:outline-none"
                              type="checkbox"
                              name={`read-permission-${activity.id}`}
                              id={`read-permission-${activity.id}`}
                              defaultChecked={
                                modalData.activities.find(
                                  (act) =>
                                    act.id === activity.id &&
                                    act.pivot.permissions.includes("read")
                                ) !== undefined
                              }
                            />
                            <span className="text-gray-700 text-xs">View</span>
                          </label>
                          <label
                            className="inline-flex items-center cursor-pointer ml-4"
                            htmlFor={`write-permission-${activity.id}`}
                          >
                            <input
                              className="form-checkbox text-blue-500 appearance-none h-4 w-4 mr-1 border border-gray-300 rounded-md checked:bg-blue-500 checked:border-transparent focus:outline-none"
                              type="checkbox"
                              name={`write-permission-${activity.id}`}
                              id={`write-permission-${activity.id}`}
                              defaultChecked={
                                modalData.activities.find(
                                  (act) =>
                                    act.id === activity.id &&
                                    act.pivot.permissions.includes("write")
                                ) !== undefined
                              }
                            />
                            <span className="text-gray-700 text-xs">
                              Modify
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating..." : "Update"}
                  </button>
                  <button
                    className="bg-red-500 text-white py-2 px-4 rounded-lg font-bold"
                    onClick={closeEditActivities}
                    type="button"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateRoles;
