import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Chart } from "primereact/chart";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Subtasks from "./Subtasks";
import { Toast } from "primereact/toast";

const ActiveSprint = () => {
  const [data, setData] = useState(null);
  const toast = useRef(null);
  const [closeLoading, setCloseLoading] = useState(false);

  const confirmClose = () => {
    confirmDialog({
      message: "Are you sure you want to close this sprint?",
      header: "Close Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => handleCloseSprint(),
    });
  };
  const onSuccess = (success) => {
    if (success) {
      toast.current?.show({
        severity: "success",
        summary: "Successfully",
        detail: `${success}`,
        life: 3000,
      });
    }
  };

  const onError = (error) => {
    if (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error occurred",
        detail: `${error}`,
        life: 3000,
      });
    }
  };

  const onWarn = (error) => {
    if (error) {
      toast.current?.show({
        severity: "warn",
        summary: "Please upload micro task(s)",
        detail: `${error}`,
        life: 3000,
      });
    }
  };
  useEffect(() => {
    axios
      .get("https://agile-pm.agilebiz.co.ke/api/activeSprint")
      .then((response) => {
        setData(response.data);
        onSuccess("message found successfully");
      })
      .catch((error) => {
        onError(error.message);
        onWarn("Warning");
      });
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  const completedTasks = data.subtasks.filter(
    (task) => task.status === "completed"
  ).length;
  const openTasks = data.subtasks.filter(
    (task) => task.status === "open"
  ).length;

  let projectTasks = {};
  data.subtasks.forEach((task) => {
    if (projectTasks[task.project.title]) {
      projectTasks[task.project.title] += 1;
    } else {
      projectTasks[task.project.title] = 1;
    }
  });

  const tasksData = {
    labels: ["Open", "Completed"],
    datasets: [
      {
        data: [openTasks, completedTasks],
        backgroundColor: ["#42A5F5", "#66BB6A"],
        hoverBackgroundColor: ["#64B5F6", "#81C784"],
      },
    ],
  };

  const projectData = {
    labels: Object.keys(projectTasks),
    datasets: [
      {
        data: Object.values(projectTasks),
        backgroundColor: ["#42A5F5", "#66BB6A"],
        hoverBackgroundColor: ["#64B5F6", "#81C784"],
      },
    ],
  };

  const handleCloseSprint = () => {};

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="bg-white rounded-lg shadow p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">
          <strong>Active Sprint: </strong>
        </h1>
        <div className="flex justify-between mb-2">
          <h2 className="text-1xl font-bold mb-4 text-center">
            <strong>{data.name}</strong>
          </h2>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={confirmClose}
          >
            {closeLoading ? (
              <i
                className="pi pi-spin pi-spinner"
                style={{ fontSize: "1.4rem" }}
              ></i>
            ) : (
              "Close"
            )}
          </button>
        </div>
        <div className="mb-4 flex flex-col sm:flex-row justify-start">
          <div className="w-full sm:w-64 h-32 mb-2 sm:mb-0 rounded border p-2">
            <Chart type="bar" data={tasksData} />
          </div>
          <div className="w-full sm:w-64 h-32 rounded border p-2">
            <Chart type="bar" data={projectData} />
          </div>
        </div>
        <Subtasks subtasks={data.subtasks} />
      </div>
    </div>
  );
};

export default ActiveSprint;
