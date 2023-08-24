import React, { useEffect, useState } from "react";
import axios from "axios";
import { ProgressBar } from "primereact/progressbar";
import { Chart } from "primereact/chart";
import { Dialog } from "primereact/dialog";
import { FiInfo } from "react-icons/fi";

const ActiveSprint = () => {
  const [sprintData, setSprintData] = useState(null);
  const [selectedSubtask, setSelectedSubtask] = useState(null);

  useEffect(() => {
    async function fetchSprintData() {
      try {
        const response = await axios.get(
          "https://agile-pm.agilebiz.co.ke/api/activeSprint"
        );
        setSprintData(response.data);
      } catch (error) {
        console.error("Error fetching sprint data:", error);
      }
    }

    fetchSprintData();
  }, []);

  const calculateProgress = (startDate, endDate) => {
    const currentDate = new Date();
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const totalDuration = endDateObj - startDateObj;
    const elapsedDuration = currentDate - startDateObj;
    const progress = (elapsedDuration / totalDuration) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const subtaskProgressData = sprintData
    ? sprintData.subtasks.map((subtask) => ({
        id: subtask.id,
        label: subtask.task,
        progress: calculateProgress(subtask.start_date, subtask.end_date),
        project: subtask.project.title,
        status: subtask.status,
      }))
    : [];

  const groupedSubtasks = subtaskProgressData.reduce((groups, subtask) => {
    const group = subtask.project;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(subtask);
    return groups;
  }, {});

  const primaryColor = "#007BFF";
  const highPriorityColor = "#FF073A";
  const completedColor = "#28A745";

  const chartData = {
    labels: sprintData
      ? sprintData.subtasks.map((subtask) => subtask.task)
      : [],
    datasets: [
      {
        label: "Open",
        data: subtaskProgressData
          .filter((data) => data.status === "open")
          .map((data) => data.progress),
        backgroundColor: primaryColor,
        borderColor: primaryColor,
        borderWidth: 1,
      },
      {
        label: "High Priority",
        data: subtaskProgressData
          .filter((data) => data.status === "highpriority")
          .map((data) => data.progress),
        backgroundColor: highPriorityColor,
        borderColor: highPriorityColor,
        borderWidth: 1,
      },
      {
        label: "Completed",
        data: subtaskProgressData
          .filter((data) => data.status === "completed")
          .map((data) => data.progress),
        backgroundColor: completedColor,
        borderColor: completedColor,
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 10,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  const chartPlugins = [
    {
      id: "customLegend",
      beforeDraw(chart) {
        const width = chart.width;
        const height = chart.height;
        const ctx = chart.ctx;

        ctx.restore();
        const fontSize = 12;
        ctx.font = fontSize + "px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const legendColors = chart.data.datasets.map(
          (dataset) => dataset.backgroundColor
        );

        const legendItems = chart.data.datasets.flatMap((dataset, index) => {
          const color = legendColors[index];
          return dataset.data.map((data, dataIndex) => ({
            text: dataset.label,
            fillStyle: color,
            dataIndex,
          }));
        });

        let offsetX = 0;
        legendItems.forEach((legendItem, index) => {
          const textWidth = ctx.measureText(legendItem.text).width;
          const x = (width - textWidth) / 2 + offsetX;
          const y = height - fontSize - 10;
          offsetX += textWidth + 30;

          ctx.fillStyle = legendItem.fillStyle;
          ctx.fillRect(x, y, fontSize, fontSize);
          ctx.fillStyle = "black";
          ctx.fillText(legendItem.text, x + fontSize + 5, y + fontSize / 2);
        });
        ctx.save();
      },
    },
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(groupedSubtasks).map(([project, subtasks]) => (
          <div key={project} className="mb-6 bg-white rounded-lg shadow p-4 ">
            <h2 className="text-xl font-semibold mb-2">{project}</h2>
            {subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="bg-white rounded-lg p-4 hover:shadow-xl transition duration-300 cursor-pointer m-2"
                onClick={() => setSelectedSubtask(subtask)}
              >
                <h3 className="text-lg font-medium mb-2">{subtask.label}</h3>
                <div className="flex items-center">
                  <ProgressBar
                    value={subtask.progress}
                    className="flex-1"
                    style={{
                      backgroundColor:
                        subtask.status === "open"
                          ? primaryColor
                          : subtask.status === "highpriority"
                          ? highPriorityColor
                          : completedColor,
                    }}
                  />
                  <span className="ml-2">{`${subtask.progress.toFixed(
                    2
                  )}%`}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div className="mb-6 bg-white rounded-lg shadow p-4 ">
          <Chart
            type="bar"
            data={chartData}
            options={chartOptions}
            plugins={chartPlugins}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>
      <Dialog
        visible={selectedSubtask !== null}
        onHide={() => setSelectedSubtask(null)}
        header="Subtask Details"
        style={{ width: "50vw" }}
        footer={
          <button
            className="p-button p-button-text p-button-rounded"
            onClick={() => setSelectedSubtask(null)}
          >
            Close
          </button>
        }
      >
        {selectedSubtask && (
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {selectedSubtask.label}
            </h2>
            <p className="mb-4">
              <span className="font-semibold">Start Date: </span>
              {selectedSubtask.start_date}
            </p>
            <p className="mb-4">
              <span className="font-semibold">End Date: </span>
              {selectedSubtask.end_date}
            </p>
            <ProgressBar value={selectedSubtask.progress} />
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default ActiveSprint;
