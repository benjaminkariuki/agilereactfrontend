import React, { useRef, useState } from "react";
import { Calendar } from "primereact/calendar";
import axios from "axios";
import { Toast } from "primereact/toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";



const CreateSprint = ({ rerouting }) => {
  const [sprintData, setSprintData] = useState({
    name: "",
    start_date: null,
    end_date: null,
  });
  const toast = useRef(null);
  const [validError, setValidError] = useState({});
  const [creating, setCreating] = useState(false);
  const { userActivities } = useSelector((state) => state.user);
  const navigate = useNavigate();



  //getting the permission for Sprints
const sprintsActivity = userActivities.find(
  (activity) => activity.name === "Sprints"
);

//read permission
const hasReadPermissionSprints = sprintsActivity
  ? sprintsActivity.pivot.permissions.includes("read")
  : false;

//write permissions
const hasWritePermissionSprints = sprintsActivity
  ? sprintsActivity.pivot.permissions.includes("write")
  : false;



  const onSuccess = (success) => {
    toast.current.show({
      severity: "success",
      summary: "Successful",
      detail: `${success}`,
      life: 1000,
    });
  };

  const onError = (error) => {
    if(toast.current && error){
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: handleErrorMessage(error),
      life: 3000,
    });
  }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSprintData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const formatDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
    } else if (
      error &&
      error.response &&
      error.response.data &&
      error.response.data.message
    ) {
      // Server error with a `message` property
      return error.response.data.message;
    } else if (
      error &&
      error.response &&
      error.response.data &&
      error.response.data.error
    ) {
      // Server error with an `error` property
      return error.response.data.error;
    } else if (error && error.message) {
      // Client-side error (e.g., no internet)
      return error.message;
    }
    // If no errors property is found, return the main message or a default error message
    return "An unexpected error occurred.";
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    setCreating(true);
    const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
    try {
      const response = await axios.post(
        "https://agile-pm.agilebiz.co.ke/api/create_sprint",
        {
          name: sprintData.name,
          start_date: formatDate(sprintData.start_date),
          end_date: formatDate(sprintData.end_date),
        },
        config
      );

      if (response.status === 401) {
        navigate('/');
      }

      if (response.status === 200) {
        onSuccess(response.data.message);
        setTimeout(() => {
          setValidError({});
          rerouting();
        }, 1000);
        setCreating(false);
      }
    } catch (error) {
      setCreating(false);
          onError(error);
    }
  };

  const handleCancel = () => {
    setSprintData({
      name: "",
      start_date: null,
      end_date: null,
    });
    setValidError({});
    rerouting();
  };

  const displayError = (field) => {
    if (validError[field]) {
      return <p className="text-red-500">{validError[field][0]}</p>;
    }
    return null;
  };

  return (
    <div className="flex items-center justify-center pt-10">
      <Toast ref={toast} />

      <form className="w-full max-w-md p-6 bg-white rounded-lg shadow-md justify-center">
        <label htmlFor="name" className="block font-semibold">
          Name:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={sprintData.name}
          onChange={handleChange}
          required
          className="block w-full p-2 border rounded focus:outline-none focus:border-primary"
        />
        {displayError("name")}

        <label htmlFor="start_date" className="block font-semibold">
          Start Date:
        </label>
        <Calendar
          id="start_date"
          name="start_date"
          value={sprintData.start_date}
          onChange={(e) =>
            handleChange({ target: { name: "start_date", value: e.value } })
          }
          required
          showIcon
          className="w-full"
        />
        {displayError("start_date")}

        <label htmlFor="end_date" className="block font-semibold">
          End Date:
        </label>
        <Calendar
          id="end_date"
          name="end_date"
          value={sprintData.end_date}
          onChange={(e) =>
            handleChange({ target: { name: "end_date", value: e.value } })
          }
          required
          showIcon
          className="w-full"
        />
        {displayError("end_date")}

        <div className="flex justify-between pt-5">
         
         {hasWritePermissionSprints && ( <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleSubmit}
            disabled={creating}
          >
            {creating ? (
              <i
                className="pi pi-spin pi-spinner"
                style={{ fontSize: "1.5rem" }}
              />
            ) : (
              " Create"
            )}
          </button>)}


        {hasWritePermissionSprints &&  (<button
            onClick={handleCancel}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>)}



        </div>
      </form>
    </div>
  );
};

export default CreateSprint;
