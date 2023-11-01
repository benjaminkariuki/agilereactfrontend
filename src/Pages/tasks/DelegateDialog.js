import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";
import { Toast } from "primereact/toast";
import levenshtein from 'fast-levenshtein';
import { useNavigate } from "react-router-dom";


const DelegateTaskDialog = ({
  showDelegate,
  disableShowDelegateDialog,
  projectInfomation,
  roleName,
  onSuccess,
}) => {
  
  const [projectData, setProjectData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const toast = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();


  const isCloseEnough = (input, target, threshold = 3) => {
    if (!input || !target) return false;
    return levenshtein.get(input, target) <= threshold;
}

const handleErrorMessage = (error) => {
  if (
    error &&
    error.response &&
    error.response.data &&
    error.response.data.message &&
    error.response.data.message.newlyAssigned
  ) {
    // Extract the nested error message
    return error.response.data.message.newlyAssigned.join(" ");
  } else if (error && error.message) {
    // Client-side error (e.g., no internet)
    return error.message;
  }
  // If no errors property is found, return the main message or a default error message
  return error &&
    error.response &&
    error.response.data &&
    error.response.data.message
    ? typeof error.response.data.message === 'string' 
      ? error.response.data.message
      : "An error occurred, but specifics aren't provided."
    : "An unexpected error occurred.";
};



  //toast display functions
  const onSuccessRequest = (success) => {
    if (success) {
      toast.current?.show({
        severity: "success",
        summary: "Successfully",
        detail: `${success}`,
        life: 1000,
      });
    }
  };

  const onError = (error) => {
    if (error && toast.current) {
      toast.current?.show({
        severity: "error",
        summary: "Error occurred",
        detail: handleErrorMessage(error),
        life: 1000,
      });
    }
  };

  useEffect(() => {
    fetchName();
    if (showDelegate) {
      setIsLoading(true);
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
      axios
        .get(
          `https://agilepmtest.agilebiz.co.ke/api/allProjectsCrewWithId/${projectInfomation.projectId}`,
          config
        )
        .then((response) => {
          // Handle the response data
          if (response.status === 401) {
            navigate('/');
          }

          const projectData = response.data.data;
          setProjectData(projectData);
          setIsLoading(false);
        })
        .catch((error) => {
          // Handle any errors here
          setIsLoading(false);
         
        });
    }
  }, [showDelegate]);

  const fetchName = async () => {
    try {
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly
  
      const response = await fetch(
        "https://agilepmtest.agilebiz.co.ke/api/appName",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 401) {
        navigate('/');
      }
  
      // Rest of your code...
    } catch (error) {
      // Error handling code...
    }
  };

  const submitDelegatedUser = async (email) => {
    fetchName();
    setIsSubmitting(true);
    try {
      // Define the data you want to send in the request body
      const data = {
        subtaskId: projectInfomation.id, // Replace with your subtask ID
        projectId: projectInfomation.projectId, // Replace with your project ID
        phaseId: projectInfomation.phaseId, // Replace with your phase ID
        phaseActivityId: projectInfomation.phaseActivityId, // Replace with your phase activity ID
        newlyAssigned: email, // The email you want to delegate to
        roleName: roleName, // Replace with the role name
      };

      const lowerCaseRoleName = roleName.toLowerCase();


      if (
        isCloseEnough(lowerCaseRoleName, "business analyst") ||
        isCloseEnough(lowerCaseRoleName, "head business analyst") ||
        isCloseEnough(lowerCaseRoleName, "team lead implementation")
      ) {
        // Use the email from the 'baassignedto' array
        data.previousAssigned =
          projectInfomation.baassignedto[0].custom_user.email;
      } else {
        // Use the email from the 'assignedto' array
        data.previousAssigned =
          projectInfomation.assignedto[0].custom_user.email;
      }

      // Send the POST request to the API endpoint
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
      const response = await axios.post(
        "https://agilepmtest.agilebiz.co.ke/api/delegateTask",
        data,
        config
      );

      if (response.status === 401) {
        navigate('/');
      }

      // Check if the request was successful
      if (response.status === 200) {
        // Handle success here
        onSuccessRequest("Task delegated successfully");
        setIsSubmitting(false);
        onSuccess();
      } else {
        // Handle other status codes here if needed
        onError("Task delegation failed"); // <-- Show error toast
        setIsSubmitting(false);
      }
    } catch (error) {
      // Handle any errors that occurred during the request
      setIsSubmitting(false);
      onError(error); 
      // <-- Show error toast
    }
  };

  const getOptions = () => {
    if (!projectData) return [];
  
    const users = projectData.organization || [];
  
    return users.map((user) => ({
      label: `${user.user.firstName} ${user.user.lastName} - ${user.user.email}` +
        (user.user?.department ? " [Department: " + user.user?.department + "]" : "") +
        (user.user?.role?.name ? " [Role: " + user.user?.role?.name + "]" : ""),
      value: user.user.email,
    }));
  };
  

  // Conditional rendering: Render the dialog and its contents only when projectData is not null
  return (
    <div>
      <Toast ref={toast} />
      <Dialog
        header={"Delegate Task"}
        visible={showDelegate}
        onHide={disableShowDelegateDialog}
        style={{ width: "50vw", height: "80vh" }}
        className="overflow-auto" // Makes the content of the dialog scrollable
      >
        {!isLoading ? (
          <div className="bg-white p-4 rounded-lg h-full flex flex-col justify-between">
            {/* This is the content of the dialog, which will only be rendered when projectData is not empty */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Delegate Task
              </h3>
              <Dropdown
                value={selectedUser}
                options={getOptions()}
                onChange={(e) => setSelectedUser(e.value)}
                placeholder="Select a User"
                style={{ width: "100%" }}
                className="overflow-auto"
              />
            </div>

            {isSubmitting ? (
              <div className="bg-blue-500 text-white py-2 px-4 rounded-md mt-4 self-end flex items-center justify-center">
                <i
                  className="pi pi-spin pi-spinner"
                  style={{ fontSize: "1.4rem" }}
                ></i>
              </div>
            ) : (
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded-md mt-4 self-end"
                onClick={() => submitDelegatedUser(selectedUser)}
              >
                Submit
              </button>
            )}
          </div>
        ) : (
          <div>
            <i
              className="pi pi-spin pi-spinner"
              style={{ fontSize: "1.4rem" }}
            ></i>
          </div> // This will be rendered when projectData is empty
        )}
      </Dialog>
    </div>
  );
};

export default DelegateTaskDialog;
