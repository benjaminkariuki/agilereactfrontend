import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Chart } from "primereact/chart";
import { confirmDialog } from "primereact/confirmdialog";
import Subtasks from "./Subtasks";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import _ from "lodash";

const ActiveSprint = () => {
  const [data, setData] = useState(null);
  const toast = useRef(null);
  const [closeLoading, setCloseLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [viewSummaryDialogue, setViewSummaryDialogue] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const confirmClose = () => {
    confirmDialog({
      message: "Are you sure you want to close this sprint?",
      header: "Close Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        handleConfirmClose();
      },
      reject: () => {
        // You can perform any logic if needed when the user clicks "No" or simply do nothing
      },
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
    const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios
      .get("https://agile-pm.agilebiz.co.ke/api/activeSprint", config)
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {});
  };

  //getting total number of completed tasks pushed to the sprint
  const completedTasks = data?.subtasks?.filter(
    (task) => task.status === "complete"
  ).length;
  //getting total number of open tasks pushed to the sprint
  const openTasks = data?.subtasks?.filter(
    (task) => task.status === "open"
  ).length;
  //getting total number of high-priority/ incomplete tasks from previous sprint
  const highPriorityTasks =
    data?.subtasks?.filter((task) =>
      task.subtask_sprints.some((sprint) => sprint.status === "high priority")
    )?.length || 0;

  let projectTasks = {};
  data?.subtasks?.forEach((task) => {
    if (projectTasks[task.project.title]) {
      projectTasks[task.project.title] += 1;
    } else {
      projectTasks[task.project.title] = 1;
    }
  });
  //display the total number of tasks
  const tasksData = {
    labels: ["Open", "Completed", "High priority"],
    datasets: [
      {
        label: "Total tasks",
        data: [openTasks, completedTasks, highPriorityTasks],
        backgroundColor: ["#42A5F5", "#66BB6A", "#FF9800"],
        hoverBackgroundColor: ["#64B5F6", "#81C784", "#FF9800"],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 205, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
  //display the chart options for tasks chart
  const chartOptionsTasks = {
    plugins: {
      legend: {
        display: false,
        position: "top",
        labels: {
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: "Task Status",
      },
    },
  };
  //display the chart for projects and their respective tasks
  const projectData = {
    labels: Object.keys(projectTasks),
    datasets: [
      {
        label: "Total sub-task per project",
        data: Object.values(projectTasks),
        backgroundColor: ["#42A5F5", "#66BB6A"],
        hoverBackgroundColor: ["#64B5F6", "#81C784"],
      },
    ],
  };

  //display the chart options for project-tasks chart
  const chartOptionsProject_Tasks = {
    plugins: {
      legend: {
        display: false,
        position: "top",
        labels: {
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: "Projects and Task Status",
      },
    },
  };
  //function to refetch data when task(s) is removed
  const reloadData = () => {
    fetchActiveSprint();
  };
  //function to close sprint
  const handleCloseSprint = (id) => {
    setCloseLoading(true);
    const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios
      .post(
        `https://agile-pm.agilebiz.co.ke/api/closeSprint/${id}`,
        {
          summary,
        },
        config
      )
      .then((response) => {
        onSuccess("Closed successfuly");
        setCloseLoading(true);
      })
      .catch((error) => {
        onError("Error closing sprint");
        setCloseLoading(true);
      });
  };

  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1; // '+ 1' to make the calculation inclusive
  };

  return (
    <div>
      <Toast ref={toast} />
      {data ? (
        <div>
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-4 text-center">
              <strong>Active Sprint: </strong>
            </h1>
            <div className="flex justify-between mb-2 relative">
              <h2 className="text-1xl font-bold mb-4 text-center">
                <span
                  className="hover:text-gray-600 cursor-pointer relative"
                  onMouseEnter={() => setShowPopup(true)}
                  onMouseLeave={() => setShowPopup(false)}
                >
                  <strong>{data.name}</strong>
                </span>

                {/* Hidden div for hover popup */}
                <div
                  className={`absolute left-0 mt-2 bg-white p-2 border rounded shadow-lg ${
                    showPopup ? "block" : "hidden"
                  }`}
                  style={{ zIndex: 1 }}
                >
                  <div>Start Date: {data.start_date}</div>
                  <div>End Date: {data.end_date}</div>
                  <div>Duration: {calculateDuration(data.start_date, data.end_date)} day(s)</div>

                </div>
              </h2>

              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => handleConfirmOpen()}
                disabled={closeLoading}
              >
                Close
              </button>
            </div>

            <div className="mb-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2  gap-4">
              <div className="h-25vw rounded-lg shadow-md border p-2 bg-white">
                <Chart
                  type="bar"
                  data={tasksData}
                  options={chartOptionsTasks}
                />
              </div>
              <div className="h-25vw rounded-lg shadow-md border p-2 bg-white">
                <Chart
                  type="bar"
                  data={projectData}
                  options={chartOptionsProject_Tasks}
                />
              </div>
            </div>
            <Subtasks
              subtasks={data.subtasks}
              sprintId={data.id}
              reloadData={reloadData}
              component={"active"}
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
