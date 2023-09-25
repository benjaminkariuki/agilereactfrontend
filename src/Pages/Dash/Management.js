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

    // Delay the fetchProjectsTasksCountPerSubtask by 4 seconds
    const timeoutId = setTimeout(() => {
      fetchProjectsTasksCountPerSubtask();
      
    }, 4000);

    // Clean up the timeout if the component is unmounted before the timeout finishes
    return () => {
      clearTimeout(timeoutId);
    };
  }, []); // The empty dependency array ensures the effect runs once after the component mounts.

  const onFetchingRoles = (error) => {
    if (toast.current && error) {
      toast.current.show({
        severity: "warn",
        summary: "Error",
        detail: `${error}`,
        life: 3000,
      });
    }
  };

  const fetchProjectsImplementationCount = async () => {
    try {
      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/allProjectImplementation"
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
      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/allProjectSupport"
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
    try {
      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/allProjectsArchivedCount"
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
      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/allProjectAndSubtasksActive"
      );

      const fetchedProjectTaskCountPerUser = response.data;
      setChartDataFromAPi(fetchedProjectTaskCountPerUser);

      if (response.status === 200) {
        setErrorMessage("");
      }
    } catch (error) {
      setErrorMessage("Failed to get subtasks");
      onFetchingRoles(error);
    }
  };

  const fetchActiveSprint = async () => {
    try {
      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/fetchActiveSprint"
      );

      const fetchedActiveSprint = response.data[0];
      setActiveSprint(fetchedActiveSprint);
      setActiveSprintLabels(response.data[0].duration);
      setActiveSprintCountData(response.data[0].totalSubtasksCount);

      setActiveSprintIncompleteCountData(
        response.data[0].incompleteSubtasksCount
      );
      setActiveSprintcompleteCountData(response.data[0].completeSubtasksCount);
      console.log(response.data[0].incompleteSubtasksCount);

      if (response.status === 200) {
        setErrorMessage("");
      }
    } catch (error) {
      setErrorMessage("Failed to get active sprint details");
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

    // const rolesapi_name = chartDatafromRolesApi.map((r) => r.name);
    // const rolesuser_count = chartDatafromRolesApi.map((c) => c.userCount);

    //  const subtasks_name_in_sentence_case = subtasks.map(name => _.startCase(name));
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
          backgroundColor: "#FF0000",
        },

        {
          label: "Closed Tasks",
          backgroundColor: "#42A5F5",
          data: [activeSprintCountdata - activeSprintIncompleteCountdata],
        },
      ],
    });
  }, [chartProjectSubtaskActiveDatafromApi]);

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
    <div className="flex justify-between items-center text-black-500">
      <FaBriefcase />
      <span>Number of Projects: Implementation</span>
    </div>
  );

  const headerTemplateSupport = (
    <div className="flex justify-between items-center text-black-500">
      <FaBriefcase />
      <span>Number of Projects: Support</span>
    </div>
  );

  const headerTemplateArchivedProjects = (
    <div className="flex justify-between items-center text-black-500">
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

    console.log("View More Open");
  };

  const showDetailsDialogImplementation = () => {
    setShowDetailsImplementation(true);

    console.log("View More Open");
  };

  const showDetailsDialogSupport = () => {
    setShowDetailsSupport(true);

    console.log("View More Open");
  };

  const showDetailsArchiveSupport = () => {
    setShowDetailsArchived(true);

    console.log("View More Open");
  };

  const showDetailsSprint = () => {
    setShowDetailsActiveSprint(true);

    console.log("View More Open");
  };

  const showSubtaskCountAllProjects = () => {
    setShowAllProjectsCount(true);

    console.log("View More Open");
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
            title={titleTemplate}
            className="rounded shadow-md h-full relative p-2"
            style={{ backgroundColor: "hsl(214, 41%, 97%)" }}
            header={headerTemplate}
          >
            <div className="flex justify-center items-center h-full text-black-500">
              <p className="text-2xl font-semibold">
                {projectImplementationCount}
              </p>
            </div>

            <p
              className="text-xl md:absolute bottom-2 right-2 text-blue-400 hover:text-blue-600 cursor-pointer"
              onClick={() => showDetailsDialogImplementation()}
            >
              View More
            </p>
          </Card>
        </div>

        <div className="flex-1 p-4">
          <Card
            title={titleTemplateSupport}
            className="rounded shadow-md h-full relative p-2"
            style={{ backgroundColor: "hsl(214, 41%, 97%)" }}
            header={headerTemplateSupport}
          >
            <div className="flex justify-center items-center h-full text-black-500">
              <p className="text-2xl font-semibold">{projectsSupportCount}</p>
            </div>

            {/* "View More" link */}
            <p
              className="text-xl  md:absolute bottom-2 right-2 text-blue-400 hover:text-blue-600 cursor-pointer"
              onClick={() => showDetailsDialogSupport()}
            >
              View More
            </p>
          </Card>
        </div>

        <div className="flex-1 p-4">
          <Card
            title={titleTemplateArchived}
            className="rounded shadow-md h-full relative p-2"
            style={{ backgroundColor: "hsl(214, 41%, 97%)" }}
            header={headerTemplateArchivedProjects}
          >
            <div className="flex justify-center items-center h-full text-black-500">
              <p className="text-2xl font-semibold">{projectsArchivedCount}</p>
            </div>

            {/* "View More" link */}
            <p
              className="text-xl md:absolute bottom-2 right-2 text-blue-400 hover:text-blue-600 cursor-pointer"
              onClick={() => showDetailsArchiveSupport()}
            >
              View More
            </p>
          </Card>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div
          className="rounded shadow-md p-4 relative"
          style={{ backgroundColor: "hsl(214, 41%, 97%)" }}
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

      {/* <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0 flex-grow mb-8"> */}

      {/* Place for graphs and other content */}

      <div className="flex-1 p-4">
        <div
          className="rounded shadow-md relative p-4"
          style={{ backgroundColor: "hsl(214, 41%, 97%)" }}
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

      <div className="flex-1 p-4 ">
        <div
          className="rounded shadow-md p-4 flex-grow relative"
          style={{ backgroundColor: "hsl(214, 41%, 97%)" }}
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
