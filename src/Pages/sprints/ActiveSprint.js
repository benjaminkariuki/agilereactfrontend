import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Chart } from "primereact/chart";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Subtasks from "./Subtasks";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";

const ActiveSprint = () => {
  const [data, setData] = useState(null);
  const toast = useRef(null);
  const [closeLoading, setCloseLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [viewSummaryDialogue, setViewSummaryDialogue] = useState(false);
  const [visible, setVisible] = useState(false);

  const confirmClose = () => {
    confirmDialog({
      message: "Are you sure you want to close this sprint?",
      header: "Close Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: handleConfirmClose,
    });
  };
  const handleConfirmClose = () => {
    setViewSummaryDialogue(true);
    setVisible(false);
  };
  const handleConfirmOpen = () => {
    setVisible(true);
    confirmClose();
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
    fetchActiveSprint();
  }, []);
  const fetchActiveSprint = () => {
    axios
      .get("https://agile-pm.agilebiz.co.ke/api/activeSprint")
      .then((response) => {
        setData(response.data);
        onSuccess("message found successfully");
      })
      .catch((error) => {
        onError(error.response.data.error);
        onWarn("Create a Sprint");
      });
  };

  const completedTasks = data?.subtasks?.filter(
    (task) => task.status === "completed"
  ).length;
  const openTasks = data?.subtasks?.filter(
    (task) => task.status === "open"
  ).length;
  const highPriorityTasks = data?.subtasks?.filter(
    (task) => task.status === "high priority"
  ).length;

  let projectTasks = {};
  data?.subtasks?.forEach((task) => {
    if (projectTasks[task.project.title]) {
      projectTasks[task.project.title] += 1;
    } else {
      projectTasks[task.project.title] = 1;
    }
  });

  const tasksData = {
    labels: ["Open", "Completed", "incomplete"],
    datasets: [
      {
        data: [openTasks, completedTasks, highPriorityTasks ],
        backgroundColor: ["#42A5F5", "#66BB6A", "#FF9800"],
        hoverBackgroundColor: ["#64B5F6", "#81C784", "#FF9800"],
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

  //fucntion to refetch data when task(s) is removed
  const reloadData = () => {
    fetchActiveSprint();
  };
  //function to close sprint
  const handleCloseSprint = (id) => {
    setCloseLoading(true);
    axios
      .post(`https://agile-pm.agilebiz.co.ke/api/closeSprint/${id}`, {
        summary,
      })
      .then((response) => {
        onSuccess("Closed successfuly");
        setCloseLoading(true);
      })
      .catch((error) => {
        onError("Error closing sprint");
        setCloseLoading(true);
      });
  };

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog visible={visible} />
      {data ? (
        <div>
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
                onClick={() => handleConfirmOpen()}
                disabled={closeLoading}
              >
                Close
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
            <Subtasks
              subtasks={data.subtasks}
              sprintId={data.id}
              reloadData={reloadData}
              component = {"active"}
            />
          </div>
          <Dialog
            header="Add Summary before closing the sprint"
            visible={viewSummaryDialogue}
            onHide={() => setViewSummaryDialogue(false)}
            style={{ width: "70vw" }}
            footer={
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => handleCloseSprint(data.id)}
                disabled={closeLoading}
              >
                {closeLoading ? (
                  <i
                    className="pi pi-spin pi-spinner"
                    style={{ fontSize: "1.4rem" }}
                  ></i>
                ) : (
                  "Submit and Close Sprint"
                )}
              </button>
            }
          >
            <textarea
              name="summary"
              id="sprint-summary"
              className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
              onChange={(e) => setSummary(e.target.value)}
              required
              style={{ height: "320px" }}
            />
          </Dialog>
        </div>
      ) : (
        <div className="flex items-center justify-center pt-10">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md justify-center">
            <h1 className="text-center font-bold">No Active Sprint</h1>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveSprint;
