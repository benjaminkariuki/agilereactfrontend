import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import _ from "lodash"; // Add this line

const Subtasks = ({ subtasks }) => {
  const [visible, setVisible] = useState(false);
  const [selectedSubtasks, setSelectedSubtasks] = useState([]);

  const openDialog = (projectTitle) => {
    const projectSubtasks = subtasks.filter(
      (subtask) => subtask.project.title === projectTitle
    );
    setSelectedSubtasks(projectSubtasks);
    setVisible(true);
  };

  const hideDialog = () => {
    setVisible(false);
  };

  return (
    <div>
      {Object.entries(_.groupBy(subtasks, "project.title")).map(
        ([projectTitle, projectSubtasks], index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4 h-64">
            <h2>{projectTitle}</h2>
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
      <Dialog header="Subtask Details" visible={visible} onHide={hideDialog}>
        {selectedSubtasks && (
          <DataTable value={selectedSubtasks}>
            <Column field="description" header="Description" />
            <Column field="status" header="Status" />
            <Column field="start_date" header="Start Date" />
            <Column field="end_date" header="End Date" />
            <Column field="department" header="Department" />
            <Column field="task" header="Task" />
          </DataTable>
        )}
      </Dialog>
    </div>
  );
};

export default Subtasks;
