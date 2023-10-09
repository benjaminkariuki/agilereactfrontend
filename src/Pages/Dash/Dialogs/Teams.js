import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { useSelector } from "react-redux/es/hooks/useSelector";
import axios from "axios";
import { Toast } from "primereact/toast";
import { Chart } from "primereact/chart";
import _ from "lodash";
import { FaBriefcase } from "react-icons/fa";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useNavigate } from "react-router-dom";


import "primeicons/primeicons.css";

const Teams = ({ onClose, labels }) => {
  // Same logic as Leads, but with an added close button on top

  const department = useSelector((state) => state.user.userDepartment);
  const toast = useRef(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [data, setData] = useState([]);
  const navigate = useNavigate();


  const [
    isLoadingProjectsDepartmentCount,
    setIsLoadingProjectsDepartmentCount,
  ] = useState(false);

  const [isLoadingProjectsUserCount, setIsLoadingProjectsUserCount] =
    useState(false);

  const [
    chartProjectSubtaskActiveDepartmentDatafromApi,
    setChartDataProjectDepartmentFromAPi,
  ] = useState([]);

  const [chartBurnDown, setChartBurnDown] = useState([]);

  const [chartBurnDownDepartment, setChartBurnDownDepartment] = useState({});

  const [
    chartDataProjectsDepartmentSubtasks,
    setChartDataProjectsDepartmentSubtasks,
  ] = useState({});

  useEffect(() => {
    fetchProjectsTasksCountPerDepartment(department);

    fetchProjectsTasksCountPerUser(department);
  }, []);

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

  useEffect(() => {
    const projects = chartProjectSubtaskActiveDepartmentDatafromApi.map(
      (p) => p.projectName
    );

    const subtasks = chartProjectSubtaskActiveDepartmentDatafromApi.map(
      (c) => c.subtaskCount
    );

    const subtasks_openSubtaskCount =
      chartProjectSubtaskActiveDepartmentDatafromApi.map(
        (c) => c.openSubtaskCount
      );

    const subtasks_highPrioritySubtaskCount =
      chartProjectSubtaskActiveDepartmentDatafromApi.map(
        (c) => c.highPrioritySubtaskCount
      );

    const subtasks_closedSubtaskCount =
      chartProjectSubtaskActiveDepartmentDatafromApi.map(
        (c) => c.closedSubtaskCount
      );
    const projects_count_name_in_sentence_case = projects.map((name) => {
      let newName = name.replace(/count/i, "").trim(); // Removes 'count' (case-insensitive) and trims any extra spaces
      return _.startCase(newName);
    });

    setChartDataProjectsDepartmentSubtasks({
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

    setChartBurnDownDepartment({
      labels: [labels],
      datasets: [
        {
          label: "Incomplete Tasks",
          data: [chartBurnDown.subtaskCount - chartBurnDown.closedSubtaskCount],
          backgroundColor: "#FF4D4D",
        },

        {
          label: "Closed Tasks",
          backgroundColor: "#42A5F5",
          data: [chartBurnDown.closedSubtaskCount],
        },
      ],
    });
  }, [chartProjectSubtaskActiveDepartmentDatafromApi]);

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

  const fetchProjectsTasksCountPerDepartment = async (department) => {
    try {
      setIsLoadingProjectsDepartmentCount(true);
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/teamsProjectsSubtasksPerCount",
        {
          ...config, 
          params: {
            department: department,
          },
        }
      );

      if (response.status === 401) {
        navigate('/');
      }

      const fetchedProjectTaskCountPerDepartment = response.data[0];
      setChartDataProjectDepartmentFromAPi(
        fetchedProjectTaskCountPerDepartment
      );

      setChartBurnDown(response.data[1]);

      if (response.status === 200) {
        setIsLoadingProjectsDepartmentCount(false);
        setErrorMessage("");
      }
    } catch (error) {
      setIsLoadingProjectsDepartmentCount(false);
     
setErrorMessage("Failed to get subtasks");
      onFetchingRoles(error);
    }
  };

  const fetchProjectsTasksCountPerUser = async (department) => {
    try {
      setIsLoadingProjectsUserCount(true);
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/teamsProjectsPerMemberCount",
        {
          ...config, 
          params: {
            department: department,
          },
        }
      );

      if (response.status === 401) {
        navigate('/');
      }

      setData(response.data);


      if (response.status === 200) {
        setIsLoadingProjectsUserCount(false);
        setErrorMessage("");
      }
    } catch (error) {
      setIsLoadingProjectsUserCount(false);
     
      setErrorMessage("Failed to get subtasks");
      onFetchingRoles(error);
    }
  };

  const sortedData = [...data].sort((a, b) => a.user.localeCompare(b.user));

  return (
    <div className="flex flex-col p-2 md:space-y-8 space-y-4 h-full  mb-12 overflow-auto  bg-blue-50">
      <div className="text-right">
        <i
          onClick={onClose}
          className="pi pi-times text-blue-500"
          style={{ fontSize: "1.5rem" }}
        ></i>
      </div>

      {/* Rest of the content from Leads component */}
      <>
        <div className="flex-1 ">
          <div
            className="rounded shadow-md relative p-4"
            style={{ backgroundColor: "white" }}
          >
            <p className="text-xl font-semibold mb-2 text-black-500">
              Teams Tasks in Active Sprint
            </p>
            <div className="relative md:h-[70vh] md:w-[80vw] h-[40vh] w-full">
              <Chart
                className="h-full"
                type="bar"
                data={chartDataProjectsDepartmentSubtasks}
                options={chartOptions}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 ">
          <div
            className="rounded shadow-md relative p-4"
            style={{ backgroundColor: "white" }}
          >
            <p className="text-xl font-semibold mb-2 text-black-500">
              Burned Down Chart
            </p>
            <div className="relative md:h-[70vh] md:w-[80vw] h-[40vh] w-full">
              <Chart
                className="h-full"
                type="bar"
                data={chartBurnDownDepartment} // You might also want to correct this variable name if it's a typo. I assume it should be chartLineDataSubtasks.
                options={chartOptionsStacked}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 ">
          <div
            className="rounded shadow-md relative p-4"
            style={{ backgroundColor: "white" }}
          >
            <p className="text-xl font-semibold mb-2 text-black-500">
              WorkLoad Per user
            </p>
            <div className="relative md:h-[70vh] md:w-[90vw] h-[40vh] w-full overflow-auto">
              <DataTable value={sortedData} groupField="user">
                <Column field="user" header="User Email"></Column>
                <Column field="projectName" header="Project Name"></Column>
                <Column field="subtaskCount" header="Subtask Count"></Column>
                <Column
                  field="openSubtaskCount"
                  header="Open Subtasks"
                ></Column>
                <Column
                  field="highPrioritySubtaskCount"
                  header="High Priority Subtasks"
                ></Column>
                <Column
                  field="closedSubtaskCount"
                  header="Closed Subtasks"
                ></Column>
              </DataTable>
            </div>
          </div>
        </div>
      </>
    </div>
  );
};

export default Teams;
