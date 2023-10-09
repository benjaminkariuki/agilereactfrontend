import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { useSelector } from "react-redux/es/hooks/useSelector";
import axios from "axios";
import { Toast } from "primereact/toast";
import { Chart } from "primereact/chart";
import _ from "lodash";
import { FaBriefcase } from "react-icons/fa";
import Teams from "./Dialogs/Teams";
import { useNavigate } from "react-router-dom";


const Leads = () => {
  const email = useSelector((state) => state.user.userEmail);
  const role = useSelector((state) => state.user.userRole);
  const department = useSelector((state) => state.user.userDepartment);
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const navigate = useNavigate();


  const [chartProjectSubtaskActiveDatafromApi, setChartDataFromAPi] = useState(
    []
  );

  const [chartProjectSubtaskActiveStagefromApi, setChartDataStageFromAPi] =
    useState([]);

  const [
    chartProjectSubtaskActiveIndividualDatafromApi,
    setChartDataProjectIndividualFromAPi,
  ] = useState([]);

  const [chartDataSubtsaks, setChartDataSubtasks] = useState({});
  const [chartDataStageSubtsaks, setChartDataStageSubtasks] = useState({});

  const [
    chartDataProjectsConsultantSubtasks,
    setChartDataProjectsIndividualSubtasks,
  ] = useState({});

  const [chartLineDataSubtsaks, setChartLineDataSubtasks] = useState({});

  const [errorMessage, setErrorMessage] = useState("");
  const toast = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStageCount, setIsLoadingStageCount] = useState(false);

  const [isLoadingProjectsCount, setIsLoadingProjectsCount] = useState(false);

  const [activeSprint, setActiveSprint] = useState({});

  const [activeSprintLabels, setActiveSprintLabels] = useState([]);
  const [activeSprintCountdata, setActiveSprintCountData] = useState(0);
  const [activeSprintIncompleteCountdata, setActiveSprintIncompleteCountData] =
    useState(0);

  const [activeSprintcompleteCountdata, setActiveSprintcompleteCountData] =
    useState(0);

  useEffect(() => {
    setIsLoading(true);

    Promise.all([
      fetchActiveSprintSubtaskUser(email, role, department),
      fetchActiveSprintMinimal(),
    ]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchActiveSprintSubtaskUserStages(email, role, department);
  }, []);

  useEffect(() => {
    fetchProjectsTasksCountPerConsultant(email, role, department);
  }, []); // The empty dependency array ensures the effect runs once after the component mounts.

  const handleErrorMessage = (error) => {
    if (
      error &&
      error.response &&
      error.response.data &&
      error.response.data.message
    ) {
      // Handle error messages directly under data property
      return error.response.data.message;
    } else if (
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
      error.response.data.error
    ) {
      // Handle error structures like {error: "No active sprint found"}
      return error.response.data.error;
    } else if (error && error.message) {
      // Client-side error (e.g., no internet)
      return error.message;
    }
    // If no errors property is found, return the main message or a default error message
    return error &&
      error.response &&
      error.response.data &&
      error.response.data.message
      ? error.response.data.message
      : "An unexpected error occurred.";
};

  const onFetchingRoles = (error) => {
    if (toast.current && error) {
      toast.current.show({
        severity: "warn",
        summary: "Error",
        detail: handleErrorMessage(error),
        life: 3000,
      });
    }
  };

  const colorMap = {
    totalSubtaskCount: "#42A5F5", // blue
    openSubtaskCount: "#FFA500", // orange
    highPrioritySubtaskCount: "#FF0000", // red
    closedSubtaskCount: "#16A34A", // green
  };

  const colorMapActive = {
    todoTasksCount: "#42A5F5", // blue
    developmentTasksCount: "#FFA500", // orange
    readyForTestingTasksCount: "#FF0000", // red
    reviewTasksCount: "#16A34A", // green
  };

  const fetchActiveSprintMinimal = async () => {
    try {

      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/activeSprintMinimal",
        config
      );

      if (response.status === 401) {
        navigate('/');
      }

      const fetchedActiveSprintMinimal = response.data;

      // Concatenate the start_date and end_date
      const duration = `${fetchedActiveSprintMinimal.start_date} - ${fetchedActiveSprintMinimal.end_date}`;

      setActiveSprint(fetchedActiveSprintMinimal);
      setActiveSprintLabels(duration); // setting the concatenated value

     

      if (response.status === 200) {
        setErrorMessage("");
      }
    } catch (error) {
      
      setErrorMessage("Failed to get active sprint details");
      onFetchingRoles(error);
    }
  };

  const fetchActiveSprintSubtaskUser = async (email, role, department) => {
    try {
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/ProjectAndSubtasksActivePerUserCountOverall",
        {
          params: {
            email: email,
            role: role,
            department: department,
          },
          headers: config.headers
        }
      );

      if (response.status === 401) {
        navigate('/');
      }

      const fetchedActiveSprintTasks = response.data;

      // setActiveSprint(fetchedActiveSprint);
      setChartDataFromAPi(fetchedActiveSprintTasks);

      if (response.status === 200) {
        setErrorMessage("");
      }
    } catch (error) {
     
      setErrorMessage("Failed to get active sprint details");
      onFetchingRoles(error);
    }
  };

  const fetchActiveSprintSubtaskUserStages = async (
    email,
    role,
    department
  ) => {
    try {
      setIsLoadingStageCount(true);

      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/ProjectAndSubtasksActivePerUserCountStage",
        {
          params: {
            email: email,
            role: role,
            department: department,
          },
          headers: config.headers
        }
      );

      if (response.status === 401) {
        navigate('/');
      }

      const fetchedActiveSprintStageTasks = response.data;

      // setActiveSprint(fetchedActiveSprint);
      setChartDataStageFromAPi(fetchedActiveSprintStageTasks);

      if (response.status === 200) {
        setIsLoadingStageCount(false);
        setErrorMessage("");
      }
    } catch (error) {
      setIsLoadingStageCount(false);
      
      setErrorMessage("Failed to get active sprint details");
      onFetchingRoles(error);
    }
  };

  const fetchProjectsTasksCountPerConsultant = async (
    email,
    role,
    department
  ) => {
    try {
      setIsLoadingProjectsCount(true);

      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/ProjectAndSubtasksActivePerUserCount",
        {
          params: {
            email: email,
            role: role,
            department: department,
          },
          headers: config.headers
        }
      );

      if (response.status === 401) {
        navigate('/');
      }

      const fetchedProjectTaskCountPerConsultant = response.data;
      setChartDataProjectIndividualFromAPi(
        fetchedProjectTaskCountPerConsultant
      );

      if (response.status === 200) {
        setIsLoadingProjectsCount(false);
        setErrorMessage("");
      }
    } catch (error) {
      setIsLoadingProjectsCount(false);
      
      setErrorMessage("Failed to get subtasks");
      onFetchingRoles(error);
    }
  };

  useEffect(() => {
    const dataKeys = Object.keys(chartProjectSubtaskActiveDatafromApi);
    const dataValues = Object.values(chartProjectSubtaskActiveDatafromApi);

    // const labels = dataKeys.map((key) => _.startCase(key));
    const labels = dataKeys.map((key) => {
      let newName = key.replace(/count/i, "").trim(); // Removes 'count' (case-insensitive) and trims any extra spaces
      return _.startCase(newName);
    });

    const datasets = dataKeys.map((key, index) => {
      return {
        label: labels[index], // use the transformed key as the label
        backgroundColor: colorMap[key] || "#000000", // Use the color from the map, or default to black if the key isn't found (this shouldn't happen but just in case)
        data: [dataValues[index]], // wrap the value in an array, as the data property expects an array
      };
    });

    // Get the values for "Incomplete Tasks" and "Closed Tasks"
    const incompleteTasks =
      chartProjectSubtaskActiveDatafromApi["totalSubtaskCount"] -
      chartProjectSubtaskActiveDatafromApi["closedSubtaskCount"];
    const closedTasks =
      chartProjectSubtaskActiveDatafromApi["closedSubtaskCount"];

    setChartDataSubtasks({
      labels: labels,
      datasets: datasets,
    });

    setChartLineDataSubtasks({
      labels: [activeSprintLabels],
      datasets: [
        {
          label: "Incomplete Tasks",
          data: [incompleteTasks],
          backgroundColor: "#FF4D4D",
        },

        {
          label: "Closed Tasks",
          backgroundColor: "#42A5F5",
          data: [closedTasks],
        },
      ],
    });
  }, [chartProjectSubtaskActiveDatafromApi]);

  useEffect(() => {
    const dataKeys = Object.keys(chartProjectSubtaskActiveStagefromApi);
    const dataValues = Object.values(chartProjectSubtaskActiveStagefromApi);

    // const labels = dataKeys.map((key) => _.startCase(key));
    const labels = dataKeys.map((key) => {
      let newName = key.replace(/count/i, "").trim(); // Removes 'count' (case-insensitive) and trims any extra spaces
      return _.startCase(newName);
    });

    const datasets = dataKeys.map((key, index) => {
      return {
        label: labels[index], // use the transformed key as the label
        backgroundColor: colorMapActive[key] || "#000000", // Use the color from the map, or default to black if the key isn't found (this shouldn't happen but just in case)
        data: [dataValues[index]], // wrap the value in an array, as the data property expects an array
      };
    });

    setChartDataStageSubtasks({
      labels: labels,
      datasets: datasets,
    });
  }, [chartProjectSubtaskActiveStagefromApi]);

  useEffect(() => {
    const projects = chartProjectSubtaskActiveIndividualDatafromApi.map(
      (p) => p.projectName
    );

    const subtasks = chartProjectSubtaskActiveIndividualDatafromApi.map(
      (c) => c.subtaskCount
    );

    const subtasks_openSubtaskCount =
      chartProjectSubtaskActiveIndividualDatafromApi.map(
        (c) => c.openSubtaskCount
      );

    const subtasks_highPrioritySubtaskCount =
      chartProjectSubtaskActiveIndividualDatafromApi.map(
        (c) => c.highPrioritySubtaskCount
      );

    const subtasks_closedSubtaskCount =
      chartProjectSubtaskActiveIndividualDatafromApi.map(
        (c) => c.closedSubtaskCount
      );
    const projects_count_name_in_sentence_case = projects.map((name) => {
      let newName = name.replace(/count/i, "").trim(); // Removes 'count' (case-insensitive) and trims any extra spaces
      return _.startCase(newName);
    });

    setChartDataProjectsIndividualSubtasks({
      labels: projects_count_name_in_sentence_case,
      datasets: [
        {
          label: "Number of Subtasks",
          backgroundColor: "#42A5F5",
          data: subtasks,
        },
        {
          label: "Number of Open Subtasks",
          backgroundColor: "#FFA500",
          data: subtasks_openSubtaskCount,
        },
        {
          label: "Number of Incomplete Subtasks/high priority",
          backgroundColor: "#FF0000",
          data: subtasks_highPrioritySubtaskCount,
        },
        {
          label: "Number of Closed Subtasks",
          backgroundColor: "#16A34A",
          data: subtasks_closedSubtaskCount,
        },
      ],
    });
  }, [chartProjectSubtaskActiveIndividualDatafromApi]);

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          // Ensure only whole numbers are used
          stepSize: 5,
          callback: function (value) {
            if (Math.floor(value) === value) {
              return value;
            }
          },
        },
        grid: {
          display: true,
          drawBorder: false,
        },
      },
      x: {
        grid: {
          display: false,
          drawOnChartArea: false, // This ensures that the grid lines are not shown on the chart area
        },
      },
    },
  };

  const chartOptionsStacked = {
    scales: {
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          // Ensure only whole numbers are used
          stepSize: 5,
          callback: function (value) {
            if (Math.floor(value) === value) {
              return value;
            }
          },
        },
        grid: {
          display: true,
          drawBorder: false,
        },
      },
      x: {
        stacked: true,
        grid: {
          display: false,
          drawOnChartArea: false, // This ensures that the grid lines are not shown on the chart area
        },
      },
    },
  };

  return !isLoading ? (
    <div className="flex flex-col p-5 md:space-y-4 space-y-4 h-full mb-12 overflow-auto">
      <div className="text-right mb-1">
        <button
          onClick={() => setShowTeamsModal(true)}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Teams
        </button>
      </div>
      <Toast ref={toast} />

      <div className="flex-1 p-4">
        <div
          className="rounded shadow-md p-4 relative"
          style={{ backgroundColor: "white" }}
        >
          <p className="text-xl font-semibold mb-2 text-black-500">
            My Tasks Summary:-Status
          </p>
          <div className="h-full">
            <Chart
              className="h-80"
              type="bar"
              data={chartDataSubtsaks}
              options={chartOptions}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        {isLoadingStageCount ? (
          <div className="flex justify-center items-center h-24">
            <i className="pi pi-spin pi-spinner text-blue-500 md:text-4xl text-3xl"></i>
          </div>
        ) : (
          <div
            className="rounded shadow-md p-4 relative"
            style={{ backgroundColor: "white" }}
          >
            <p className="text-xl font-semibold mb-2 text-black-500">
              My Tasks Summary:-Stages
            </p>
            <div className="h-full">
              <Chart
                className="h-80"
                type="bar"
                data={chartDataStageSubtsaks}
                options={chartOptions}
              />
            </div>
          </div>
        )}
      </div>

      {/* Place for graphs and other content */}

      <div className="flex-1 p-4">
        {isLoadingProjectsCount ? (
          // Display spinner when isLoading is true
          <div className="flex justify-center items-center h-24">
            <i className="pi pi-spin pi-spinner text-blue-500 md:text-4xl text-3xl"></i>
          </div>
        ) : (
          // Display the content when isLoading is false
          <div
            className="rounded shadow-md relative p-4"
            style={{ backgroundColor: "white" }}
          >
            <p className="text-xl font-semibold mb-2 text-black-500">
              My Project Tasks in Active Sprint
            </p>
            <div className="h-full">
              <Chart
                className="h-80"
                type="bar"
                data={chartDataProjectsConsultantSubtasks}
                options={chartOptions}
              />
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-24">
          <i className="pi pi-spin pi-spinner text-blue-500 md:text-4xl text-3xl"></i>
        </div>
      ) : (
        <div className="flex-1 p-4">
          <div
            className="rounded shadow-md relative p-4"
            style={{ backgroundColor: "white" }}
          >
            <p className="text-xl font-semibold mb-2 text-black-500">
              Tasks Burned Down Chart
            </p>
            <div className="h-full">
              <Chart
                className="h-80"
                type="bar"
                data={chartLineDataSubtsaks} // You might also want to correct this variable name if it's a typo. I assume it should be chartLineDataSubtasks.
                options={chartOptionsStacked}
              />
            </div>
          </div>
        </div>
      )}

      {/* Display the Teams component as a modal */}
      {showTeamsModal && (
        <div className="absolute top-0 left-0 w-full h-full bg-white z-10">
          <Teams
            onClose={() => setShowTeamsModal(false)}
            labels={activeSprintLabels}
          />
        </div>
      )}
    </div>
  ) : (
    <div className="flex justify-center items-center h-24">
      <i className="pi pi-spin pi-spinner text-blue-500 md:text-4xl text-3xl"></i>
    </div>
  );
};

export default Leads;
