import React, { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import _ from "lodash";
import axios from "axios";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

const Subtasks = ({ subtasks, sprintId, reloadData }) => {
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
  }

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
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="bg-white rounded-lg shadow p-4 ">
        {Object.entries(_.groupBy(subtasks, "project.title")).map(
          ([projectTitle, projectSubtasks], index) => (
            <div key={index} className="border">
              <h2 className="font-bold mb-4 text-center">{projectTitle}</h2>
              {projectSubtasks.slice(0, 3).map((subtask, index) => (
                <p key={index}>{subtask.description}</p>
              ))}
              <Button
                label="View More"
                onClick={() => openDialog(projectTitle)}
              />
            </div>
          )
        )}
        <Dialog
          header="Subtask Details"
          visible={visible}
          onHide={closeDialogue}
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
              <Column header="stages" />
            </DataTable>
          )}
          <div className="flex ">
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
        </Dialog>
      </div>
    </div>
  );
};

export default Subtasks;
