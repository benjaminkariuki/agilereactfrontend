import { useEffect, useState, useRef } from "react";
import { Toast } from "primereact/toast";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";



const AddRoles = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorActivity, setErrorActivity] = useState(null);
  const toast = useRef(null);
  const { userActivities } = useSelector((state) => state.user);
  const navigate = useNavigate();

  
  const onSuccess = (success) => {
    toast.current.show({
      severity: "success",
      summary: "Created successfully",
      detail: `Name: ${success}`,
      life: 3000,
    });
  };

  const onFetchingActivities = (error) => {
    if(toast.current && error){

    toast.current.show({
      severity: "warn",
      summary: "Error fetting activities",
      detail: `${error}`,
      life: 3000,
    });
  }
  };

  const onCreatingActivities = (error) => {
    if(toast.current && error){
    toast.current.show({
      severity: "warn",
      summary: "Unsuccessful",
      detail: `${error}`,
      life: 3000,
    });
  }
  };

  //getting the permission for projects
  const UsersRoles = userActivities.find(
    (activity) => activity.name === "Manage roles"
  );
  const hasReadPermissionUsersRoles =
    UsersRoles.pivot.permissions.includes("read");

  const hasWritePermissionUsersRoles =
    UsersRoles.pivot.permissions.includes("write");


  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
        const response = await axios.get(
          "https://agile-pm.agilebiz.co.ke/api/activitiesAll",config
        );

        if (response.status === 401) {
          navigate('/');
        }

        const fetchedActivities = response.data.activities;
        setActivities(fetchedActivities);
      } catch (error) {

        const errmess = "Please contact the admin";
        onFetchingActivities(errmess);
        // onFetchingActivities(errmess)
      }
    };

    fetchActivities();
  }, []);

  const handleSubmit = async (event) => {
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

    if (selectedActivities.length === 0) {
      setErrorActivity("Please select at least one activity.");
      onCreatingActivities(errorActivity);
      setIsLoading(false);
      return;
    }

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
      onCreatingActivities(errorActivity);
      setIsLoading(false);
      return;
    }

    if (activitiesWithNoPermissions.length > 0)   {

      setErrorActivity(
        "Assign at least one permission to each selected activity"
      );
      onCreatingActivities(errorActivity);
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
      const response = await axios.post(
        "https://agile-pm.agilebiz.co.ke/api/create_role",
        {
          roleName: event.target.rolename.value,
          activities: selectedActivities,
        },
        config
      );

      if (response.status === 401) {
        navigate('/');
      }

      const success = response.data.message;
      if (response.status === 201) {
        onSuccess(success);
        event.target.reset();
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
        setError("Failed to create role");
      }
      onCreatingActivities(error);
    }
  };

  

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
    } else if (activityName.toLowerCase() === 'tasks') {
      const tasks = [
        'Assign-Tasks',
        'Close-tasks',
        'Push-Development',
        'Push-Testing',
        'Push-Review',
        "Return-Development",
        'Return-Testing',
        'View-All-Tasks',
        'View-Team-Tasks',
        
      ];
  
      for (const task of tasks) {
        const checkbox = document.querySelector(
          `#${task}-${activityId}`
        );
        if (checkbox && checkbox.checked) {
          permissions.push(task);
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
          <h2 className="text-2xl font-bold mb-4 text-center">Create Role</h2>
          <form onSubmit={handleSubmit}>
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
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="activities"
                className="block text-gray-700 font-bold mb-2"
              >
                Activities
              </label>

              {activities.map((activity) => (
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
                      />
                      <span className="text-gray-700">{activity.name}</span>
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
              />
              <span className="text-gray-700 text-xs">
                {role}
              </span>
            </label>
          ))}
        </div>
      ) : activity.name.toLowerCase() === "tasks" ? (
        <div className="ml-7 grid grid-cols-2 gap-2">
          {[
            "Assign-Tasks",
            "Close-tasks",
            "Push-Development",
            "Push-Testing",
            "Push-Review",
            "Return-Development",
            "Return-Testing",
            "View-All-Tasks",
            "View-Team-Tasks",
          ].map((task) => (
            <label
              className="inline-flex items-center cursor-pointer"
              htmlFor={`${task}-${activity.id}`}
              key={`${task}-${activity.id}`}
            >
              <input
                className="form-checkbox text-blue-500 appearance-none h-4 w-4 mr-1 border border-gray-300 rounded-md checked:bg-blue-500 checked:border-transparent focus:outline-none"
                type="checkbox"
                name={`${task}-${activity.id}`}
                id={`${task}-${activity.id}`}
              />
              <span className="text-gray-700 text-xs">
                {task}
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
            />
            <span className="text-gray-700 text-xs">Modify</span>
          </label>
        </div>
      )}



                    
                  </div>
                </div>
              ))}

            </div>

            <div className="text-center">

           {hasWritePermissionUsersRoles && (<button
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Role"}
              </button>)}

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRoles;
