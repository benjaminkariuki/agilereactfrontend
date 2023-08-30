import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Chart } from "primereact/chart";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Subtasks from "./Subtasks";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Bar } from "react-chartjs-2";

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

  //getting total number of completed tasks pushed to the sprint
  const completedTasks = data?.subtasks?.filter(
    (task) => task.status === "completed"
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

  //chart to display total number of subtaks pushed to the current Sprint 
  const chartData = {
    labels: ["Open", "Completed", "High priority"],
    datasets: [
      {
        label:"Totals tasks",
        data: [openTasks, completedTasks, highPriorityTasks],
        backgroundColor: ["#42A5F5", "#66BB6A", "#FF9800"],
      },
    ],
  };
  //chart options for tasks
  const chartTasksOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
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
  //chart options for projects display
  const chartProjectOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
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

  //getting total number of subtasks and per project
  let projectTasks = {};
  data?.subtasks?.forEach((task) => {
    if (projectTasks[task.project.title]) {
      projectTasks[task.project.title] += 1;
    } else {
      projectTasks[task.project.title] = 1;
    }
  });
  //display different colors for the individual projects and charts
  const projectColors = generateRandomColors(Object.keys(projectTasks).length);
  //chart for the projects and related tasks
  const projectData = {
    labels: Object.keys(projectTasks),
    datasets: [
      {
        label: "Total sub-task per project",
        data: Object.values(projectTasks),
        backgroundColor: projectColors.backgroundColors,
        hoverBackgroundColor: projectColors.hoverBackgroundColors,
      },
    ],
  };

  // Function to generate random colors
  function generateRandomColors(count) {
    const backgroundColors = [];
    const hoverBackgroundColors = [];

    for (let i = 0; i < count; i++) {
      const randomColor = getRandomColor();
      backgroundColors.push(randomColor);
      hoverBackgroundColors.push(darkenColor(randomColor, 10));
    }

    return { backgroundColors, hoverBackgroundColors };
  }

  // Function to generate a random hex color
  function getRandomColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  }
  // Function to darken a hex color
  function darkenColor(hexColor, percent) {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const newR = Math.floor((r * (100 - percent)) / 100);
    const newG = Math.floor((g * (100 - percent)) / 100);
    const newB = Math.floor((b * (100 - percent)) / 100);
    return `#${newR.toString(16)}${newG.toString(16)}${newB.toString(16)}`;
  }

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
          <div className="">
            <div>
              <h1 className="text-2xl font-bold mb-4 text-center">
                <strong>Active Sprint: </strong>
              </h1>
            </div>
            <div className="flex justify-between mb-2 ">
              <h1 className="text-1xl font-bold mb-4 text-center">
                <strong>{data.name}</strong>
              </h1>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline sticky top-0"
                onClick={() => handleConfirmOpen()}
                disabled={closeLoading}
              >
                Close
              </button>
            </div>
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2  gap-4">
              <div className=" h-25vw rounded-lg shadow-md border p-2 bg-white">
                {/*<Chart type="bar" data={tasksData} />*/}
                <Bar data={chartData} options={chartTasksOptions} />
              </div>
              <div className=" h-25vw rounded-lg shadow-md border p-2 bg-white">
                <Chart
                  type="bar"
                  data={projectData}
                  options={chartProjectOptions}
                />
              </div>
            </div>

            <div>
              <Subtasks
                subtasks={data.subtasks}
                sprintId={data.id}
                reloadData={reloadData}
                component={"active"}
              />
            </div>
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
