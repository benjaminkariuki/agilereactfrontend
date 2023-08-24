import React, { useEffect, useState } from "react";
import axios from "axios";
import { Chart } from "primereact/chart";
import { Button } from "primereact/button";
import { ConfirmDialog } from "primereact/confirmdialog";
import Subtasks from "./Subtasks";

const ActiveSprint = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    axios
      .get("https://agile-pm.agilebiz.co.ke/api/activeSprint")
      .then((response) => setData(response.data))
      .catch((error) => setError(error.message));
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  const totalTasks = data.subtasks.length;
  const completedTasks = data.subtasks.filter(
    (task) => task.status === "completed"
  ).length;
  const openTasks = data.subtasks.filter(
    (task) => task.status === "open"
  ).length;

  let projectTasks = {};
  data.subtasks.forEach((task) => {
    if (projectTasks[task.project.title]) {
      projectTasks[task.project.title] += 1;
    } else {
      projectTasks[task.project.title] = 1;
    }
  });

  const tasksData = {
    labels: ["Open", "Completed"],
    datasets: [
      {
        data: [openTasks, completedTasks],
        backgroundColor: ["#42A5F5", "#66BB6A"],
        hoverBackgroundColor: ["#64B5F6", "#81C784"],
      },
    ],
  };

  const projectData = {
    labels: Object.keys(projectTasks),
    datasets: [
      {
        data: Object.values(projectTasks),
        backgroundColor: ["#42A5F5", "#66BB6A"], // add more colors if there are more than two projects
        hoverBackgroundColor: ["#64B5F6", "#81C784"], // add more hover colors if there are more than two projects
      },
    ],
  };

  const click = () => {
    setVisible(true);
  };

  const hide = () => {
    setVisible(false);
  };

  const accept = () => {
    // implement your functionality here
    hide();
  };

  const reject = () => {
    // implement your functionality here
    hide();
  };

  return (
    <div className="active-sprint">
      <h1 className="text-2xl font-bold mb-4">Active Sprint</h1>
      <div className="card mb-4">
        <Chart type="bar" data={tasksData} />
      </div>
      <div className="card mb-4">
        <Chart type="bar" data={projectData} />
      </div>
      <Button
        label="Close Sprint"
        className="p-button-danger"
        onClick={click}
      />
      <ConfirmDialog
        visible={visible}
        onHide={hide}
        message="Are you sure you want to close this sprint?"
        header="Confirmation"
        icon="pi pi-exclamation-triangle"
        accept={accept}
        reject={reject}
      />
      <Subtasks subtasks={data.subtasks} />
    </div>
  );
};

export default ActiveSprint;
