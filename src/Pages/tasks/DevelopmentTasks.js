import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import _ from "lodash";
import { Dialog } from "primereact/dialog";
import { FaInfoCircle } from "react-icons/fa";
import { Toast } from "primereact/toast";

const DevelopmentTasks = () => {
  const { userRole, userEmail } = useSelector((state) => state.user);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [tasksData, setTasksData] = useState([]); // State to store API data
  const [microTasksData, setMicroTasksData] = useState([]);
  const [viewMore, setViewMore] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [moreDetailsData, setMoreDetailsData] = useState([]);
  const [pushLoading, setPushLoading] = useState(false);
  const toast = useRef(null);

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

  useEffect(() => {
    fetchMyTasks(userEmail, userRole); // Fetch data from the API when the component mounts
  }, [userEmail, userRole]); // Empty dependency array ensures this effect runs once

  const fetchMyTasks = (userEmail, userRole) => {
    axios
      .get("https://agile-pm.agilebiz.co.ke/api/myTasksDevelopment", {
        params: {
          email: userEmail,
          roleName: userRole,
        },
      })
      .then((response) => {
        setTasksData(response.data);
        setMicroTasksData(response.data.subtasks);
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
  const downloadLink = (rowData) => {
    return (
      <a href={rowData.path} download>
        Download
      </a>
    );
  };

  // Function to show the details dialog
  const showDetailsDialog = (rowData) => {
    setShowDetails(true);
    setMoreDetailsData(rowData);
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
            fetchMyTasks();
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
      <div className="mb-4 border bg-white rounded-lg shadow-lg p-4 mt-3">
        <h1>My progress chart</h1>
      </div>
      <div>
        {tasksData && microTasksData.length > 0 ? (
          <div>
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
                Not Assigned in the active Sprint
              </h1>
            </div>
          </div>
        )}
        <div>
          <Dialog
            header="Subtask Details"
            visible={viewMore}
            onHide={() => setViewMore(false)}
            style={{ width: "80vw" }}
            footer={
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

export default DevelopmentTasks;
