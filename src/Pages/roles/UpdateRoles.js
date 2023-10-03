import React, { useEffect, useState, useRef } from "react";
import { Toast } from "primereact/toast";
import axios from "axios";

const UpdateRoles = () => {
  // State variables for managing data and loading state
  const [roles, setRoles] = useState([]);
  const [Error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [errorActivity, setErrorActivity] = useState(null);
  const [showEditActivities, setShowEditActivities] = useState(false);
  const [allActivities, setAllActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalData, setModalData] = useState([]);
  const toast = useRef(null);
  const [savedActivities, setSavedActivities] = useState(false);

  // Function to show a success toast when roles are updated successfully
  const onSuccessUpdatingRoles = (success) => {
    if (success) {
      toast.current.show({
        severity: "success",
        summary: "Created successfully",
        detail: `Name: ${success}`,
        life: 3000,
      });
    }
  };

  // Function to show a warning toast when fetching activities fails
  const onFetchingActivities = (error) => {
    if (error) {
      toast.current.show({
        severity: "warn",
        summary: "Error getting activities",
        detail: `${error}`,
        life: 3000,
      });
    }
  };

  // Function to show a warning toast when fetching roles fails
  const onFetchingRoles = (error) => {
    if (error) {
      toast.current.show({
        severity: "warn",
        summary: "Error Roles activities",
        detail: `${error}`,
        life: 3000,
      });
    }
  };

  // Function to show a warning toast when updating activities fails
  const onUpdatingActivities = (error) => {
    if (error) {
      toast.current.show({
        severity: "warn",
        summary: "Unsuccessful",
        detail: `${error}`,
        life: 3000,
      });
    }
  };

  useEffect(() => {
    fetchAllActivities();
    fetchRoles();
  }, [savedActivities]);

  // Effect hook to fetch roles on component mount

  const fetchRoles = async () => {
    try {
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/allRoles",
        config
      );
      const fetchedRoles = response.data.roles;
      setRoles(fetchedRoles);
    } catch (error) {
      const errmess = "Cannot get roles, contact the admin";
      onFetchingRoles(errmess);
    }
  };

  const fetchAllActivities = async () => {
    try {
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/activitiesAll",
        config
      );
      const fetchedActivities = response.data.activities;
      setAllActivities(fetchedActivities);
    } catch (error) {
      const errmess = "Cannot get activities, contact the admin";
      onFetchingActivities(errmess);
    }
  };

  const getRoleActivitiesWithId = async (roleId) => {
    try {
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
      const roleResponse = await axios.get(
        `https://agile-pm.agilebiz.co.ke/api/allRolesWithId/${roleId}`,
        config
      );

      if (roleResponse.data.roles && roleResponse.data.roles.length > 0) {
        const selectedRoleData = roleResponse.data.roles[0];
        setModalData(roleResponse.data.roles[0]);

        setSelectedActivities(selectedRoleData.activities);
        setErrorActivity(null);
      }
    } catch (error) {
      onFetchingRoles("Failed to get role activities");
      setSelectedActivities([]);
    }
  };

  const initializeSelectedActivities = () => {
    if (selectedRole) {
      const selectedRoleData = roles.find((role) => role.id === selectedRole);
      if (selectedRoleData) {
        setSelectedActivities(selectedRoleData.activities);
      }
    }
  };

  initializeSelectedActivities();

  // Event handler for role selection
  const handleRoleChange = async (event) => {
    const roleId = event.target.value;
    setSelectedRole(roleId);
    getRoleActivitiesWithId(roleId);
  };

  // Event handler to toggle the edit activities modal
  const openEditActivities = () => {
    setShowEditActivities(!showEditActivities);
  };

  // Event handler to close the edit activities modal
  const closeEditActivities = () => {
    setShowEditActivities(!showEditActivities);
    setIsLoading(false);
  };

  // Event handler for submitting the edit activities modal
  const handleModalSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const selectedActivities = Array.from(event.target.activities)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => ({
      id: checkbox.value,
     // permissions: getSelectedPermissions(checkbox.value),
      name: checkbox.nextElementSibling.textContent,  // Get the activity name
      permissions: getSelectedPermissions(checkbox.value, checkbox.nextElementSibling.textContent),
    }));

    // Validation for selected activities
    if (selectedActivities.length === 0) {
      onUpdatingActivities("Please select at least one activity.");
      setIsLoading(false);
      return;
    }

    // Validation for activities with no permissions
    const activitiesWithNoPermissions = selectedActivities.filter(
      (activity) => activity.permissions.length === 0
    );

    const dashboardActivitiesWithNoRoles = selectedActivities.filter(
      (activity) => activity.name.toLowerCase() === 'dashboard' && activity.permissions.length === 0
    );
  
    if (dashboardActivitiesWithNoRoles.length > 0) {
      setErrorActivity(
        "Assign exactly one role to each 'dashboard' activity"
      );
      onUpdatingActivities(errorActivity);
      setIsLoading(false);
      return;
    }


    if (activitiesWithNoPermissions.length > 0 ) {
      onUpdatingActivities(
        "Assign at least one permission to each selected activity"
      );
      setIsLoading(false);
      return;
    }

    try {
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
      const response = await axios.put(
        `https://agile-pm.agilebiz.co.ke/api/updateRoles/${selectedRole}`,
        {
          roleName: event.target.rolename.value,
          activities: selectedActivities,
        },
        config
      );
      if (response.status === 200) {
        const success = response.data.message;
        onSuccessUpdatingRoles(success);
        event.target.reset();
        setIsLoading(false);
        // Fetch activities data again to refresh the UI
        fetchAllActivities();
        getRoleActivitiesWithId(selectedRole);
        setSavedActivities(!savedActivities);
        setShowEditActivities(!showEditActivities);
      } else {
        if (response.status === 404) {
          onUpdatingActivities(response.data.message);
        }
        if (response.status === 500) {
          onUpdatingActivities(response.data.message);
        } else {
          onUpdatingActivities(response.data.message);
        }
      }
    } catch (error) {
      setIsLoading(false);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        onUpdatingActivities(error.response.data.message);
      } else {
        onUpdatingActivities("Failed to update role");
      }
    }
  };

  // Function to get selected permissions for an activity
  
  const getSelectedPermissions = (activityId, activityName) => {
    const permissions = [];
  
    if (activityName.toLowerCase() === 'dashboard') {
      const roles = [
        'Administrator',
        'Management',
        'ProjectManager',
        'TeamLeads',
        'Consultant',
        'Default',
      ];
  
      for (const role of roles) {
        const radio = document.querySelector(
          `#${role}-permission-${activityId}`
        );
        if (radio && radio.checked) {
          permissions.push(role);
          break;  // Since only one radio button can be selected, break the loop once we found the selected role
        }
      }
    } else {
      const readCheckbox = document.querySelector(
        `#read-permission-${activityId}`
      );
      const writeCheckbox = document.querySelector(
        `#write-permission-${activityId}`
      );
  
      if (readCheckbox && readCheckbox.checked) {
        permissions.push('read');
      }
  
      if (writeCheckbox && writeCheckbox.checked) {
        permissions.push('write');
      }
    }
  
    return permissions;
  };


  return (
    <div className="flex justify-center items-center pt-6">
      <Toast ref={toast} />
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded shadow">
          <h2 className="text-2xl font-bold mb-4 text-center">Update Role</h2>
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
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div
              className="bg-white p-8 rounded shadow  overflow-y-auto w-3/4"
              style={{ overflowY: "auto", maxHeight: "calc(100vh - 100px)" }}
            >
              <h2 className="text-2xl font-bold mb-4 text-center">
                Edit Activities
              </h2>

              <form className="" onSubmit={handleModalSubmit}>
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
                <div className="">
                  <label
                    htmlFor="activities"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    Activities
                  </label>
                  <div className="grid grid-cols-2 gap-4">
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
                            <span className="text-gray-700">
                              {activity.name}
                            </span>
                          </label>
                          {activity.name.toLowerCase() === "dashboard" ? (
                            <div className="ml-7 grid grid-cols-2 gap-2">
                              {[
                                "Administrator",
                                "Management",
                                "ProjectManager",
                                "TeamLeads",
                                "Consultant",
                                "Default",
                              ].map((role) => (
                                <label
                                  className="inline-flex items-center cursor-pointer"
                                  htmlFor={`${role}-permission-${activity.id}`}
                                  key={`${role}-permission-${activity.id}`}
                                >
                                  <input
                                    className="form-radio text-blue-500 appearance-none h-4 w-4 mr-1 border border-gray-300 rounded-md checked:bg-blue-500 checked:border-transparent focus:outline-none"
                                    type="radio" 
                                    name={`role-permission-${activity.id}`}
                                    id={`${role}-permission-${activity.id}`}
                                    defaultChecked={
                                      modalData.activities.find(
                                        (act) =>
                                          act.id === activity.id &&
                                          act.pivot.permissions.includes(role)
                                      ) !== undefined
                                    }
                                  />
                                  <span className="text-gray-700 text-xs">
                                    {role}
                                  </span>
                                </label>
                              ))}
                            </div>
                          ) : (
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
                                <span className="text-gray-700 text-xs">
                                  View
                                </span>
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
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-3 flex justify-end mt-4">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold mr-4 "
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
                    Cancel
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
