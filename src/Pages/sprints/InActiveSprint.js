import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { AiFillClockCircle } from "react-icons/ai";
import { Toast } from "primereact/toast";
import {  confirmDialog } from "primereact/confirmdialog";
import { useSelector } from "react-redux";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import EditSprintsDialog from "./EditSprintsDialog";
import API_BASE_URL from "../../apiConfig";

const InActiveSprint = ({ rerouting }) => {
  const [inactiveSprints, setInactiveSprints] = useState([]);
  const { userActivities } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [showDelegate, setShowDelegate] = useState(false);
  const [sprintEditId, setShowSprintEditId] = useState('');

 
  const toast = useRef(null);
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
      summary: "An Error encountered",
      detail: `${error}`,
      life: 3000,
    });
  }
  };

  useEffect(() => {
    fetchName();
    fetchInactiveSprints();
  }, []);

  const showDelegateDialog = (id) => {
  
    setShowSprintEditId(id);
    setShowDelegate(true);

  };

  const disableShowDelegateDialog = () => {
    setShowDelegate(false);
  };

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

  const fetchInactiveSprints = async () => {
    try {
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
      const response = await axios.get(
        `${API_BASE_URL}/allInactiveSprints`,
        config
      );

      if (response.status === 401) {
        navigate('/');
      }

      const fetchedSprints = response.data.sprints;
      // Process the fetched data if needed
      setInactiveSprints(fetchedSprints);
    } catch (error) {
      
      onError("Failed to fetch inactive sprints");
    }
  };

  const [loadingStates, setLoadingStates] = useState({});

  const handleActivateSprint = async (id) => {
    fetchName();
    try {
      setLoadingStates((prev) => ({ ...prev, [id]: "activating" }));
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

      const response = await axios.post(
        `${API_BASE_URL}/activateSprint/${id}`,
        {},
        config
      );
      if (response.status === 401) {
        navigate('/');
      }

      if (response.status === 200) {
        onSuccess("Sprint activated successfully");
        rerouting();      
        
      }
    } catch (error) {
     
      onError(error.response.data.error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: false }));
    }
  };

 

  const handleDeleteSprint = async (id) => {
    fetchName();
    try {
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
      setLoadingStates((prev) => ({ ...prev, [id]: "deleting" }));
      const response = await axios.delete(
        `${API_BASE_URL}/deleteSprint/${id}`,
        config
      );

      if (response.status === 401) {
        navigate('/');
      }

      if (response.status === 200) {
        onSuccess("Sprint deleted successfully");
        fetchInactiveSprints();
      }
    } catch (error) {
     
      onError("Error deleting sprint:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: false }));
    }
  };

  const SprintCard = ({ sprint }) => {
    const startDate = new Date(sprint.start_date);
    const endDate = new Date(sprint.end_date);
    const timeDifference = endDate.getTime() - startDate.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

    const confirmActivate = (id) => {
      confirmDialog({
        message: "Do you want to activate this sprint? Please note that once created the sprint cannot be edited!",
        header: "Activate Confirmation",
        icon: "pi pi-check-circle",
        acceptClassName: "p-button-success",
        accept: () => handleActivateSprint(id),
      });
    };

    const confirmDelete = (id) => {
      confirmDialog({
        message: "Do you want to delete this sprint?",
        header: "Delete Confirmation",
        icon: "pi pi-exclamation-triangle",
        acceptClassName: "p-button-danger",
        accept: () => handleDeleteSprint(id),
      });
    };

    return (
      <div
        key={sprint.id}
        className="bg-white rounded-lg shadow p-4 h-64 flex flex-col justify-between relative"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">{_.startCase(sprint.name)}</h2>
          <p>
            {_.startCase(sprint.status)}
            {sprint.status === "inactive" && (
              <AiFillClockCircle className="text-yellow-500 text-2xl" />
            )}
          </p>
        </div>
        <div className="block">
          <p>
            <strong>Start date:</strong> {sprint.start_date} &nbsp;|&nbsp;
            <strong>End date:</strong> {sprint.end_date} &nbsp;|&nbsp;
            <strong>Duration:</strong> {daysDifference} days
          </p>
        </div>
        <div className="flex-1 max-h-40 overflow-y-auto bg-white border rounded-md shadow-sm p-4">
          <p className="text-gray-600 break-words">{sprint.summary}</p>
        </div>
        <div className="flex justify-between">
         
         
         {hasWritePermissionSprints && ( <button
            onClick={() => confirmActivate(sprint.id)}
            className={`${
              loadingStates[sprint.id] === "activating"
                ? "bg-gray-300"
                : "bg-green-500 hover:bg-green-600"
            } mt-2 text-white font-semibold px-2 py-1 rounded-md`}
            disabled={loadingStates[sprint.id] === "activating"}
          >
            {loadingStates[sprint.id] === "activating"
              ? "Activating..."
              : "Activate Sprint"}
          </button>)}


          {hasWritePermissionSprints && ( <button
                onClick={() => showDelegateDialog(sprint.id)}

             className={"text-white px-2 py-1  rounded-md font-semibold bg-yellow-500 hover:bg-yellow-600  mt-2"}
          >
           Edit Sprint
          </button>)}


       { hasWritePermissionSprints && ( <button
            onClick={() => confirmDelete(sprint.id)}
            className={`${
              loadingStates[sprint.id] === "deleting"
                ? "bg-gray-300"
                : "bg-red-500 hover:bg-red-600"
            } mt-2 text-white font-semibold px-2 py-1 rounded-md`}
            disabled={loadingStates[sprint.id] === "deleting"}
          >
            {loadingStates[sprint.id] === "deleting"
              ? "Deleting..."
              : "Delete Sprint"}
          </button>)}


        </div>

      </div>
    );
  };

  return (
    <div>
      <Toast ref={toast} />
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
        {inactiveSprints.map((sprint) => (
          <div key={sprint.id}>
            <SprintCard sprint={sprint} />
          </div>
        ))}
      </div>

      <EditSprintsDialog
        sprintEditId={sprintEditId}
        showDelegate={showDelegate}
        rerouting={rerouting}
        disableShowDelegateDialog={disableShowDelegateDialog}
       
      />


    </div>
  );
};

export default InActiveSprint;
