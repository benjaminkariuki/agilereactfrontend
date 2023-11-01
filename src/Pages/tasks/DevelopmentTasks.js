import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import _ from "lodash";
import { Dialog } from "primereact/dialog";
import { FaInfoCircle } from "react-icons/fa";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import DelegateTaskDialog from "./DelegateDialog";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

import { useNavigate } from "react-router-dom";

const DevelopmentTasks = () => {
  const { userRole, userEmail, userDepartment } = useSelector(
    (state) => state.user
  );

  const [selectedTasks, setSelectedTasks] = useState([]);
  const [tasksData, setTasksData] = useState([]); // State to store API data
  const [microTasksData, setMicroTasksData] = useState([]);
  const [viewMore, setViewMore] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDetailslog, setShowDetailsLogs] = useState(false);
  const [showDelegate, setShowDelegate] = useState(false);
  const [moreDetailsData, setMoreDetailsData] = useState([]);
  const [pushLoading, setPushLoading] = useState(false);
  const toast = useRef(null);
  const [otherData, setOtherData] = useState([]);
  const [projectSubtasks, setProjectSubtasks] = useState([]);
  const [projectInfo, setProjectInfo] = useState(null);
  const [refreshTasks, setRefreshTasks] = useState(false);
  const [flattenedLogs, setFlattenedLogs] = useState([]);
  const [showSprintPopup, setShowSprintPopUp] = useState(false);
  const { userActivities } = useSelector((state) => state.user);
  const [myTaskCount, setMyTaskCount] = useState(0);
  const [viewOtherTaskCircle, setViewOtherTasksCircleButton] = useState(false);

  const [otherTaskCount, setOtherTaskCount] = useState(0);
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState("My Tasks");
  const [returnedTaskLogs, setReturnedTaskLogs] = useState([]);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  // Convert the role to lowercase for case-insensitive checking

  //getting the permission for projects
  const taskActivity = userActivities.find(
    (activity) => activity.name === "Tasks"
  );
  const hasAssignPermissionTasks =
    taskActivity.pivot.permissions.includes("Assign-Tasks");

  const hasCloseTasks = taskActivity.pivot.permissions.includes("Close-tasks");

  const hasPushDevelopment =
    taskActivity.pivot.permissions.includes("Push-Development");

  const hasPushTesting =
    taskActivity.pivot.permissions.includes("Push-Testing");

  const hasPushReview = taskActivity.pivot.permissions.includes("Push-Review");

  const hasreturnTesting =
    taskActivity.pivot.permissions.includes("Return-Testing");

  const hasViewAllTasks =
    taskActivity.pivot.permissions.includes("View-All-Tasks");

  const hasTeamTasks =
    taskActivity.pivot.permissions.includes("View-Team-Tasks");

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
    if (error && toast.current) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: `${error}`,
        life: 3000,
      });
    }
  };

  const onWarn = (error) => {
    if (error && toast.current) {
      toast.current?.show({
        severity: "warn",
        summary: "Please upload micro task(s)",
        detail: `${error}`,
        life: 3000,
      });
    }
  };

  const customHeader = (
    <div className="flex justify-between items-center">
      <div>Subtask Details</div>
      <InputText
        style={{ width: "33.3333%", marginRight: "1rem" }}
        placeholder="Search task by name, department, status or stage...."
        onInput={(e) =>
          setFilters({
            global: {
              value: e.target.value,
              matchMode: FilterMatchMode.CONTAINS,
            },
          })
        }
      />
    </div>
  );

  const durationTemplate = (rowData) => {
    const currentDate = new Date();
    const startDate = rowData.start_date
        ? new Date(
            Date.UTC(
                new Date(rowData.start_date).getFullYear(),
                new Date(rowData.start_date).getMonth(),
                new Date(rowData.start_date).getDate()
            )
        )
        : null;
    const endDate = rowData.end_date
        ? new Date(
            Date.UTC(
                new Date(rowData.end_date).getFullYear(),
                new Date(rowData.end_date).getMonth(),
                new Date(rowData.end_date).getDate()
            )
        )
        : null;
    const closeDate = rowData.close_date
        ? new Date(
            Date.UTC(
                new Date(rowData.close_date).getFullYear(),
                new Date(rowData.close_date).getMonth(),
                new Date(rowData.close_date).getDate()
            )
        )
        : null;

    const daysUntilEnd = endDate
        ? Math.floor((endDate - currentDate) / (1000 * 60 * 60 * 24))
        : null;
    const totalDurationIfClosed = closeDate && startDate
        ? Math.floor((closeDate - startDate) / (1000 * 60 * 60 * 24))
        : null;
    const daysOverdue =
        endDate && currentDate > endDate && rowData.status !== "complete"
            ? Math.floor((currentDate - endDate) / (1000 * 60 * 60 * 24))
            : null;

    if (rowData.status === "complete" && closeDate) {
        if (!startDate && !endDate) {
            return <span>Task closed on {closeDate.toLocaleDateString()}</span>;
        } else {
            return <span>{totalDurationIfClosed} day(s) taken</span>;
        }
    } else if (daysUntilEnd !== null) {
        return (
            <span style={{ color: "green" }}>{daysUntilEnd} day(s) remaining</span>
        );
    } else if (daysOverdue) {
        return <span style={{ color: "red" }}>{daysOverdue} day(s) overdue</span>;
    } else {
        return (
            <span>
                <i className="pi pi-bell" />
                <i className="pi pi-bell" />
            </span>
        );
    }
};
 
  const pushToApproval = () => {
   
    const selectedIds = selectedTasks?.map((row) => row.id);
    if (selectedIds.length > 0) {
      fetchName();
      setPushLoading(true);
      const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly



      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      axios
        .post(
          "https://agilepmtest.agilebiz.co.ke/api/pushToApproval",
          {
            taskIds: selectedIds,
          },
          config
        )
        .then((response) => {
          if (response.status === 401) {
            navigate("/");
          }

          setTimeout(() => {
            onSuccess(response.data.message);
            fetchMyTasks(userEmail, userRole, userDepartment);
            setPushLoading(false);
          }, 1000);
          setViewMore(false);
        })
        .catch((error) => {
          setPushLoading(false);
          onError(error);
        });
    } else {
      onWarn("Select atleast one task");
    }
  };

  const confirmClose = () => {
    confirmDialog({
      message: "Do you want to close this task(S)?",
      header: "Close Confirmation",
      icon: "pi pi-info-circle",
      accept: pushToApproval,
    });
  };

  const openConfirmDialog = () => {
    if (selectedTasks.length === 1) confirmClose();
    else if (selectedTasks.length > 1)
      onWarn("Only one Micro-task should be selected");
    else onWarn("Select atleast one Micro-task");
  };

  useEffect(() => {
    fetchName();
    fetchMyTasks(userEmail, userRole, userDepartment); // Fetch data from the API when the component mounts
  }, [userEmail, userRole]); // Empty dependency array ensures this effect runs once


  const fetchName = async () => {
    try {
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly
  
      const response = await fetch(
        "https://agilepmtest.agilebiz.co.ke/api/appName",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 401) {
        navigate('/');
      }
  
      // Rest of your code...
    } catch (error) {
      // Error handling code...
    }
  };

  const fetchMyTasks = (userEmail, userRole, userDepartment) => {
    fetchName();
    const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios
      .get("https://agilepmtest.agilebiz.co.ke/api/myTasksDevelopment", {
        params: {
          email: userEmail,
          roleName: userRole,
          department: userDepartment,
        },
        ...config,
      })
      .then((response) => {
        if (response.status === 401) {
          navigate("/");
        }

        setTasksData(response.data.activeSprint);
        setMicroTasksData(response.data.activeSprint.subtasks);
        setMyTaskCount(response.data.subtasksCount);
      })
      .catch((error) => {
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          onError(error.response.data.error);
        } else {
          onError("An unknown error occurred.");
        }
      });
  };

  const fetchOtherTasks = (userEmail, userRole, userDepartment) => {
    fetchName();
    const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios
      .get("https://agilepmtest.agilebiz.co.ke/api/OtherTasksDevelopment", {
        params: {
          email: userEmail,
          roleName: userRole,
          department: userDepartment,
        },
        ...config,
      })
      .then((response) => {
        if (response.status === 401) {
          navigate("/");
        }

        setOtherData(response.data.allSubtasks);
        setOtherTaskCount(response.data.allSubtasksCount);
        setViewOtherTasksCircleButton(true);
      })
      .catch((error) => {
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          onError(error.response.data.error);
        } else {
          onError("An unknown error occurred.");
        }
      });
  };

  const fetchReturnedTaskLogs = () => {
    fetchName();
    const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios
      .get("https://agilepmtest.agilebiz.co.ke/api/fromtestingtodevelopment", {
        ...config,
        params: {
          email: userEmail,
          roleName: userDepartment,
        },
      })
      .then((response) => {
        if (response.status === 401) {
          navigate("/");
        }

        setReturnedTaskLogs(response.data);
        const logs = response.data.user_tasks.flat();

        setFlattenedLogs(logs);
      })
      .catch((error) => {
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          onError(error.response.data.error);
        } else {
          onError("An unknown error occurred.");
        }
      });
  };

  // Truncate comments to 5 words
  const truncateComments = (rowData) => {
    if (rowData.comment !== null) {
      const words = rowData.comment.split(" ");
      let finalComment;

      if (words.length > 5) {
        const truncatedText = words.slice(0, 5).join(" ");
        finalComment = `${truncatedText}...`;
      } else {
        finalComment = rowData.comment;
      }

      return _.startCase(finalComment.toLowerCase());
    }
    return null; // It's generally a good idea to have a default return outside of conditions.
  };

  function truncateAndFormatDescription(description) {
    // Truncate to 5 words
    const words = description?.split(" ");
    let truncatedDescription;
    if (words?.length > 5) {
      truncatedDescription = words?.slice(0, 5).join(" ") + "...";
    } else {
      truncatedDescription = description;
    }

    // Convert to sentence case
    return _.startCase(truncatedDescription);
  }

  const baseUrl = "https://agilepmtest.agilebiz.co.ke/storage/";

  const downloadLink2 = (rowData) => {
    const downloadUrl = rowData.path ? `${baseUrl}${rowData.path}` : "";

    const downloadFile = () => {
      
      if (downloadUrl) {
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.target = "_blank";

        a.download = "downloaded_file_name.extension"; // Set the desired file name here
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    };

    return (
      <div>
        {rowData.path !== null ? (
          <Button
            onClick={downloadFile}
            severity="success"
            className="w-24 h-10"
          >
            Download File
          </Button>
        ) : (
          <Button disabled severity="warning" className="w-24 h-9">
            File Not Available
          </Button>
        )}
      </div>
    );
  };

  const downloadLink = (rowData) => {
    const downloadUrl = rowData.task_logs?.image_path
      ? `${baseUrl}${rowData.task_logs?.image_path}`
      : "";

    const downloadFile = () => {
      if (downloadUrl) {
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.target = "_blank";
        a.download = "downloaded_file_name.extension"; // Set the desired file name here
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    };

    return (
      <div>
        {downloadUrl !== "" ? (
          <Button
            onClick={downloadFile}
            severity="success"
            className="w-24 h-10"
          >
            Download File
          </Button>
        ) : (
          <Button disabled severity="warning" className="w-24 h-9">
            File Not Available
          </Button>
        )}
      </div>
    );
  };

  // Function to show the details dialog
  const showDetailsDialog = (rowData) => {
    setShowDetails(true);
    setMoreDetailsData(rowData);
  };

  const showDetailsDialogLogs = (rowData) => {
    setShowDetailsLogs(true);
    setMoreDetailsData(rowData);
  };

  const showSubtaskMore = (rowData) => {
    setViewMore(true);
    setProjectSubtasks(rowData);
  };

  const disableShowSubtaskMore = () => {
    setViewMore(false);
    setProjectSubtasks([]);
  };

  const showDelegateDialog = (data) => {
    setShowDelegate(true);
    setProjectInfo(data);
  };

  const disableShowDelegateDialog = () => {
    setShowDelegate(false);
    setProjectInfo(null);
  };

  const onSuccessfulDelegation = () => {
    setRefreshTasks(!refreshTasks);
  };

  const sentenceCaseFormatter = (rowData, column) => {
    return _.startCase(rowData[column.field]);
  };

  //function to push to the next stage(i.e Development)
  const pushTodevelopment = () => {
    const selectedIds = selectedTasks?.map((row) => row.id);
    if (selectedIds.length > 0) {
      fetchName();
      setPushLoading(true);
      const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      axios
        .post(
          "https://agilepmtest.agilebiz.co.ke/api/pushToTesting",
          {
            taskIds: selectedIds,
          },
          config
        )
        .then((response) => {
          if (response.status === 401) {
            navigate("/");
          }

          setTimeout(() => {
            onSuccess(response.data.message);
            fetchMyTasks(userEmail, userRole, userDepartment);
            setPushLoading(false);
          }, 1000);
          setViewMore(false);
        })
        .catch((error) => {
          setPushLoading(false);

          onError(error);
        });
    } else {
      onWarn("Select atleast one task");
    }
  };

  return (
    <div>
      <Toast ref={toast} />
      <h1> Development task(s)</h1>

      <div className="flex justify-between p-4 space-x-0.5 items-center">
        <div className="flex space-x-0.5">
          <button
            onClick={() => setActiveView("My Tasks")}
            className={`p-2 rounded-md relative ${
              activeView === "My Tasks" ? "bg-blue-500" : "bg-gray-400"
            } transition-colors`}
          >
            My Tasks
            {/* The circle element displaying the count */}
            <div
              style={{
                position: "absolute",
                top: "-10px",
                right: "-10px",
                backgroundColor: "black", // Change this to your preferred color
                color: "white",
                borderRadius: "50%",
                width: "20px", // Adjust these values
                height: "20px", // as needed
                textAlign: "center",
                lineHeight: "20px", // Should be equal to height for vertical centering
                fontSize: "12px", // Adjust as needed
              }}
            >
              {myTaskCount} {/* Replace 'count' with the actual count */}
            </div>
          </button>

          {(hasViewAllTasks || hasTeamTasks) && (
            <button
              style={{ marginLeft: "10px" }}
              onClick={() => {
                setActiveView("Other Tasks");
                fetchOtherTasks(userEmail, userRole, userDepartment); // Fetch data from the API when the component mounts
              }}
              className={`p-2 rounded-md relative ${
                activeView === "Other Tasks" ? "bg-blue-500" : "bg-gray-400"
              } transition-colors`}
            >
              Other Tasks
              {viewOtherTaskCircle && (
                <div
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    backgroundColor: "black",
                    color: "white",
                    borderRadius: "50%",
                    width: "20px", //
                    height: "20px", //
                    textAlign: "center",
                    lineHeight: "20px",
                    fontSize: "12px",
                  }}
                >
                  {otherTaskCount}
                </div>
              )}
            </button>
          )}

          <button
            style={{ marginLeft: "10px" }}
            onClick={() => {
              setActiveView("Returned task history");
              fetchReturnedTaskLogs();
            }}
            className={`p-2 rounded-md ${
              activeView === "Returned task history"
                ? "bg-blue-500"
                : "bg-gray-400"
            } transition-colors`}
          >
            Returned task(s) history
          </button>
        </div>

        {/* Sprint name on the right */}
        <p
          style={{ marginRight: "30px" }}
          className="text-black-600 cursor-pointer hover:text-black-600 mr-8 mb-auto z-20"
          onMouseEnter={() => setShowSprintPopUp(true)}
          onMouseLeave={() => setShowSprintPopUp(false)}
        >
          <span className="font-semibold">Sprint name:</span>
          {_.startCase(tasksData.name)}
          {showSprintPopup && (
            <div className="absolute bg-white p-3 w-48  border rounded-md shadow-lg mt-2">
              <p className="text-gray-600">
                <span className="font-semibold">Status:</span>{" "}
                {_.startCase(tasksData.status)}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Start Date:</span>
                {tasksData.start_date}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">End Date:</span>
                {tasksData.end_date}
              </p>
            </div>
          )}
        </p>
      </div>

      {/* My Tasks section */}
      {activeView === "My Tasks" && (
        <div>
          {tasksData && microTasksData.length > 0 ? (
            <div>
              <div className="flex items-center justify-center pt-2"></div>
              <div className="mb-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(_.groupBy(microTasksData, "project.id")).map(
                  ([projectId, projectSubtasks], index) => (
                    <div
                      key={index}
                      className="mb-4 border bg-white rounded-lg shadow-lg p-4"
                    >
                      <div>
                        {/* Sentence casing for project title */}
                        <h2 className="font-bold mb-4 text-center">
                          {_.startCase(
                            projectSubtasks[0]?.project?.title || ""
                          )}
                        </h2>
                        <ol>
                          {projectSubtasks
                            .slice(0, 3)
                            .map((subtask, subIndex) => (
                              <li
                                key={subIndex}
                                className="border-b border-gray-300 last:border-b-0" /* Add thin line between items */
                              >
                                {/* Explicit count added */}
                                {subIndex + 1}. {_.startCase(subtask.task)}
                              </li>
                            ))}
                        </ol>
                      </div>
                      <div className="flex justify-end" key={index}>
                        <button
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:shadow-outline mt-4"
                          onClick={() => showSubtaskMore(projectSubtasks)}
                          disabled={viewMore}
                        >
                          View More
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center pt-10">
              <div className="max-w-md p-6 bg-white rounded-lg shadow-lg justify-center">
                <h1 className="text-center font-bold">
                  You have no Tasks in Stage:to-do in the active Sprint
                </h1>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Other Tasks section */}
      {activeView === "Other Tasks" && (hasViewAllTasks || hasTeamTasks) && (
        <div>
          {otherData && otherData.length > 0 ? (
            <div>
              <div className="flex items-center justify-center pt-2"></div>
              <div className="mb-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2  gap-4">
                {Object.entries(_.groupBy(otherData, "project.id")).map(
                  ([projectId, projectSubtasks], index) => {
                    // Convert project title to sentence casing
                    let projectTitle = _.startCase(
                      projectSubtasks[0]?.project?.title || ""
                    );

                    return (
                      <div
                        key={index}
                        className="mb-4 border bg-white rounded-lg shadow-lg p-4"
                      >
                        <div>
                          <h2 className="font-bold mb-4 text-center">
                            {projectTitle}
                          </h2>
                          <ol className="divide-y divide-gray-200">
                            {projectSubtasks.slice(0, 3).map((subtask, idx) => (
                              <li key={idx} className="py-1">
                                {/* Convert subtask to sentence casing */}
                                {idx + 1}. {_.startCase(subtask.task)}
                              </li>
                            ))}
                          </ol>
                        </div>
                        <div className="flex justify-end">
                          <button
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:shadow-outline mt-4"
                            onClick={() => showSubtaskMore(projectSubtasks)}
                            disabled={viewMore}
                          >
                            View More
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center pt-10">
              <div className="max-w-md p-6 bg-white rounded-lg shadow-lg justify-center">
                <h1 className="text-center font-bold">
                  You have not been assigned in any project in the active Sprint
                </h1>
              </div>
            </div>
          )}
        </div>
      )}

      {activeView === "Returned task history" && (
        <div>
          {flattenedLogs.length > 0 ? (
            <DataTable
              header={customHeader}
              filters={filters}
              paginator
              rows={10}
              rowsPerPageOptions={[10, 20, 30]}
              value={flattenedLogs}
              className="border rounded-md p-4 bg-white"
            >
              <Column
                field="task_logs.subTask.task"
                header="Task"
                body={(rowData, columnProps) => {
                  const task = sentenceCaseFormatter(rowData, columnProps);
                  return `${columnProps.rowIndex + 1}. ${task}`;
                }}
              ></Column>

              <Column
                field="task_logs.subTask.description"
                header="Description"
                body={(rowData) =>
                  truncateAndFormatDescription(
                    rowData.task_logs?.subTask?.description
                  )
                }
              ></Column>

              {/* <Column
                field="status"
                header="Status"
                body={sentenceCaseFormatter}
              ></Column>
              <Column
                field="stage"
                header="Stage"
                body={sentenceCaseFormatter}
              ></Column> */}

              <Column
                header="Time Stamp"
                body={(rowData) =>
                  `${rowData.task_logs?.date} ${rowData.task_logs?.time}`
                }
              ></Column>

              <Column field="task_logs.count" header="Times Returned"></Column>

              <Column
                field="task_logs.comment"
                header="Comments"
                body={(rowData) =>
                  truncateAndFormatDescription(rowData.task_logs?.comment)
                }
              ></Column>

              <Column header="Download Data" body={downloadLink}></Column>

              <Column
                header="More Details"
                body={(rowData) => (
                  <div className="flex" key={rowData.task_logs?.id}>
                    <FaInfoCircle
                      className="bg-blue-500 text-white rounded cursor-pointer"
                      size={30}
                      style={{ marginRight: 4 }}
                      onClick={() => showDetailsDialogLogs(rowData)}
                    />
                  </div>
                )}
              ></Column>
            </DataTable>
          ) : (
            <div className="flex items-center justify-center pt-10">
              <div className="max-w-md p-6 bg-white rounded-lg shadow-lg justify-center">
                <h1 className="text-center font-bold">
                  No returned task history found.
                </h1>
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <Dialog
          header={customHeader}
          visible={viewMore}
          onHide={() => disableShowSubtaskMore()}
          style={{ width: "98vw" }}
          footer={
            <>
              {hasPushTesting && (
                <div className="justify-between flex">
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded-md"
                    onClick={pushTodevelopment}
                    disabled={pushLoading} // Disable the button while loading
                  >
                    {pushLoading ? (
                      <i
                        className="pi pi-spin pi-spinner"
                        style={{ fontSize: "1.4rem" }}
                      ></i>
                    ) : (
                      "Push to Testing"
                    )}
                  </button>
                </div>
              )}

              {/* {hasCloseTasks && (
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md"
                  onClick={openConfirmDialog}
                  disabled={pushLoading} // Disable the button while loading
                >
                  {pushLoading ? (
                    <i
                      className="pi pi-spin pi-spinner"
                      style={{ fontSize: "1.4rem" }}
                    ></i>
                  ) : (
                    "Close the task (s)"
                  )}
                </button>
              )} */}
            </>
          }
        >
          <DataTable
            value={projectSubtasks}
            className="border rounded-md p-4 bg-white"
            removableSort
            selectionMode="checkbox"
            filters={filters}
            paginator
            rows={10}
            rowsPerPageOptions={[10, 20, 30]}
            selection={selectedTasks}
            onSelectionChange={(e) => setSelectedTasks(e.value)}
            dataKey="id"
          >
            <Column
              selectionMode="multiple"
              headerStyle={{ width: "3rem" }}
            ></Column>
            <Column
              field="task"
              header="Task"
              body={(rowData, columnProps) => {
                const task = sentenceCaseFormatter(rowData, columnProps);
                return `${columnProps.rowIndex + 1}. ${task}`;
              }}
            ></Column>
            {/* <Column
              field="description"
              header="Description"
              body={sentenceCaseFormatter}
            ></Column> */}
            <Column
              field="department"
              header="Department"
              body={sentenceCaseFormatter}
            ></Column>
            <Column field="start_date" header="Start Date" />
            <Column field="end_date" header="End Date" />
            <Column
              field="close_date"
              header="Completion Date"
              sortable
            ></Column>

            <Column header="Duration" body={durationTemplate}></Column>

            <Column
              field="subtask_sprints[0].status"
              header="Status"
              body={(rowData, columnProps) => {
                const status = rowData.subtask_sprints[0].status;
                return sentenceCaseFormatter(
                  { [columnProps.field]: status },
                  columnProps
                );
              }}
            />

            <Column
              header="stages"
              field="stage"
              body={sentenceCaseFormatter}
            />

            <Column header="Comments" body={truncateComments}></Column>
            <Column header="Download Data" body={downloadLink2}></Column>

            <Column
              header="More Details"
              body={(rowData) => (
                <div className="flex" key={rowData.id}>
                  <FaInfoCircle
                    className="bg-blue-500 text-white rounded cursor-pointer"
                    size={30}
                    style={{ marginRight: 4 }}
                    onClick={() => showDetailsDialog(rowData)}
                  />
                </div>
              )}
            ></Column>
          </DataTable>
        </Dialog>
      </div>

      <div>
      <Dialog
          header={"Subtask Details"}
          visible={showDetails}
          onHide={() => setShowDetails(false)}
          style={{ width: "50vw" }}
        >
          <div className="bg-white p-4 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Subtask Details
            </h3>
            <div className="mb-4">
              <p className="text-gray-600">
                <span className="font-semibold">Task:</span>{" "}
                {_.startCase((moreDetailsData?.task ?? "").toLowerCase())}
              </p>

              {moreDetailsData && moreDetailsData.phase && (
                <p className="text-gray-600">
                  <span className="font-semibold">Phase:</span>{" "}
                  {_.startCase(moreDetailsData.phase.name)}
                </p>
              )}

              {moreDetailsData && moreDetailsData.phase_activity && (
                <p className="text-gray-600">
                  <span className="font-semibold">Phase:</span>{" "}
                  {_.startCase(moreDetailsData.phase_activity.name)}
                </p>
              )}

              <p className="text-gray-600">
                <span className="font-semibold">Description:</span>{" "}
                {_.startCase(
                  (moreDetailsData?.description ?? "").toLowerCase()
                )}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Department:</span>{" "}
                {_.startCase((moreDetailsData?.department ?? "").toLowerCase())}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Assigned To:</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {moreDetailsData.assignedto?.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold"
                  >
                    <p key={index}>
                      {_.startCase(
                        (item?.custom_user?.firstName ?? "").toLowerCase()
                      )}{" "}
                      {_.startCase(
                        (item?.custom_user?.lastName ?? "").toLowerCase()
                      )}{" "}
                      -{item?.custom_user?.email}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-gray-600">
                <span className="font-semibold">Assigned BA:</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {moreDetailsData.baassignedto?.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold"
                  >
                    <p key={index}>
                      {_.startCase(
                        (item?.custom_user?.firstName ?? "").toLowerCase()
                      )}{" "}
                      {_.startCase(
                        (item?.custom_user?.lastName ?? "").toLowerCase()
                      )}{" "}
                      -{item?.custom_user?.email}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-gray-600">
                <span className="font-semibold">Status:</span>
                {moreDetailsData.subtask_sprints
                  ? _.startCase(
                      moreDetailsData.subtask_sprints[0]?.status?.toLowerCase() ??
                        ""
                    )
                  : ""}
              </p>

              <p className="text-gray-600">
                <span className="font-semibold">Stage:</span>
                {_.startCase((moreDetailsData?.stage ?? "").toLowerCase())}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Start Date:</span>
                {moreDetailsData?.start_date}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">End Date:</span>
                {moreDetailsData?.end_date}
              </p>
            </div>
            <textarea
              className="w-full h-32 p-2 border rounded-lg resize-none text-gray-600"
              readOnly
              value={_.startCase(
                (moreDetailsData?.comment ?? "").toLowerCase()
              )}
            ></textarea>

            {/* Delegate/Apply Button */}
            {hasAssignPermissionTasks && (
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded-md mt-4"
                onClick={() => showDelegateDialog(moreDetailsData)}
              >
                Assign
              </button>
            )}
          </div>
        </Dialog>
      </div>

      <div>
        <Dialog
          header={"Subtask Logs Details"}
          visible={showDetailslog}
          onHide={() => setShowDetailsLogs(false)}
          style={{ width: "50vw" }}
        >
         <div className="bg-white p-4 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Subtask Details
            </h3>
            <div className="mb-4">
              <p className="text-gray-600">
                <span className="font-semibold">Task:</span>{" "}
                {_.startCase(
                  (
                    moreDetailsData?.task_logs?.subTask?.task ?? ""
                  ).toLowerCase()
                )}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Description:</span>{" "}
                {_.startCase(
                  (
                    moreDetailsData?.task_logs?.subTask?.description ?? ""
                  ).toLowerCase()
                )}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Department:</span>{" "}
                {_.startCase(
                  (
                    moreDetailsData?.task_logs?.subTask?.department ?? ""
                  ).toLowerCase()
                )}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Assigned To:</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {moreDetailsData?.task_logs?.subTask?.assigned_to?.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold"
                    >
                      {item.email && <p key={index}>{item.email}</p>}
                    </div>
                  )
                )}
              </div>
              <p className="text-gray-600">
                <span className="font-semibold">Assigned BA:</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {moreDetailsData?.task_logs?.subTask?.baassigned_to?.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold"
                    >
                      {item.email && <p key={index}>{item.email}</p>}
                    </div>
                  )
                )}
              </div>

              <p className="text-gray-600">
                <span className="font-semibold">Status:</span>
                {moreDetailsData.subtask_sprints
                  ? _.startCase(
                      moreDetailsData.subtask_sprints[0]?.status?.toLowerCase() ??
                        ""
                    )
                  : ""}
              </p>

              <p className="text-gray-600">
                <span className="font-semibold">Stage:</span>
                {_.startCase(
                  (
                    moreDetailsData?.task_logs?.subTask?.stage ?? ""
                  ).toLowerCase()
                )}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Start Date:</span>
                {moreDetailsData?.task_logs?.subTask?.start_date}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">End Date:</span>
                {moreDetailsData?.task_logs?.subTask?.end_date}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Close Date:</span>
                {moreDetailsData?.task_logs?.subTask?.close_date ?? ""}
              </p>
            </div>
            <textarea
              className="w-full h-32 p-2 border rounded-lg resize-none text-gray-600"
              readOnly
              value={_.startCase(
                (moreDetailsData?.task_logs?.comment ?? "").toLowerCase()
              )}
            ></textarea>
          </div>
        </Dialog>
      </div>

      <DelegateTaskDialog
        showDelegate={showDelegate}
        disableShowDelegateDialog={disableShowDelegateDialog}
        projectInfomation={projectInfo}
        roleName={userDepartment}
        onSuccess={onSuccessfulDelegation}
      />
    </div>
  );
};

export default DevelopmentTasks;
