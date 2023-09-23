import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import _ from "lodash";
import { Chart } from "primereact/chart";

const MoreSprintsDetails = ({ showMoreSprints, disableShowMoreSprints }) => {
  const toast = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimeoutRef = useRef(null);
  const [searchResults, setSearchResults] = useState([]);
  const [chartLineData, setChartLineData] = useState({});

  const [duration, setDuration] = useState("");
  const [incompleteSubtasksCount, setIncompleteSubtasksCount] = useState(0);
  const [totalSubtasksCount, setTotalSubtasksCount] = useState(0);
  const [sprintName, setSprintName] = useState("Sprint");

  const [completeSubtasksCount, setCompleteSubtasksCount] = useState(0);

  const searchSprints = (query) => {
    if (!query) return;
    // Don't make an empty search
    setIsLoading(true);

    axios
      .get("https://agile-pm.agilebiz.co.ke/api/search_sprint", {
        params: {
          q: query,
        },
      })
      .then((response) => {
        // Handle the search results here
        const sprints = response.data;
        setIsLoading(false);
        console.log(sprints);
        setSearchResults(sprints);
      })
      .catch((error) => {
        setIsLoading(false);
        handleAxiosError(error);
      });
  };

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

  // toast display functions
  const onSuccessRequest = (success) => {
    if (success) {
      toast.current?.show({
        severity: "success",
        summary: "Successfully",
        detail: `${success}`,
        life: 1000,
      });
    }
  };

  const onError = (error) => {
    if (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error occurred",
        detail: `${error}`,
        life: 1000,
      });
    }
  };

  const sentenceCaseFormatter = (rowData, column) => {
    return _.startCase(rowData[column.field]);
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear the existing timeout
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    // Set a new timeout to execute the search after a delay
    searchTimeoutRef.current = setTimeout(() => {
      searchSprints(query);
    }, 300); // 500ms delay
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const resetStates = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsLoading(false); // Assuming you have this from previous steps
    setIncompleteSubtasksCount(0);
    setTotalSubtasksCount(0);
    setCompleteSubtasksCount(0);
    setSprintName("Sprint");
  };

  useEffect(() => {
    if (!showMoreSprints) {
      // If the dialog is not showing
      resetStates();
    }
  }, [showMoreSprints]);

  const handleSprintClick = (sprintId, sprintname) => {
    resetStates();
    // You can then make another request using the sprintId
    fetchSprintDetails(sprintId, sprintname);
  };

  const fetchSprintDetails = (sprintId, sprintName) => {
    setIsLoading2(true);
    axios
      .get(
        `https://agile-pm.agilebiz.co.ke/api/infoSprintsAnalysis/${sprintId}`
      )
      .then((response) => {
        const data = response.data;
        // Assuming that the response has a format where the data is in an array
        const sprintDetails = data;
        setDuration(sprintDetails.duration);
        setIncompleteSubtasksCount(sprintDetails.incompleteSubtasksCount);
        setTotalSubtasksCount(sprintDetails.totalSubtasksCount);
        setCompleteSubtasksCount(sprintDetails.completeSubtasksCount);
        setSprintName(sprintName);

        setIsLoading2(false);
      })
      .catch((error) => {
        setIsLoading2(false);
        handleAxiosError(error);
      });
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

  useEffect(() => {
    setChartLineData({
      labels: [duration],
      datasets: [
        {
          label: "Incomplete Tasks",
          data: [incompleteSubtasksCount],
          backgroundColor: "#FF0000",
        },

        {
          label: "Closed Tasks",
          backgroundColor: "#42A5F5",
          data: [totalSubtasksCount - incompleteSubtasksCount],
        },
      ],
    });
  }, [incompleteSubtasksCount]);

  return (
    <div>
      <Toast ref={toast} />
      <Dialog
        header={
          <div className="flex justify-between items-center relative">
            <span>{sprintName}</span>
            <div className="relative w-64">
              {" "}
              {/* Set a width for the container */}
              <input
                type="text"
                placeholder="Search  Sprint..."
                className="p-inputtext p-component pl-2 pr-10"
                value={searchQuery}
                onChange={handleInputChange}
              />
              {isLoading && searchResults.length === 0 ? (
                <div className="absolute top-full z-10 left-1/2 mt-2">
                  {/* Replace the spinner with any spinner component you're using */}
                  <i className="pi pi-spin pi-spinner"></i>
                </div>
              ) : (
                searchResults.length > 0 && (
                  <div className="absolute z-10 top-full left-0 mt-2 w-full bg-white border rounded-md z-1 shadow-lg">
                    {searchResults.map((sprint) => (
                      <div
                        key={sprint.id}
                        className="p-2 hover:bg-gray-200 cursor-pointer"
                        onClick={() =>
                          handleSprintClick(sprint.id, sprint.name)
                        }
                      >
                        {sprint.name}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        }
        visible={showMoreSprints}
        onHide={disableShowMoreSprints}
        style={{ width: "99vw", height: "99vh" }}
        className="overflow-auto" // Makes the content of the dialog scrollable
      >
        {isLoading2 ? (
          <i className="pi pi-spin pi-spinner"></i>
        ) : (
          <div className="flex-1 p-4 z-0">
            <div
              className="rounded shadow-md relative p-4"
              style={{ backgroundColor: "hsl(214, 41%, 97%)" }}
            >
              <p className="text-xl font-semibold mb-2 text-black-500">
                Sprints Burned Down Chart
              </p>
              <div className="h-full">
                <Chart
                  className="h-80"
                  type="bar"
                  data={chartLineData}
                  options={chartOptionsStacked}
                />
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default MoreSprintsDetails;
