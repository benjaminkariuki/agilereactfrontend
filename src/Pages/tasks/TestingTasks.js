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
import { Editor } from "@tinymce/tinymce-react";
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode, FilterOperator } from 'primereact/api';

const TestingTasks = () => {
  const { userRole, userEmail, userActivities, userDepartment } = useSelector(
    (state) => state.user
  );
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [tasksData, setTasksData] = useState([]);
  const [microTasksData, setMicroTasksData] = useState([]);
  const [viewMore, setViewMore] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [showDelegate, setShowDelegate] = useState(false);
  const [showDetailslog, setShowDetailsLogs] = useState(false);

  const [moreDetailsData, setMoreDetailsData] = useState([]);
  const [pushLoading, setPushLoading] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [comment, setComment] = useState("");
  const [pushLoadingDev, setPushLoadingDev] = useState(false);
  const [otherData, setOtherData] = useState([]);
  const toast = useRef(null);
  const [projectSubtasks, setProjectSubtasks] = useState([]);
  const [projectInfo, setProjectInfo] = useState(null);
  const [refreshTasks, setRefreshTasks] = useState(false);
  const [activeView, setActiveView] = useState("My Tasks");
  const [returnedTaskLogs, setReturnedTaskLogs] = useState([]);
  const [flattenedLogs, setFlattenedLogs] = useState([]);
  const [showSprintPopup, setShowSprintPopUp] = useState(false);
  
  const [filters,setFilters] = useState({
    global:{value:null, matchMode:FilterMatchMode.CONTAINS},
  })

  //getting permission for tasks
  const tasksActivity = userActivities.find(
    (activity) => activity.name === "Tasks"
  );
  const hasWritePermissionTasks = tasksActivity
    ? tasksActivity.pivot.permissions.includes("write")
    : false;

  const Role = userRole; // Replace this with how you get the user's role
  const normalizedRole = Role.toLowerCase(); // Convert the role to lowercase for case-insensitive checking
  const normalizedDepartment = userDepartment.toLowerCase();

  const hasPermissionTasksProjects =
    normalizedRole.includes("portfolio manager") ||
    normalizedRole.includes("head") ||
    normalizedRole.includes("team lead");

  const hasPermissionTaskDelegation =
    normalizedRole.includes("team lead") ||
    normalizedRole.includes("head") ||
    normalizedRole.includes("portfolio manager");

  const hasPermissionPushReviewAndBackTesting =
    normalizedDepartment.includes("implementation") ||
    normalizedDepartment.includes("infrastructure");

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
        summary: "Error",
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
  const onInfo = (info) => {
    if (info) {
      toast.current?.show({
        severity: "info",
        summary: "Successfull",
        detail: `${info}`,
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
  const startDate = new Date(Date.UTC(new Date(rowData.start_date).getFullYear(), new Date(rowData.start_date).getMonth(), new Date(rowData.start_date).getDate()));
  const endDate = new Date(Date.UTC(new Date(rowData.end_date).getFullYear(), new Date(rowData.end_date).getMonth(), new Date(rowData.end_date).getDate()));
  const closeDate = rowData.close_date ? new Date(Date.UTC(new Date(rowData.close_date).getFullYear(), new Date(rowData.close_date).getMonth(), new Date(rowData.close_date).getDate())) : null;

  const daysUntilEnd = Math.floor(
    (endDate - currentDate) / (1000 * 60 * 60 * 24)
  );
  const totalDurationIfClosed = closeDate
    ? Math.floor((closeDate - startDate) / (1000 * 60 * 60 * 24))
    : null;
  const daysOverdue = endDate < currentDate && rowData.status !== "complete"
    ? Math.floor((currentDate - endDate) / (1000 * 60 * 60 * 24))
    : null;

  if (rowData.status === "complete" && closeDate) {
    return <span>{totalDurationIfClosed} day(s) </span>;
  } else if (daysUntilEnd >= 0) {
    return <span style={{ color: "green" }}>{daysUntilEnd} day(s) remaining</span>;
  } else if (daysOverdue) {
    return (
      <span style={{ color: "red" }}>
        {daysOverdue} day(s) overdue
      </span>
    );
  } else {
    return <span>Project not started</span>;
  }
};


  useEffect(() => {
    fetchMyTasks(userEmail, userRole, userDepartment); // Fetch data from the API when the component mounts
  }, [userRole, userEmail]); // Empty dependency array ensures this effect runs once

  const fetchMyTasks = (userEmail, userRole, userDepartment) => {
    const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios
      .get("https://agile-pm.agilebiz.co.ke/api/myTasksTesting", {
        params: {
          email: userEmail,
          roleName: userRole,
          department: userDepartment,
        },
        ...config, // spread the config object here
      })
      .then((response) => {
        setTasksData(response.data.activeSprint);
        setMicroTasksData(response.data.activeSprint.subtasks);
      })
      .catch((error) => {

        if (error.response && error.response.data && error.response.data.error) {
          onError(error.response.data.error);
        } else {
          onError("An unknown error occurred.");
        }
      });
  };

  const fetchOtherTasks = (userEmail, userRole, userDepartment) => {
    const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios
      .get("https://agile-pm.agilebiz.co.ke/api/OtherTasksTesting", {
        params: {
          email: userEmail,
          roleName: userRole,
          department: userDepartment,
        },
        ...config, // spread the config object here
      })
      .then((response) => {
        setOtherData(response.data.allSubtasks);
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.error) {
          onError(error.response.data.error);
        } else {
          onError("An unknown error occurred.");
        }
      });
  };

  const fetchReturnedTaskLogs = () => {
    const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios
      .get("https://agile-pm.agilebiz.co.ke/api/fromreviewtotesting", {
        params: {
          email: userEmail,
          roleName: userRole,
        },
        ...config, // spread the config object here
      })
      .then((response) => {
        setReturnedTaskLogs(response.data);
        const logs = response.data.user_tasks.flatMap((task) => task.task_logs);
        setFlattenedLogs(logs);
      })
      .catch((error) => {

        if (error.response && error.response.data && error.response.data.error) {
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

  // Create a download link
  const baseUrl = "https://agile-pm.agilebiz.co.ke/storage/";
  const downloadLink = (rowData) => {
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

  function truncateAndFormatDescription(description) {
    // Truncate to 5 words
    const words = description.split(" ");
    let truncatedDescription;
    if (words.length > 5) {
      truncatedDescription = words.slice(0, 5).join(" ") + "...";
    } else {
      truncatedDescription = description;
    }

    // Convert to sentence case
    return _.startCase(truncatedDescription);
  }

  //function to push to the next stage(i.e Development)
  const pushToReview = () => {
    const selectedIds = selectedTasks?.map((row) => row.id);
    if (selectedIds.length > 0) {
      setPushLoading(true);
      const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      axios
        .post(
          "https://agile-pm.agilebiz.co.ke/api/pushToReview",
          {
            taskIds: selectedIds,
          },
          config
        )
        .then((response) => {
          setTimeout(() => {
            onSuccess(response.data.message);
            fetchMyTasks(userEmail, userRole, userDepartment);
            setPushLoading(false);
          }, 1000);
          setViewMore(false);
        })
        .catch((error) => {
          setPushLoading(false);
        });
    } else {
      onWarn("Select atleast one task");
    }
  };

  //conditions to check before opening the dialog
  const openSubmitDialog = () => {
    if (selectedTasks.length === 1) setShowSubmit(true);
    else if (selectedTasks.length > 1)
      onWarn("Only one Micro-task should be selected");
    else onWarn("Select atleast one Micro-task");
  };
 

  const onFileUpload = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file); // Set selectedFile to null if no file is selected
  };

  // Define a custom rendering function for the 'Start Date' column
 

  // Define a custom rendering function for the 'End Date' column

  //submit the reason to push back
  const submitPushBack = (event) => {
    event.preventDefault();
    setPushLoadingDev(true);
    const formData = new FormData();
    formData.append("taskId", selectedTasks[0].id);

    if (selectedFile !== null && selectedFile !== undefined) {
      formData.append("imageUpload", selectedFile);
    }

    formData.append("comment", comment);
    const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios
      .post(
        "https://agile-pm.agilebiz.co.ke/api/returnToDevelopment",
        formData,
        {
          headers: {
            ...config.headers,
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        setTimeout(() => {
          onInfo(response.data.message);
          fetchMyTasks(userEmail, userRole, userDepartment);
          setPushLoadingDev(false);
        }, 1000);
        setShowSubmit(false);
        setSelectedFile(null);
        setComment("");
      })
      .catch((error) => {
        onError("Error encountered");
        setPushLoadingDev(false);
      });
  };

  return (
    <div>
      <Toast ref={toast} />
      <h1> Testing task(s)</h1>

      <div className="flex justify-between p-4 space-x-0.5 items-center">
        <div className="flex space-x-0.5">
        <button
          onClick={() => setActiveView("My Tasks")}
          className={`p-2 rounded-md ${
            activeView === "My Tasks" ? "bg-blue-500" : "bg-gray-400"
          } transition-colors`}
        >
          My Tasks
        </button>

        {hasPermissionTasksProjects && (
          <button
            onClick={() => {
              setActiveView("Other Tasks");
              fetchOtherTasks(userEmail, userRole, userDepartment); // Fetch data from the API when the component mounts
            }}
            className={`p-2 rounded-md ${
              activeView === "Other Tasks" ? "bg-blue-500" : "bg-gray-400"
            } transition-colors`}
          >
            Other Tasks
          </button>
        )}

        <button
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
          className="text-black-600 cursor-pointer hover:text-black-600 mr-4 mb-auto z-20"
          onMouseEnter={() => setShowSprintPopUp(true)}
          onMouseLeave={() => setShowSprintPopUp(false)}
        >
          <span className="font-semibold">Sprint name:</span>
          {_.startCase(tasksData.name)}
          {showSprintPopup && (
            <div className="absolute bg-white p-3 border rounded-md shadow-lg mt-2">
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
      {activeView === "Other Tasks" && hasPermissionTasksProjects && (
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
              value={flattenedLogs}
              header={customHeader}

              filters={filters}
              className="border rounded-md p-4 bg-white"
            >
              <Column
                field="task"
                header="Task"
                body={(rowData, columnProps) => {
                  const task = sentenceCaseFormatter(rowData, columnProps);
                  return `${columnProps.rowIndex + 1}. ${task}`;
                }}
              ></Column>
             
              <Column
                field="description"
                header="Description"
                body={(rowData) =>
                  truncateAndFormatDescription(rowData.description)
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
                body={(rowData) => `${rowData.date} ${rowData.time}`}
              ></Column>
              <Column field="count" header="Times Returned"></Column>
              <Column
                field="comment"
                header="Comments"
                body={(rowData) =>
                  truncateAndFormatDescription(rowData.comment)
                }
              ></Column>

              <Column header="Download Data" body={downloadLink}></Column>

              <Column
                header="More Details"
                body={(rowData) => (
                  <div className="flex" key={rowData.id}>
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
            <div className="justify-between flex">
              {hasPermissionPushReviewAndBackTesting && (
                <button
                  className="px-4 py-2 bg-yellow-700 text-white rounded-md"
                  onClick={openSubmitDialog}
                  disabled={showSubmit} // Disable the button while loading
                >
                  Push Back to development
                </button>
              )}
              {hasPermissionPushReviewAndBackTesting && (
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded-md"
                  onClick={pushToReview}
                  disabled={pushLoading} // Disable the button while loading
                >
                  {pushLoading ? (
                    <i
                      className="pi pi-spin pi-spinner"
                      style={{ fontSize: "1.4rem" }}
                    ></i>
                  ) : (
                    "Push to Review"
                  )}
                </button>
              )}
            </div>
          }
        >
          <DataTable
            value={projectSubtasks}
            className="border rounded-md p-4 bg-white"
            removableSort
            selectionMode="checkbox"
            filters={filters}
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
              field="status"
              header="Status"
              body={sentenceCaseFormatter}
            ></Column>
            <Column
              header="stages"
              field="stage"
              body={sentenceCaseFormatter}
            />
          
            <Column header="Comments" body={truncateComments}></Column>
            <Column header="Download Data" body={downloadLink}></Column>
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
          header="Reason to Push back"
          visible={showSubmit}
          onHide={() => setShowSubmit(false)}
          style={{ width: "50vw" }}
        >
          <form>
            <div className="flex flex-col items-center">
              <h2 className="mb-4 font-bold">Add Comment</h2>

              <textarea
                type="text"
                name="comment"
                placeholder="Comment section"
                onChange={(e) => {
                  setComment(e.target.value);
                }}
                className="w-full border rounded py-2 px-3 mb-4"
                style={{ height: "150px" }}
              />

              <div className="mb-4">
                <label
                  className="block text-gray-700 font-bold mb-2"
                  htmlFor="proof-file"
                >
                  Upload File
                </label>
                <input
                  type="file"
                  onChange={onFileUpload}
                  name="imageUpload" // Ensure this name matches the backend expectation
                  accept="image/*"
                />
              </div>
              <div className="mt-4">
                <button
                  onClick={submitPushBack}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:shadow-outline mt-2"
                  disabled={pushLoadingDev}
                >
                  {pushLoadingDev ? (
                    <i
                      className="pi pi-spin pi-spinner"
                      style={{ fontSize: "1.4rem" }}
                    ></i>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </div>
          </form>
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
                {_.startCase((moreDetailsData?.status ?? "").toLowerCase())}
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

            {hasPermissionTaskDelegation && (
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
                {_.startCase((moreDetailsData?.task ?? "").toLowerCase())}
              </p>
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
                {moreDetailsData.assigned_to?.map((item, index) => (
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
                {moreDetailsData.baassigned_to?.map((item, index) => (
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
                {_.startCase((moreDetailsData?.status ?? "").toLowerCase())}
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
          </div>
        </Dialog>
      </div>

      <DelegateTaskDialog
        showDelegate={showDelegate}
        disableShowDelegateDialog={disableShowDelegateDialog}
        projectInfomation={projectInfo}
        roleName={userRole}
        onSuccess={onSuccessfulDelegation}
      />
    </div>
  );
};

export default TestingTasks;
