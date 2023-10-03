import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { IoCheckmarkDoneCircleOutline } from "react-icons/io5";
import { Toast } from "primereact/toast";
import { Chart } from "primereact/chart";
import Subtasks from "./Subtasks";

const CompletedSprints = () => {
  const [completeSprints, setCompleteSprints] = useState([]);
  const [viewMoreActive, setViewMoreActive] = useState(false);
  const toast = useRef(null);
  const [data, setData] = useState(null);

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
    fetchClosedSprints();
  }, []);

  const fetchClosedSprints = async () => {
    try {
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/allClosedSprints",config
      );
      const fetchedSprints = response.data.sprints;
      setCompleteSprints(fetchedSprints);
    } catch (error) {
      console.error("Error getting inactive sprints:", error);
      onError("Failed to fetch inactive sprints");
    }
  };
  //View the particular sprint details
  const handleViewMoreApi = (id) => {
    const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
    axios
      .get(`https://agile-pm.agilebiz.co.ke/api/closedSprintById/${id}`,config)
      .then((response) => {
        setData(response.data);
        onSuccess("message found successfully");
        setTimeout(() => {
          setViewMoreActive(true);
        }, 1000);
      })
      .catch((error) => {
        onError("Cant Fetch the sprint details");
      });
  };

  //display for view more details
  const completedTasks = data?.subtasks?.filter(
    (task) => task.status === "completed"
  ).length;
  const openTasks = data?.subtasks?.filter(
    (task) => task.status === "open"
  ).length;
  const incompleteTasks = data?.subtasks?.filter(
    (task) => task.status === "incomplete"
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
    labels: ["Open", "Completed", "Incomplete"],
    datasets: [
      {
        label: "Total tasks",
        data: [openTasks, completedTasks, incompleteTasks],
        backgroundColor: ["#42A5F5", "#66BB6A", "#FF0000"],
        hoverBackgroundColor: ["#64B5F6", "#81C784", "#FF0000"],
      },
    ],
  };

  const projectData = {
    labels: Object.keys(projectTasks),
    datasets: [
      {
        label: "Tasks per project",
        data: Object.values(projectTasks),
        backgroundColor: ["#42A5F5", "#66BB6A"],
        hoverBackgroundColor: ["#64B5F6", "#81C784"],
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

  //display the total completed sprints
  const SprintCard = ({ sprint }) => {
    const startDate = new Date(sprint.start_date);
    const endDate = new Date(sprint.end_date);
    const timeDifference = endDate.getTime() - startDate.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

    return (
      <div
        key={sprint.id}
        className="bg-white rounded-lg shadow p-4 h-64 flex flex-col justify-between relative"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">{sprint.name}</h2>
          <p>
            {sprint.status}
            {sprint.status === "closed" && (
              <IoCheckmarkDoneCircleOutline size={30} color="green" />
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
        <div className="flex justify-end">
          <button
            onClick={() => handleViewMoreApi(sprint.id)}
            className="
                bg-blue-500 hover:bg-blue-600
          mt-2 text-white font-semibold px-2 py-1 rounded-md"
          >
            View more
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <Toast ref={toast} />
      {viewMoreActive ? (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4 text-center">
            <strong>Completed Sprint: </strong>
          </h1>
          <div className="flex justify-between mb-2">
            <h2 className="text-1xl font-bold mb-4 text-center">
              <strong>{data.name}</strong>
            </h2>
          </div>
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2  gap-4">
            <div className="h-25vw rounded-lg shadow-md border p-2 bg-white">
              <Chart type="bar" data={tasksData} options={chartOptionsTasks} />
            </div>
            <div className="h-25vw rounded-lg shadow-md border p-2 bg-white">
              <Chart
                type="bar"
                data={projectData}
                options={chartOptionsProject_Tasks}
              />
            </div>
          </div>
          {data &&
            data.subtasks && ( // Check if data and data.subtasks exist
              <Subtasks
                subtasks={data.subtasks}
                sprintId={data.id}
                component={"complete"}
              />
            )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
          {completeSprints.map((sprint) => (
            <div key={sprint.id}>
              <SprintCard sprint={sprint} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletedSprints;
