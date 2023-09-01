import React, { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import _ from "lodash";
import axios from "axios";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

const Subtasks = ({ subtasks, sprintId, reloadData, component }) => {
  const [visible, setVisible] = useState(false);
  const [selectedSubtasks, setSelectedSubtasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState([]);
  const [removeLoading, setremoveLoading] = useState(false);
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

  const handleRemoveFromSprint = () => {
    if (selectedTask.length > 0) {
      setremoveLoading(true);
      const removedTask = selectedTask.map((task) => task.id);
      axios
        .post(`https://agile-pm.agilebiz.co.ke/api/removeTasks/${sprintId}`, {
          taskIds: removedTask,
        })
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
            <h2 className="font-bold mb-4 text-center">{projectTitle}</h2>
          
            <ol>
              {projectSubtasks.slice(0, 3).map((subtask, index) => (
                <li key={index}>{subtask.task}</li>
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
        style={{ width: "80vw" }}
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
            <Column field="task" header="Task" />
            <Column field="description" header="Description" />
            <Column field="start_date" header="Start Date" />
            <Column field="end_date" header="End Date" />
            <Column field="department" header="Department" />
            <Column field="status" header="Status" />
            <Column header="stages" field="stage"/>
          </DataTable>
        )}
      </Dialog>
    </div>
  );
};

export default Subtasks;
