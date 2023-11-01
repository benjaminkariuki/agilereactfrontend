import React, { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import _ from "lodash";
import axios from "axios";
import { Toast } from "primereact/toast";
import { FaInfoCircle } from "react-icons/fa";
import { confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Subtasks = ({ subtasks, sprintId, reloadData, component }) => {
  const [visible, setVisible] = useState(false);
  const [selectedSubtasks, setSelectedSubtasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState([]);
  const [removeLoading, setremoveLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [moreDetailsData, setMoreDetailsData] = useState([]);
  const toast = useRef(null);
  const navigate = useNavigate();

  const { userActivities } = useSelector((state) => state.user);

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const sprintsActivity = userActivities.find(
    (activity) => activity.name === "Sprints"
  );

  //read permission
  const hasReadPermissionSprints = sprintsActivity
    ? sprintsActivity.pivot.permissions.includes("read")
    : false;

  //write permissions
  const hasWritePermissionSprints = sprintsActivity
    ? sprintsActivity.pivot.permissions.includes("write")
    : false;

  const confirmRemove = (sprintId) => {
    confirmDialog({
      message: "Are you sure you want to close this sprint?",
      header: "Close Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => handleRemoveFromSprint(sprintId),
    });
  };
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
        summary: "Error occurred",
        detail: `${error}`,
        life: 3000,
      });
    }
  };
  const onWarn = (error) => {
    if (error && toast.current) {
      toast.current?.show({
        severity: "warn",
        summary: "Error occurred",
        detail: `${error}`,
        life: 3000,
      });
    }
  };

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

  const openDialog = (projectTitle) => {
    const projectSubtasks = subtasks.filter(
      (subtask) => subtask.project.title === projectTitle
    );
    setSelectedSubtasks(projectSubtasks);
    setVisible(true);
  };

  const closeDialogue = () => {
    setSelectedTask([]);
    setVisible(false);
  };

  const showDetailsDialog = (rowData) => {
    setShowDetails(true);
    setMoreDetailsData(rowData);
  };

  const sentenceCaseFormatter = (rowData, column) => {
    return _.startCase(rowData[column.field]);
  };

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

  const handleRemoveFromSprint = () => {
    if (selectedTask.length > 0) {
      fetchName();
      setremoveLoading(true);
      const removedTask = selectedTask.map((task) => task.id);
      const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      axios
        .post(
          `https://agilepmtest.agilebiz.co.ke/api/removeTasks/${sprintId}`,
          {
            taskIds: removedTask,
          },
          config
        )
        .then((response) => {
          if (response.status === 401) {
            navigate("/");
          }

          setremoveLoading(false);
          onSuccess(response.data.message);
          setVisible(false);
          reloadData();
        })
        .catch((error) => {
          setremoveLoading(false);

          onError(error);
        });
    } else {
      onWarn("Select atleast one Micro-task");
    }
  };

  return (
    <div className="w-full ">
      <Toast ref={toast} />
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2  gap-4">
        {Object.entries(_.groupBy(subtasks, "project.title")).map(
          ([projectTitle, projectSubtasks], index) => (
            <div
              key={index}
              className="mb-4 border bg-white rounded-lg shadow-lg p-4"
            >
              <div>
                <h2 className="font-bold mb-4 text-center">
                  {_.startCase(projectTitle)}
                </h2>

                <ol>
                  {projectSubtasks.slice(0, 3).map((subtask, index) => (
                    <li
                      key={index}
                      className="border-b border-gray-300 last:border-b-0"
                    >
                      {index + 1}. {_.startCase(subtask.task)}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex justify-end " key={index}>
                <button
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:shadow-outline mt-4"
                  onClick={() => openDialog(projectTitle)}
                >
                  View More
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <Dialog
        header={customHeader}
        visible={visible}
        onHide={closeDialogue}
        style={{ width: "98vw" }}
        footer={
          component === "active" && (
            <div className="flex justify-end">
              {hasWritePermissionSprints && (
                <button
                  className="mr-2 px-4 py-2 bg-red-500 text-white rounded-md"
                  onClick={() => confirmRemove(sprintId)}
                  disabled={removeLoading}
                >
                  {removeLoading ? (
                    <i
                      className="pi pi-spin pi-spinner"
                      style={{ fontSize: "1.4rem" }}
                    ></i>
                  ) : (
                    "Remove from current sprint"
                  )}
                </button>
              )}
            </div>
          )
        }
      >
        {selectedSubtasks && (
          <div>
            <DataTable
              value={selectedSubtasks}
              selectionMode="checkbox"
              selection={selectedTask}
              filters={filters}
              paginator
              rows={10}
              rowsPerPageOptions={[10, 20]}
              onSelectionChange={(e) => setSelectedTask(e.value)}
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
            /> */}
              <Column field="start_date" header="Start Date" />
              <Column field="end_date" header="End Date" />
              <Column
                field="close_date"
                header="Completion Date"
                sortable
              ></Column>

              <Column header="Duration" body={durationTemplate}></Column>
              <Column
                field="department"
                header="Department"
                body={sentenceCaseFormatter}
              />
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
                header="stage"
                field="stage"
                body={sentenceCaseFormatter}
              />
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
          </div>
        )}
      </Dialog>

      <div>
        <Dialog
          header={"Sprint Item Details"}
          visible={showDetails}
          onHide={() => setShowDetails(false)}
          style={{ width: "50vw" }}
        >
          <div className="bg-white p-4 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Sprint Item Details
            </h3>
            <div className="mb-4">
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
                      {(item?.email ?? "").toLowerCase()}{" "}
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
                      {(item?.email ?? "").toLowerCase()}{" "}
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
                <span className="font-semibold">ClosedBy: {moreDetailsData?.closedBy ?? ""}</span>
                
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
    </div>
  );
};

export default Subtasks;
