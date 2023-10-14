import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Chart } from "primereact/chart";
import {ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Subtasks from "./Subtasks";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import _ from "lodash";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";




const ActiveSprint = ({ rerouting, routeToCompletedSprints  }) => {
  const [data, setData] = useState(null);

  const toast = useRef(null);
  const [closeLoading, setCloseLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [viewSummaryDialogue, setViewSummaryDialogue] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const { userActivities } = useSelector((state) => state.user);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);


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


  const handleErrorMessage = (error) => {
    if (
      error &&
      error.response &&
      error.response.data &&
      error.response.data.errors
    ) {
      // Extract error messages and join them into a single string
      return Object.values(error.response.data.errors).flat().join(" ");
    } else if (error && error.response && error.response.data && error.response.data.message) {
      // Server error with a `message` property
      return error.response.data.message;
    } else if (error && error.message) {
      // Client-side error (e.g., no internet)
      return error.message;
    }
    // If no errors property is found, return the main message or a default error message
    return "An unexpected error occurred.";
  };
  


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
    setViewSummaryDialogue(false);
    setVisible(false);
  };

  const handleConfirmOpen = () => {
    setViewSummaryDialogue(true);
    setShowConfirmDialog(true);
  };



  const onError = (error) => {
    if (error && toast.current) {
      toast.current?.show({
        severity: "error",
        summary: "Error occurred",
        detail: handleErrorMessage(error),
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
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      });
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
        setCloseLoading(false);
        setViewSummaryDialogue(false);
        routeToCompletedSprints(); // Call the new function to navigate to "CompletedSprints"

      })
      .catch((error) => {
        setCloseLoading(false);
        onError(error);
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

            {hasWritePermissionSprints && ( <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => handleConfirmOpen()}
              >
                Close
              </button>
            )}
            
            <ConfirmDialog
            visible={showConfirmDialog}
            onHide={() => setShowConfirmDialog(false)}
            message="Are you sure you want to close this sprint?"
            header="Close Confirmation"
            icon="pi pi-exclamation-triangle"
            accept={() => handleCloseSprint(data.id)}
            reject={() => setShowConfirmDialog(false)}
          />
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
