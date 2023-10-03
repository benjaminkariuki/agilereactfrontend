import React, { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import _ from "lodash";
import axios from "axios";
import { Toast } from "primereact/toast";
import { FaInfoCircle } from "react-icons/fa";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

const Subtasks = ({ subtasks, sprintId, reloadData, component }) => {
  const [visible, setVisible] = useState(false);
  const [selectedSubtasks, setSelectedSubtasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState([]);
  const [removeLoading, setremoveLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [moreDetailsData, setMoreDetailsData] = useState([]);
  const toast = useRef(null);

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
        summary: "Error occurred",
        detail: `${error}`,
        life: 3000,
      });
    }
  };

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
    console.log(rowData);
  };

  const sentenceCaseFormatter = (rowData, column) => {
    return _.startCase(rowData[column.field]);
  };

  const handleRemoveFromSprint = () => {
    if (selectedTask.length > 0) {
      setremoveLoading(true);
      const removedTask = selectedTask.map((task) => task.id);
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
      axios
        .post(`https://agile-pm.agilebiz.co.ke/api/removeTasks/${sprintId}`, {
          taskIds: removedTask,
         
        }, config)
        .then((response) => {
          setremoveLoading(false);
          onSuccess(response.data.message);
          setVisible(false);
          reloadData();
        })
        .catch((error) => {
          setremoveLoading(false);
          onError(error.response.data.errors);
        });
    } else {
      onWarn("Select atleast one Micro-task");
    }
  };

  return (
    <div className="w-full ">
      <Toast ref={toast} />
      <ConfirmDialog />
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
        header="Subtask Details"
        visible={visible}
        onHide={closeDialogue}
        style={{ width: "98vw" }}
        footer={
          component === "active" && (
            <div className="flex justify-end">
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
            </div>
          )
        }
      >
        {selectedSubtasks && (
          <DataTable
            value={selectedSubtasks}
            selectionMode="checkbox"
            selection={selectedTask}
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
            <Column
              field="description"
              header="Description"
              body={sentenceCaseFormatter}
            />
            <Column field="start_date" header="Start Date" />
            <Column field="end_date" header="End Date" />
            <Column
              field="department"
              header="Department"
              body={sentenceCaseFormatter}
            />
            <Column
              field="status"
              header="Status"
              body={sentenceCaseFormatter}
            />
            <Column header="stage" field="stage" body={sentenceCaseFormatter} />
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
    </div>
  );
};

export default Subtasks;
