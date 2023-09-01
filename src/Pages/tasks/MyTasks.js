import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const MyTasks = () => {
  const { userRole, userEmail } = useSelector((state) => state.user);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [tasksData, setTasksData] = useState([]); // State to store API data
  const [microTasksData, setMicroTasksData] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchMyTasks(); // Fetch data from the API when the component mounts
  }, []); // Empty dependency array ensures this effect runs once
  const fetchMyTasks = () => {
    axios
      .get("https://agile-pm.agilebiz.co.ke/api/myTasks", {
        params: {
          email: userEmail,
          roleName: userRole,
        },
      })
      .then((response) => {
        setTasksData(response.data);
        console.log(response.data);
        setMicroTasksData(response.data.subtasks);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const columns = [
    { field: "task", header: "Task" },
    {},
    { field: "assignedTo", header: "Assigned to" },
    { field: "baAssignedTo", header: "BA assigned to" },
    {},
    { field: "phase", header: "Phase" },
    { field: "phaseActivity", header: "Phase activity" },
    {},
    {},
    {},
    {},
  ];

  return (
    <div>
      {tasksData ? (
        <DataTable
          value={microTasksData}
          className="border rounded-md p-4 bg-white"
          removableSort
        >
          <Column field="task" header="Task"></Column>
          <Column field="description" header="Description"></Column>
          <Column field="department" header="Department"></Column>
          <Column field="status" header="Status"></Column>
          <Column field="startDate" header="Start date"></Column>
          <Column field="endDate" header="End date"></Column>
        </DataTable>
      ) : (
        <div>
          <h1>Not Assigned in the active Sprint</h1>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
