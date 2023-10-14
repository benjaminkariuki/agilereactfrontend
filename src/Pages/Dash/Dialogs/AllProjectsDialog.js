import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import _ from "lodash";
import { Chart } from "primereact/chart";
import { useNavigate } from "react-router-dom";


const AllProjectsDialog = ({showAllProjectsChart, disableShowAllProjectsChart }) => {
  const toast = useRef(null);
  const [isLoading2, setIsLoading2] = useState(false);
  const [chartDataAllSubtsaks, setChartDataAllSubtasks] = useState({});
  const navigate = useNavigate();



  const [chartProjectSubtaskAllDatafromApi, setChartDataAllFromAPi] = useState(
    []
  );

  useEffect(() => {
    
        setIsLoading2(true);
    
        fetchProjectsTasksCountAllSubtask()
            .finally(() => {
                setIsLoading2(false);
            });
    
}, []);


  useEffect(() => {
    const projects = chartProjectSubtaskAllDatafromApi.map(
      (p) => p.projectName
    );

    const subtasks = chartProjectSubtaskAllDatafromApi.map(
      (c) => c.subtaskCount
    );

    const subtasks_openSubtaskCount = chartProjectSubtaskAllDatafromApi.map(
      (c) => c.openSubtaskCount
    );

    const subtasks_highPrioritySubtaskCount =
    chartProjectSubtaskAllDatafromApi.map(
        (c) => c.highPrioritySubtaskCount
      );

    const subtasks_closedSubtaskCount =
    chartProjectSubtaskAllDatafromApi.map((c) => c.closedSubtaskCount);

    const projects_count_name_in_sentence_case = projects.map((name) =>
      _.startCase(name)
    );

    setChartDataAllSubtasks({
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

 
  }, [chartProjectSubtaskAllDatafromApi]);


  const handleAxiosError = (error) => {
    let errorMessage = "An error occurred!";

    if (error.response) {
      // The request was made and the server responded with a status code outside of the range of 2xx
      if (error.response.status >= 400 && error.response.status < 500) {
        errorMessage =
          "There seems to be an issue with the request. Please try again.";
      } else if (error.response.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage =
        "No response received from the server. Please check your connection and try again.";
    } else {
      // An error occurred setting up the request
      errorMessage = error.message;
    }

    onError(errorMessage);
  };

 
  const onError = (error) => {
    if (error && toast.current) {
      toast.current?.show({
        severity: "error",
        summary: "Error occurred",
        detail: `${error}`,
        life: 1000,
      });
    }
  };



  const resetStates = () => {
    
   
  };

  useEffect(() => {
    if (!showAllProjectsChart) {
      // If the dialog is not showing
      resetStates();
    }
  }, []);

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          // Ensure only whole numbers are used
          stepSize: 10,
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

  const fetchProjectsTasksCountAllSubtask = async () => {
    
    try {
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/getAllProjectAndSubtasksCount",
        config
      );
      if (response.status === 401) {
        navigate('/');
      }

      const fetchedProjectTaskCountAll = response.data;
      setChartDataAllFromAPi(fetchedProjectTaskCountAll);
    } catch (error) {
      
      handleAxiosError(error);
    }
  };


  return (
    <div>
      <Toast ref={toast} />
      <Dialog
       header={"All Projects Graph"}
        visible={showAllProjectsChart}
        onHide={disableShowAllProjectsChart}
        style={{ width: "99vw", height: "99vh" }}
        className="overflow-auto" // Makes the content of the dialog scrollable
      >
        {isLoading2 ? (
          <i className="pi pi-spin pi-spinner"></i>
        ) : (
          <div className="flex-1 p-4 z-0">
            <div
              className="rounded shadow-md  p-4"
              style={{ backgroundColor: "hsl(214, 41%, 97%)" }}
            >
              <Chart
              className="h-full"
              type="bar"
              data={chartDataAllSubtsaks}
              options={chartOptions}
            />
              </div>
            </div>
          
        )}
      </Dialog>
    </div>
  );
};

export default AllProjectsDialog;
