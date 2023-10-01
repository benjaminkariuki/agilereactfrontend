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

const DevelopmentTasks = () => {
  const { userRole, userEmail, userDepartment } = useSelector((state) => state.user);
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

  const [activeView, setActiveView] = useState("My Tasks");
  const [returnedTaskLogs, setReturnedTaskLogs] = useState([]);

  const Role = userRole; // Replace this with how you get the user's role
  const normalizedRole = Role.toLowerCase();
   // Convert the role to lowercase for case-insensitive checking
   const normalizedDepartment = userDepartment.toLowerCase();

  const hasPermissionTasksProjects =
    normalizedRole.includes("portfolio manager") ||
    normalizedRole.includes("head") ||
    normalizedRole.includes("team lead");

    const hasPermissionTaskDelegation = normalizedRole.includes("team lead") || normalizedRole.includes("head") || normalizedRole.includes("portfolio manager");
    const hasPermissionPushTesting = normalizedDepartment.includes("implementation") ||  normalizedDepartment.includes("infrastructure");

   

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
        summary: "Error occurred",
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

  useEffect(() => {
    fetchMyTasks(userEmail, userRole,userDepartment); // Fetch data from the API when the component mounts
  }, [userEmail, userRole]); // Empty dependency array ensures this effect runs once

  const fetchMyTasks = (userEmail, userRole,userDepartment) => {
    axios
      .get("https://agile-pm.agilebiz.co.ke/api/myTasksDevelopment", {
        params: {
          email: userEmail,
          roleName: userRole,
          department: userDepartment,
        },
      })
      .then((response) => {
        setTasksData(response.data.activeSprint);
        setMicroTasksData(response.data.activeSprint.subtasks);
      })
      .catch((error) => {
        onError("Error fetching data");
      });
  };

  const fetchOtherTasks = (userEmail, userRole, userDepartment) => {
    axios
      .get("https://agile-pm.agilebiz.co.ke/api/OtherTasksDevelopment", {
        params: {
          email: userEmail,
          roleName: userRole,
          department: userDepartment,
        },
      })
      .then((response) => {
      
        setOtherData(response.data.allSubtasks);
      })
      .catch((error) => {
        onError("Error fetching data");
      });
  };

  const fetchReturnedTaskLogs = () => {
    axios
      .get("https://agile-pm.agilebiz.co.ke/api/fromtestingtodevelopment", {
        params: {
          email: userEmail,
          roleName: userRole,
        },
      })
      .then((response) => {
        setReturnedTaskLogs(response.data);
        console.log(returnedTaskLogs);
      })
      .catch((error) => {
        onError("Error fetching history");
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
        // Open the link in a new tab.
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
    console.log(rowData);
    setProjectSubtasks(rowData);
  };

  const disableShowSubtaskMore = () => {
    setViewMore(false);
    setProjectSubtasks([]);
  };

  const showDelegateDialog = (data) => {
    setShowDelegate(true);
    setProjectInfo(data);
    console.log(data);
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
      setPushLoading(true);
      axios
        .post("https://agile-pm.agilebiz.co.ke/api/pushToTesting", {
          taskIds: selectedIds,
        })
        .then((response) => {
          setTimeout(() => {
            onSuccess(response.data.message);
            fetchMyTasks(userEmail, userRole,userDepartment);
            setPushLoading(false);
          }, 1000);
          setViewMore(false);
        })
        .catch((error) => {
          console.log(error.response.data);
          setPushLoading(false);
        });
    } else {
      onWarn("Select atleast one task");
    }
  };

  return (
    <div>
      <Toast ref={toast} />
      <h1> Development task(s)</h1>

      <div className="flex p-4 space-x-0.5">
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

      <div className="mb-4 border bg-white rounded-lg shadow-lg p-4 mt-3">
        <p className="text-gray-600">
          <span className="font-semibold">Sprint name:</span>
          {_.startCase(tasksData.name)}
        </p>
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
          {returnedTaskLogs?.user_tasks?.length > 0 ? (
            <DataTable
              value={returnedTaskLogs.user_tasks.map(
                (task) => task.task_details
              )}
              className="border rounded-md p-4 bg-white"
            >
              <Column
                field="task"
                header="Task"
                body={sentenceCaseFormatter}
              ></Column>
              <Column
                field="description"
                header="Description"
                body={sentenceCaseFormatter}
              ></Column>
              <Column
                field="department"
                header="Department"
                body={sentenceCaseFormatter}
              ></Column>
              <Column
                field="status"
                header="Status"
                body={sentenceCaseFormatter}
              ></Column>
              <Column
                field="stage"
                header="Stage"
                body={sentenceCaseFormatter}
              ></Column>
              <Column field="start_date" header="Start Date"></Column>
              <Column field="end_date" header="End Date"></Column>
              <Column
                field="comment"
                header="Comments"
                body={truncateComments}
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
          header="Subtasks"
          visible={viewMore}
          onHide={() => disableShowSubtaskMore()}
          style={{ width: "98vw" }}
          footer={
            hasPermissionPushTesting &&  ( <div>
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
          )
          }
        >
          <DataTable
            value={projectSubtasks}
            className="border rounded-md p-4 bg-white"
            removableSort
            selectionMode="checkbox"
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
              body={sentenceCaseFormatter}
            ></Column>
            <Column
              field="description"
              header="Description"
              body={sentenceCaseFormatter}
            ></Column>
            <Column
              field="department"
              header="Department"
              body={sentenceCaseFormatter}
            ></Column>
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
            <Column field="start_date" header="Start Date" />
            <Column field="end_date" header="End Date" />
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

            {/* Delegate/Apply Button */}
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

export default DevelopmentTasks;
