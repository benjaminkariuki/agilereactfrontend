import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { ProgressBar } from "primereact/progressbar";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Chart as ChartJS } from "chart.js";

const Dashboard = () => {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://agile-pm.agilebiz.co.ke/api/activeSprint"
        );
        setSprints([response.data]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTaskStatusData = () => {
    const statusCounts = {
      Completed: 0,
      Incomplete: 0,
    };

    sprints.forEach((sprint) => {
      sprint.subtasks.forEach((subtask) => {
        if (subtask.status === "Completed") {
          statusCounts.Completed++;
        } else {
          statusCounts.Incomplete++;
        }
      });
    });

    return {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          data: Object.values(statusCounts),
          backgroundColor: ["#36A2EB", "#FFCE56"], // Customize the colors as per your preference
        },
      ],
    };
  };

  const calculateProgress = () => {
    let completedTasks = 0;
    let totalTasks = 0;

    sprints.forEach((sprint) => {
      sprint.subtasks.forEach((subtask) => {
        totalTasks++;
        if (subtask.status === "Completed") {
          completedTasks++;
        }
      });
    });

    return (completedTasks / totalTasks) * 100;
  };

  const getTaskTimeData = () => {
    const data = {
      labels: [],
      datasets: [
        {
          label: "Time Taken",
          data: [],
          backgroundColor: "#36A2EB", // Customize the color as per your preference
        },
      ],
    };

    sprints.forEach((sprint) => {
      sprint.subtasks.forEach((subtask) => {
        const startDate = new Date(subtask.start_date);
        const endDate = new Date(subtask.end_date);
        const timeTaken = endDate.getTime() - startDate.getTime();

        data.labels.push(subtask.task);
        data.datasets[0].data.push(timeTaken);
      });
    });

    return data;
  };

  const openSubtaskDialog = (subtask) => {
    setSelectedSubtask(subtask);
    setDialogVisible(true);
  };

  const closeSubtaskDialog = () => {
    setSelectedSubtask(null);
    setDialogVisible(false);
  };

  // useEffect(() => {
  //   ChartJS.defaults.global.defaultFontSize = 12;
  // }, []);
  const calculateDuration = (sDate, eDate) => {
    const startDate = new Date(sDate);
    const endDate = new Date(eDate);
    const timeDifference = endDate.getTime() - startDate.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
    return daysDifference;
  };

  return (
    <div className="p-grid p-dir-col">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h2>
            Total Tasks:{" "}
            {sprints.reduce(
              (total, sprint) => total + sprint.subtasks.length,
              0
            )}
          </h2>
          <div className="p-grid p-justify-center">
            <div className="p-col-6">
              <Card>
                <h2>Task Progress</h2>
                <ProgressBar value={calculateProgress()} showValue={false} />
              </Card>
            </div>
            <div className="p-col-6">
              <Card>
                <h2>Task Status</h2>
                <Chart type="pie" data={getTaskStatusData()} height="150" />
              </Card>
            </div>
          </div>

          {sprints.map((sprint) => (
            <Card key={sprint.id} className="p-mb-2">
              <h2>{sprint.name}</h2>
              <p>Start Date: {sprint.start_date}</p>
              <p>End Date: {sprint.end_date}</p>
              <p>
                Duration:{" "}
                {calculateDuration(sprint.start_date, sprint.end_date)}
              </p>
              <h3>Subtasks:</h3>
              {sprint.subtasks.map((subtask) => (
                <Card
                  key={subtask.id}
                  className="p-mb-2"
                  onClick={() => openSubtaskDialog(subtask)}
                >
                  <h4>{subtask.task}</h4>
                  <p>Start Date: {subtask.start_date}</p>
                  <p>End Date: {subtask.end_date}</p>
                  <p>Description: {subtask.description}</p>
                  <p>Department: {subtask.department}</p>
                  <p>Status: {subtask.status}</p>
                </Card>
              ))}
            </Card>
          ))}

          <Card className="p-mb-2">
            <h2>Task Time</h2>
            <Chart type="bar" data={getTaskTimeData()} height="300" />
          </Card>
        </div>
      )}

      <Dialog
        visible={dialogVisible}
        onHide={closeSubtaskDialog}
        header="Subtask Details"
        style={{ width: "50vw" }}
      >
        {selectedSubtask && (
          <div>
            <h4>{selectedSubtask.task}</h4>
            <p>Start Date: {selectedSubtask.start_date}</p>
            <p>End Date: {selectedSubtask.end_date}</p>
            <p>Description: {selectedSubtask.description}</p>
            <p>Department: {selectedSubtask.department}</p>
            <p>Status: {selectedSubtask.status}</p>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default Dashboard;
