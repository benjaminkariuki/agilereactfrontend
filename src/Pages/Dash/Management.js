import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { useSelector } from "react-redux/es/hooks/useSelector";
import axios from "axios";
import { Toast } from "primereact/toast";
import { Chart } from "primereact/chart";
import _ from "lodash";
import { FaBriefcase } from "react-icons/fa";
import DetailsMoreDialog from "./Dialogs/DetailsMoreDialog.js";
import DetailsImplementationDialog from "./Dialogs/DetailsImplementationDialog.js";
import DetailsArchivedDialog from "./Dialogs/DetailsArchivedDialog.js";
import MoreSprintsDetails from "./Dialogs/MoreSprintsDetails.js";
import AllProjectsDialog from "./Dialogs/AllProjectsDialog.js";

import DetailsSupportDialog from "./Dialogs/DetailsSupportDialog.js";

const Management = () => {
  const email = useSelector((state) => state.user.userEmail);
  const role = useSelector((state) => state.user.userRole);
  const department = useSelector((state) => state.user.userDepartment);
  const [isLoadingProjectsCount, setIsLoadingProjectsCount] = useState(false);
  const [isLoadingAllProjectsCount, setIsLoadingAllProjectsCount] =
    useState(false);

  const [projectImplementationCount, setImplementationProjectsCount] =
    useState(0);
  const [projectsSupportCount, setProjectsSupportCount] = useState(0);
  const [projectsArchivedCount, setProjectsArchivedCount] = useState(0);

  const [chartProjectSubtaskActiveDatafromApi, setChartDataFromAPi] = useState(
    []
  );
  const [chartDataSubtsaks, setChartDataSubtasks] = useState({});
  const [chartLineDataSubtsaks, setChartLineDataSubtasks] = useState({});

  const [chartDatafromRolesApi, setChartDataFromRolesAPi] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  const [showDetailsImplementation, setShowDetailsImplementation] =
    useState(false);

  const [
    chartProjectSubtaskActiveIndividualDatafromApi,
    setChartDataProjectIndividualFromAPi,
  ] = useState([]);

  const [
    chartDataProjectsConsultantSubtasks,
    setChartDataProjectsIndividualSubtasks,
  ] = useState({});

  const [showDetailsSupport, setShowDetailsSupport] = useState(false);

  const [showDetailsArchived, setShowDetailsArchived] = useState(false);

  const [showDetailsActiveSprint, setShowDetailsActiveSprint] = useState(false);

  const [showAllProjectsCount, setShowAllProjectsCount] = useState(false);

  const [chartData, setChartData] = useState({});
  const [chartDataRoles, setChartDataRoles] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const toast = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
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
      fetchProjectsImplementationCount(),
      fetchSupportProjectsCount(),
      fetchArchivedProjectsCount(),
      fetchActiveSprint(),
    ]).finally(() => {
      setIsLoading(false);
    });
  }, []); // The empty dependency array ensures the effect runs once after the component mounts.

  useEffect(() => {
    fetchProjectsTasksCountPerConsultant(email, role, department);
  }, []);

  useEffect(() => {
    fetchProjectsTasksCountPerSubtask();
  }, []);

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
        detail:handleErrorMessage(error),
        life: 3000,
      });
    }
  };

  const fetchProjectsImplementationCount = async () => {
    try {
      const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/allProjectImplementation",
        config
      );

      const fetchedimplementation = response.data.supportProjectsCount;
      setImplementationProjectsCount(fetchedimplementation);

      if (response.status === 200) {
        setErrorMessage("");
      }
    } catch (error) {
      setErrorMessage("Failed to get projects count");
      onFetchingRoles(error);
    }
  };

  const fetchSupportProjectsCount = async () => {
    try {
      const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

      const configs = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/allProjectSupport",
        configs
      );

      const fetchedsupportcount = response.data.supportProjectsCount;
      setProjectsSupportCount(fetchedsupportcount);

      if (response.status === 200) {
        setErrorMessage("");
      }
    } catch (error) {
      setErrorMessage("Failed to get projects count");
      onFetchingRoles(error);
    }
  };

  const fetchArchivedProjectsCount = async () => {
    const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/allProjectsArchivedCount",
        config
      );

      const fetchedProjectsArchivedcount = response.data.archivedProjectsCount;
      setProjectsArchivedCount(fetchedProjectsArchivedcount);

      if (response.status === 200) {
        setErrorMessage("");
      }
    } catch (error) {
      setErrorMessage("Failed to get projects count");
      onFetchingRoles(error);
    }
  };

  const fetchProjectsTasksCountPerSubtask = async () => {
    try {
      setIsLoadingAllProjectsCount(true);

      const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/allProjectAndSubtasksActive",
        config
      );

      const fetchedProjectTaskCountPerUser = response.data;
      setChartDataFromAPi(fetchedProjectTaskCountPerUser);

      if (response.status === 200) {
        setIsLoadingAllProjectsCount(false);
        setErrorMessage("");
      }
    } catch (error) {
      setIsLoadingAllProjectsCount(false);
      setErrorMessage("Failed to get subtasks");
      onFetchingRoles(error);
    }
  };

  const fetchActiveSprint = async () => {
    try {
      const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/fetchActiveSprint",
        config
      );

      const fetchedActiveSprint = response.data[0];
      setActiveSprint(fetchedActiveSprint);
      setActiveSprintLabels(response.data[0].duration);
      setActiveSprintCountData(response.data[0].totalSubtasksCount);

      setActiveSprintIncompleteCountData(
        response.data[0].incompleteSubtasksCount
      );
      setActiveSprintcompleteCountData(response.data[0].completeSubtasksCount);

      if (response.status === 200) {
        setErrorMessage("");
      }
    } catch (error) {
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

      const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
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
          headers: config.headers,
        }
      );

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
    const projects = chartProjectSubtaskActiveDatafromApi.map(
      (p) => p.projectName
    );

    const subtasks = chartProjectSubtaskActiveDatafromApi.map(
      (c) => c.subtaskCount
    );

    const subtasks_openSubtaskCount = chartProjectSubtaskActiveDatafromApi.map(
      (c) => c.openSubtaskCount
    );

    const subtasks_highPrioritySubtaskCount =
      chartProjectSubtaskActiveDatafromApi.map(
        (c) => c.highPrioritySubtaskCount
      );

    const subtasks_closedSubtaskCount =
      chartProjectSubtaskActiveDatafromApi.map((c) => c.closedSubtaskCount);

    const projects_count_name_in_sentence_case = projects.map((name) =>
      _.startCase(name)
    );

    setChartDataSubtasks({
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

    setChartLineDataSubtasks({
      labels: [activeSprintLabels],
      datasets: [
        {
          label: "Incomplete Tasks",
          data: [activeSprintIncompleteCountdata],
          backgroundColor: "#FF4D4D",
        },

        {
          label: "Closed Tasks",
          backgroundColor: "#42A5F5",
          data: [activeSprintCountdata - activeSprintIncompleteCountdata],
        },
      ],
    });
  }, [chartProjectSubtaskActiveDatafromApi]);

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
          stepSize: 2,
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
          stepSize: 2,
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

  const headerTemplate = (
    <div className="flex justify-between items-center text-white">
      <FaBriefcase />
      <span>Number of Projects: Implementation</span>
    </div>
  );

  const headerTemplateSupport = (
    <div className="flex justify-between items-center text-white">
      <FaBriefcase />
      <span>Number of Projects: Support</span>
    </div>
  );

  const headerTemplateArchivedProjects = (
    <div className="flex justify-between items-center text-white">
      <FaBriefcase />
      <span>Number of Projects: Archived</span>
    </div>
  );

  const titleTemplate = (
    <h3 className="text-black-500">Implementation Projects</h3>
  );
  const titleTemplateSupport = (
    <h3 className="text-black-500">Support Projects</h3>
  );

  const titleTemplateArchived = (
    <h3 className="text-black-500">Archived Projects</h3>
  );

  const showDetailsDialog = () => {
    setShowDetails(true);

  };

  const showDetailsDialogImplementation = () => {
    setShowDetailsImplementation(true);

  };

  const showDetailsDialogSupport = () => {
    setShowDetailsSupport(true);

  };

  const showDetailsArchiveSupport = () => {
    setShowDetailsArchived(true);

  };

  const showDetailsSprint = () => {
    setShowDetailsActiveSprint(true);

  };

  const showSubtaskCountAllProjects = () => {
    setShowAllProjectsCount(true);

  };

  const disableShowDetailsDialog = () => {
    setShowDetails(false);
  };

  const disableShowDetailsDialogImplementation = () => {
    setShowDetailsImplementation(false);
  };

  const disableShowDetailsDialogSupport = () => {
    setShowDetailsSupport(false);
  };

  const disableShowDetailsDialogArchived = () => {
    setShowDetailsArchived(false);
  };

  const disableShowDetailsActiveSprint = () => {
    setShowDetailsActiveSprint(false);
  };

  const disableShowAllProjectsDetailsCount = () => {
    setShowAllProjectsCount(false);
  };

  return !isLoading ? (
    <div className="flex flex-col p-5 md:space-y-8 space-y-4 h-full mb-12 overflow-auto">
      <Toast ref={toast} />
      <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0 flex-grow ">
        <div className="flex-1 p-4">
          <Card
            // title={titleTemplate}
            className="rounded shadow-md h-full relative p-2"
            style={{ background: "linear-gradient(90deg,#84d9d2,#07cdae)" }}
            header={headerTemplate}
          >
            <div className="flex justify-center items-center h-full text-white">
              <p className="text-6xl font-semibold">
                {projectImplementationCount}
              </p>
            </div>

            <p
              className="text-xl md:absolute bottom-2 right-2 text-white hover:text-blue-600 cursor-pointer"
              onClick={() => showDetailsDialogImplementation()}
            >
              View More
            </p>
          </Card>
        </div>

        <div className="flex-1 p-4">
          <Card
            // title={titleTemplateSupport}
            className="rounded shadow-md h-full relative p-2"
            style={{ background: "linear-gradient(90deg,#90caf9,#047edf 99%)" }}
            header={headerTemplateSupport}
          >
            <div className="flex justify-center items-center h-full  text-white">
              <p className="text-6xl font-semibold">{projectsSupportCount}</p>
            </div>

            {/* "View More" link */}
            <p
              className="text-xl  md:absolute bottom-2 right-2 text-white hover:text-blue-600 cursor-pointer"
              onClick={() => showDetailsDialogSupport()}
            >
              View More
            </p>
          </Card>
        </div>

        <div className="flex-1 p-4">
          <Card
            // title={titleTemplateArchived}
            className="rounded shadow-md h-full relative p-2"
            style={{
              background:
                "linear-gradient(195deg, rgb(66, 66, 74), rgb(25, 25, 25)",
            }}
            header={headerTemplateArchivedProjects}
          >
            <div className="flex justify-center items-center h-full text-white">
              <p className="text-6xl font-semibold">{projectsArchivedCount}</p>
            </div>

            {/* "View More" link */}
            <p
              className="text-xl md:absolute bottom-2 right-2 text-white hover:text-blue-600 cursor-pointer"
              onClick={() => showDetailsArchiveSupport()}
            >
              View More
            </p>
          </Card>
        </div>
      </div>

      {isLoadingAllProjectsCount ? (
        <div className="flex justify-center items-center h-24">
          <i className="pi pi-spin pi-spinner text-blue-500 md:text-4xl text-3xl"></i>
        </div>
      ) : (
        <div className="flex-1 p-4">
          <div
            className="rounded shadow-md p-4 relative"
            style={{ backgroundColor: "white" }}
          >
            <p className="text-xl font-semibold mb-2 text-black-500">
              Project Subtasks in Active Sprint
            </p>
            <div className="h-full">
              <Chart
                className="h-80"
                type="bar"
                data={chartDataSubtsaks}
                options={chartOptions}
              />
            </div>
            <p
              className="text-xl md:absolute bottom-2 right-2 text-blue-400 hover:text-blue-600 cursor-pointer"
              onClick={() => showSubtaskCountAllProjects()}
            >
              View All Projects Graph
            </p>
          </div>
        </div>
      )}

      {/* <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0 flex-grow mb-8"> */}

      {/* Place for graphs and other content */}

      {isLoadingAllProjectsCount ? (
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
              Active Sprint Burned Down Chart
            </p>
            <div className="h-full">
              <Chart
                className="h-80"
                type="bar"
                data={chartLineDataSubtsaks}
                options={chartOptionsStacked}
              />
            </div>
            <p
              className="text-xl md:absolute bottom-2 right-2 text-blue-400 hover:text-blue-600 cursor-pointer"
              onClick={() => showDetailsSprint()}
            >
              View More Sprints
            </p>
          </div>
        </div>
      )}

<div className="flex-1 p-4 ">
        {activeSprint &&
          activeSprint.name &&
          activeSprint.startDate &&
          activeSprint.endDate &&
          activeSprint.status && (
            <div
              className="rounded shadow-md p-4 flex-grow relative"
              style={{ backgroundColor: "white" }}
            >
              <p className="text-xl font-semibold mb-2 text-black-500">
                Project and Phases Details
              </p>
              <p className="text-xl mb-2 text-black-500">
                Sprint Name: {_.startCase(activeSprint.name)}
              </p>
              <p className="text-xl mb-2 text-black-500">
                Start Date: {activeSprint.startDate}
              </p>
              <p className="text-xl mb-12 text-black-500">
                End Date: {activeSprint.endDate}
              </p>
              <p className="text-xl md:absolute bottom-2 left-2 bg-green-500 text-white rounded-xl p-2 hover:bg-green-600">
                Status: {_.startCase(activeSprint.status)}
              </p>
              <p
                className="text-xl md:absolute bottom-2 right-2 text-blue-400 hover:text-blue-600 cursor-pointer"
                onClick={() => showDetailsDialog()}
              >
                View More
              </p>
            </div>
          )}
      </div>

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
              My tasks in Active Sprint
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

      <DetailsMoreDialog
        showDetailsMore={showDetails}
        disableShowDelegateDialog={disableShowDetailsDialog}
      />

      <DetailsImplementationDialog
        showDetailsIm={showDetailsImplementation}
        disableShowDelegateDialogImp={disableShowDetailsDialogImplementation}
      />

      <DetailsSupportDialog
        showDetailsSupport={showDetailsSupport}
        disableShowDelegateDialogSupport={disableShowDetailsDialogSupport}
      />

      <DetailsArchivedDialog
        showDetailsArchived={showDetailsArchived}
        disableShowDelegateDialogArchived={disableShowDetailsDialogArchived}
      />

      <MoreSprintsDetails
        showMoreSprints={showDetailsActiveSprint}
        disableShowMoreSprints={disableShowDetailsActiveSprint}
      />

      <AllProjectsDialog
        showAllProjectsChart={showAllProjectsCount}
        disableShowAllProjectsChart={disableShowAllProjectsDetailsCount}
      />
    </div>
  ) : (
    <div className="flex justify-center items-center h-24">
      <i className="pi pi-spin pi-spinner text-blue-500 md:text-4xl text-3xl"></i>
    </div>
  );
};

export default Management;
