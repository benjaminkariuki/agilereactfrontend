import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { AiFillClockCircle } from "react-icons/ai";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

const InActiveSprint = () => {
  const [inactiveSprints, setInactiveSprints] = useState([]);
  const toast = useRef(null);

  const onSuccess = (success) => {
    toast.current.show({
      severity: "success",
      summary: "Successful",
      detail: `${success}`,
      life: 1000,
    });
  };

  const onError = (error) => {
    toast.current.show({
      severity: "error",
      summary: "An Error encountered",
      detail: `${error}`,
      life: 3000,
    });
  };

  useEffect(() => {
    fetchInactiveSprints();
  }, []);

  const fetchInactiveSprints = async () => {
    try {
      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/allInactiveSprints"
      );
      const fetchedSprints = response.data.sprints;
      // Process the fetched data if needed
      setInactiveSprints(fetchedSprints);
    } catch (error) {
      console.error("Error getting inactive sprints:", error);
      onError("Failed to fetch inactive sprints");
    }
  };
  const [loadingStates, setLoadingStates] = useState({});

  const handleActivateSprint = async (id) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [id]: "activating" }));

      const response = await axios.post(
        `https://agile-pm.agilebiz.co.ke/api/activateSprint/${id}`
      );

      if (response.status === 200) {
        onSuccess("Sprint activated successfully");
        fetchInactiveSprints();
      }
    } catch (error) {
      onError(error.response.data.error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDeleteSprint = async (id) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [id]: "deleting" }));
      const response = await axios.delete(
        `https://agile-pm.agilebiz.co.ke/api/deleteSprint/${id}`
      );

      if (response.status === 200) {
        onSuccess("Sprint deleted successfully");
        fetchInactiveSprints();
      }
    } catch (error) {
      onError("Error deleting sprint:", error);
      console.log(error);
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
        message: "Do you want to activate this sprint?",
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
          <h2 className="text-xl font-semibold">{sprint.name}</h2>
          <p>
            {sprint.status}
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
          <button
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
          </button>
          <button
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
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
        {inactiveSprints.map((sprint) => (
          <div key={sprint.id}>
            <SprintCard sprint={sprint} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default InActiveSprint;
