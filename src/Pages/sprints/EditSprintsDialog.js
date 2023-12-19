import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";
import { Toast } from "primereact/toast";
import levenshtein from "fast-levenshtein";
import { useNavigate } from "react-router-dom";
import { Calendar } from "primereact/calendar";
import { useSelector } from "react-redux";
import API_BASE_URL from "../../apiConfig";

const EditSprintsDialog = ({
  sprintEditId,
  showDelegate,
  rerouting,
  disableShowDelegateDialog,
}) => {
  const [sprintName, setSprintName] = useState("");
  const [startDate, setStartDate] = useState("");
  const toast = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const { userActivities } = useSelector((state) => state.user);
  const [creating, setCreating] = useState(false);
  const [fetchedData, setFetchedData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    // ... other properties ...
  });

  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  const sprintsActivity = userActivities.find(
    (activity) => activity.name === "Sprints"
  );

  //write permissions
  const hasWritePermissionSprints = sprintsActivity
    ? sprintsActivity.pivot.permissions.includes("write")
    : false;

    const handleErrorMessage = (error) => {
        if (error && error.response && error.response.data) {
          const { message, errors } = error.response.data;
          
          if (errors) {
            // Handle validation errors
            const errorMessages = Object.values(errors)
              .flatMap((errorArray) => errorArray)
              .join(" ");
              
            return errorMessages;
          } else if (message) {
            // Handle other server errors with a message property
            return message;
          }
        } else if (error && error.message) {
          // Client-side error (e.g., no internet)
          return error.message;
        }
        
        // If no errors property is found, return a default error message
        return "An unexpected error occurred.";
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

      const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      axios
        .get(
          `${API_BASE_URL}/sprintById/${sprintEditId}`,
          config
        )
        .then((response) => {
          setIsLoading(false);
          // Handle the response data
          if (response.status === 401) {
            navigate("/");
          }
          const data = response.data;
          setFetchedData({
            name: data.name,
            start_date: data.start_date,
            end_date: data.end_date,
          });

          setSprintName(data.name);
          setStartDate(new Date(data.start_date));
          setEndDate(new Date(data.end_date));
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
        `${API_BASE_URL}/appName`,
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

  

  const handleSubmit = (e) => {
    fetchName();
    e.preventDefault(); // Prevent the default form submission

    // Create an object to store the data that should be sent to the backend
    const editedData = {};

    if (sprintName !== "" && sprintName !== fetchedData.name) {
      editedData.name = sprintName;
    }

    if (startDate !== null && startDate.toString() !== fetchedData.start_date) {
        editedData.start_date = new Date(startDate).toISOString().slice(0, 10);
      }
      
      if (endDate !== null && endDate.toString() !== fetchedData.end_date) {
        editedData.end_date = new Date(endDate).toISOString().slice(0, 10);
      }
      

    // Check if there is any data to submit
    if (Object.keys(editedData).length === 0) {
      // No edited data to send
      return;
    }

    // Ensure you have the user's token
    const token = sessionStorage.getItem("token");

    // Construct the request config
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // Make the PUT request to update the sprint data
    setCreating(true);
    axios
      .patch(
        `${API_BASE_URL}/updateSprint/${sprintEditId}`,
        editedData, // Send the edited data in the request body
        config
      )
      .then((response) => {
        setCreating(false);
        // Handle the success response here
        rerouting();

        // Optionally, you can close the modal or perform any other actions.
      })
      .catch((error) => {
        setCreating(false);
        // Handle any errors here
        onError(error);
      });
  };

  // Conditional rendering: Render the dialog and its contents only when projectData is not null
  return (
    <div>
      <Toast ref={toast} />
      <Dialog
        header={"Edit Sprint"}
        visible={showDelegate}
        onHide={disableShowDelegateDialog}
        style={{ width: "90vw", height: "90vh" }}
        className="overflow-auto" // Makes the content of the dialog scrollable
      >
        {!isLoading ? (
          <div className="flex flex-col items-center">
            <form
              className="w-full max-w-md p-6 bg-white rounded-lg shadow-md"
              onSubmit={handleSubmit}
            >
              <label htmlFor="name" className="block font-semibold">
                Name:
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={sprintName}
                onChange={(e) => setSprintName(e.target.value)}
                className="block w-full p-2 border rounded focus:outline-none focus:border-primary"
              />

              <label htmlFor="start_date" className="block font-semibold">
                Start Date:
              </label>
              <Calendar
                id="start_date"
                name="start_date"
                value={startDate}
                onChange={(e) => setStartDate(e.value)}
                showIcon
                className="w-full"
              />

              <label htmlFor="end_date" className="block font-semibold">
                End Date:
              </label>
              <Calendar
                id="end_date"
                name="end_date"
                value={endDate}
                onChange={(e) => setEndDate(e.value)}
                showIcon
                className="w-full"
              />

              <div className="flex justify-between pt-5">
                {hasWritePermissionSprints &&
                  (creating ? (
                    <div>
                      <i
                        className="pi pi-spin pi-spinner"
                        style={{ fontSize: "1.4rem" }}
                      ></i>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Submit
                    </button>
                  ))}

                <button
                  onClick={disableShowDelegateDialog}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <i
              className="pi pi-spin pi-spinner"
              style={{ fontSize: "1.4rem" }}
            ></i>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default EditSprintsDialog;
