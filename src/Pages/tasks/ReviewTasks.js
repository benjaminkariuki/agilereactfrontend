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
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

const ReviewTasks = () => {
  const { userRole, userEmail, userActivities } = useSelector(
    (state) => state.user
  );
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [tasksData, setTasksData] = useState([]); // State to store API data
  const [microTasksData, setMicroTasksData] = useState([]);
  const [viewMore, setViewMore] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [moreDetailsData, setMoreDetailsData] = useState([]);
  const [pushLoading, setPushLoading] = useState(false);
  const toast = useRef(null);
  const [selectedFile, setSelectedFile] = useState();
  const [comment, setComment] = useState("");
  const [pushLoadingTest, setPushLoadingTest] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [otherData, setOtherData] = useState([]);

  //getting permission for tasks
  const tasksActivity = userActivities.find(
    (activity) => activity.name === "Tasks"
  );
  const hasWritePermissionTasks = tasksActivity
    ? tasksActivity.pivot.permissions.includes("write")
    : false;
  //getting permission for only pms to close tasks
  const hasClosePermissionTasks =
    userRole === "Senior project manager" || userRole === "Project manager"
      ? true
      : false;
  //getting permission for only pms to view other tasks in different projects
  const hasPermissionTasksProjects =
    userRole === "Senior project manager" || userRole === "Project manager";
  //toast display functions
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

  //confirm dialoge to close the task(s)
  const confirmClose = () => {
    confirmDialog({
      message: "Do you want to close this task(S)?",
      header: "Close Confirmation",
      icon: "pi pi-info-circle",
      accept: pushToApproval,
    });
  };
  //condition before opening the above confirmDialogue
  //conditions to check before opening the dialog
  const openConfirmDialog = () => {
    if (selectedTasks.length === 1) confirmClose();
    else if (selectedTasks.length > 1)
      onWarn("Only one Micro-task should be selected");
    else onWarn("Select atleast one Micro-task");
  };
  useEffect(() => {
    fetchMyTasks(userEmail, userRole); // Fetch data from the API when the component mounts
  }, [userRole, userEmail]); // Empty dependency array ensures this effect runs once

  const fetchMyTasks = (userEmail, userRole) => {
    axios
      .get("https://agile-pm.agilebiz.co.ke/api/myTasksReview", {
        params: {
          email: userEmail,
          roleName: userRole,
        },
      })
      .then((response) => {
        setTasksData(response.data.activeSprint);
        setOtherData(response.data.allSubtasks);
        setMicroTasksData(response.data.activeSprint.subtasks);
      })
      .catch((error) => {
        onError("Error fetching data");
      });
  };
  // Truncate comments to 5 words
  const truncateComments = (rowData) => {
    if (rowData.comment !== null) {
      const words = rowData.comment.split(" ");
      if (words.length > 5) {
        const truncatedText = words.slice(0, 5).join(" ");
        return `${truncatedText}...`;
      }
      return rowData.comment;
    }
  };

  // Create a download link
  const baseUrl = "https://agile-pm.agilebiz.co.ke/storage/";
  const downloadLink = (rowData) => {
    const downloadUrl = rowData.path ? `${baseUrl}${rowData.path}` : "";

    const downloadFile = () => {
      if (downloadUrl) {
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = "downloaded_file_name.extension"; // Set the desired file name here
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    };

    return (
      <div>
        {rowData.path !== null ? (
          <Button onClick={downloadFile} severity="success">
            Download File
          </Button>
        ) : (
          <Button disabled severity="warning">
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

  //function to push to the next stage(i.e Development)
  const pushToApproval = () => {
    const selectedIds = selectedTasks?.map((row) => row.id);
    if (selectedIds.length > 0) {
      setPushLoading(true);
      axios
        .post("https://agile-pm.agilebiz.co.ke/api/pushToApproval", {
          taskIds: selectedIds,
        })
        .then((response) => {
          setTimeout(() => {
            onSuccess(response.data.message);
            fetchMyTasks(userEmail, userRole);
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

  //conditions to check before opening the dialog
  const openSubmitDialog = () => {
    if (selectedTasks.length === 1) setShowSubmit(true);
    else if (selectedTasks.length > 1)
      onWarn("Only one Micro-task should be selected");
    else onWarn("Select atleast one Micro-task");
  };
  //handle file upload
  const onFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedFile(file);
      };
      reader.readAsDataURL(file);
      setSelectedFile(file);
    }
  };

  //submit the reason to push back
  const submitPushBack = (event) => {
    event.preventDefault();
    setPushLoadingTest(true);
    const formData = new FormData();
    formData.append("taskId", selectedTasks[0].id);
    formData.append("imageUpload", selectedFile);
    formData.append("comment", comment);
    axios
      .post("https://agile-pm.agilebiz.co.ke/api/returnToTesting", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        setTimeout(() => {
          onInfo(response.data.message);
          fetchMyTasks(userEmail, userRole);
          setPushLoadingTest(false);
        }, 1000);
        setShowSubmit(false);
        setSelectedFile(null);
        setComment("");
      })
      .catch((error) => {
        onError("Error encountered");
        setPushLoadingTest(false);
      });
  };

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="mb-4 border bg-white rounded-lg shadow-lg p-4 mt-3">
        <h1>My progress chart</h1>
      </div>

      <div>
        {tasksData && microTasksData.length > 0 ? (
          <div>
            <div className="flex items-center justify-center pt-2">
              <h1 className="text-xl text-black font-bold mb-4 text-center max-w-md p-3 bg-white rounded-lg shadow-lg justify-center">
                My Tasks
              </h1>
            </div>
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2  gap-4">
              {Object.entries(_.groupBy(microTasksData, "project.title")).map(
                ([projectTitle, projectSubtasks], index) => (
                  <div
                    key={index}
                    className="mb-4 border bg-white rounded-lg shadow-lg p-4"
                  >
                    <div>
                      <h2 className="font-bold mb-4 text-center">
                        {projectTitle}
                      </h2>

                      <ol>
                        {projectSubtasks.slice(0, 3).map((subtask, index) => (
                          <li key={index}>{subtask.task}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="flex justify-end " key={index}>
                      <button
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:shadow-outline mt-4"
                        onClick={() => setViewMore(true)}
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
            <div className=" max-w-md p-6 bg-white rounded-lg shadow-lg justify-center">
              <h1 className="text-center font-bold">
                You have no Tasks in Stage:review in the active Sprint
              </h1>
            </div>
          </div>
        )}
        {hasPermissionTasksProjects && (
          <div>
            {" "}
            {otherData && otherData.length > 0 ? (
              <div>
                <div className="flex items-center justify-center pt-2">
                  <h1 className="text-xl text-black font-bold mb-4 text-center max-w-md p-3 bg-white rounded-lg shadow-lg justify-center">
                    Other Tasks
                  </h1>
                </div>
                <div className="mb-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2  gap-4">
                  {Object.entries(_.groupBy(otherData, "project.title")).map(
                    ([projectTitle, projectSubtasks], index) => (
                      <div
                        key={index}
                        className="mb-4 border bg-white rounded-lg shadow-lg p-4"
                      >
                        <div>
                          <h2 className="font-bold mb-4 text-center">
                            {projectTitle}
                          </h2>

                          <ol>
                            {projectSubtasks
                              .slice(0, 3)
                              .map((subtask, index) => (
                                <li key={index}>{subtask.task}</li>
                              ))}
                          </ol>
                        </div>
                        <div className="flex justify-end " key={index}>
                          <button
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:shadow-outline mt-4"
                            onClick={() => setViewMore(true)}
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
                <div className=" max-w-md p-6 bg-white rounded-lg shadow-lg justify-center">
                  <h1 className="text-center font-bold">
                    You have not been assigned in any project in the active
                    Sprint
                  </h1>
                </div>
              </div>
            )}
          </div>
        )}
        <div>
          <Dialog
            header="Subtask Details"
            visible={viewMore}
            onHide={() => setViewMore(false)}
            style={{ width: "80vw" }}
            footer={
              <div className="justify-between flex">
                {hasWritePermissionTasks && (
                  <button
                    className="px-4 py-2 bg-yellow-700 text-white rounded-md"
                    onClick={openSubmitDialog}
                    disabled={showSubmit} // Disable the button while loading
                  >
                    Push Back to Testing
                  </button>
                )}
                {hasClosePermissionTasks && (
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
                )}
              </div>
            }
          >
            <DataTable
              value={microTasksData}
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
              <Column field="task" header="Task"></Column>
              <Column field="description" header="Description"></Column>
              <Column field="department" header="Department"></Column>
              <Column field="status" header="Status"></Column>
              <Column header="stages" field="stage" />
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
          <Dialog
            header="Reason to Push back"
            visible={showSubmit}
            onHide={() => setShowSubmit(false)}
            style={{ width: "50vw" }}
          >
            <div className="flex flex-col items-center">
              <h2 className="mb-4">Add Comment</h2>
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
                  name="imageUpload"
                  accept="*"
                />
              </div>
              <div className="mt-4">
                <button
                  onClick={submitPushBack}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:shadow-outline mt-2"
                  disabled={pushLoadingTest}
                >
                  {pushLoadingTest ? (
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
          </Dialog>
        </div>
        <div>
          <Dialog
            header={moreDetailsData.task}
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
                  {moreDetailsData.task}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Description:</span>{" "}
                  {moreDetailsData.description}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Department:</span>{" "}
                  {moreDetailsData.department}
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
                        {item.custom_user.firstName} {item.custom_user.lastName}{" "}
                        - {item.custom_user.email}
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
                        {item.custom_user.firstName} {item.custom_user.lastName}{" "}
                        - {item.custom_user.email}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="text-gray-600">
                  <span className="font-semibold">Status:</span>
                  {moreDetailsData.status}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Stage:</span>
                  {moreDetailsData.stage}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Start Date:</span>
                  {moreDetailsData.start_date}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">End Date:</span>
                  {moreDetailsData.end_date}
                </p>
              </div>
              <textarea
                className="w-full h-32 p-2 border rounded-lg resize-none text-gray-600"
                readOnly
                value={moreDetailsData.comment || ""}
              ></textarea>
            </div>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default ReviewTasks;
