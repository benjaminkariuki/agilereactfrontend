import React, { useState, useEffect } from "react";

const Sprints = ({ projectId }) => {
  const [sprints, setSprints] = useState([]);
  const [isViewing, setIsViewing] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState(null);

  useEffect(() => {
    // Temporary mock data for testing
    const mockSprints = [
      {
        id: 1,
        name: "project 1 sprints",
        overview: "Overview of Sprint 1",
        milestones: [
          "Milestone 1 of project 1",
          "Milestone 2 of project 1",
          "Milestone 3 of project 1",
        ],
        highPriority: "High Priority Sprint 1",
        completedSprints: [
          "Completed Sprint 1",
          "Completed Sprint 2",
          "Completed Sprint 3",
        ],
      },
      {
        id: 2,
        name: "project 2 sprints",
        overview: "Overview of Sprint 2",
        milestones: [
          "Milestone 1 of Sprint 2",
          "Milestone 2 of Sprint 2",
          "Milestone 3 of Sprint 2",
        ],
        highPriority: "High Priority Sprint 2",
        completedSprints: [
          "Completed Sprint 4",
          "Completed Sprint 5",
          "Completed Sprint 6",
        ],
      },
      // Add more mock sprints if needed
    ];

    setSprints(mockSprints);
  }, []);

  const handleView = (sprintId) => {
    setSelectedSprint(sprintId);
    setIsViewing(true);
  };

  const handleClose = () => {
    setSelectedSprint(null);
    setIsViewing(false);
  };

  const renderMilestoneList = (milestones) => {
    return (
      <ul>
        {milestones.map((milestone, index) => (
          <li key={index}>{milestone}</li>
        ))}
      </ul>
    );
  };

  const renderSprintCard = (sprint) => {
    return (
      <div key={sprint.id} className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">{sprint.name}</h3>
        <p>{sprint.overview}</p>
        <button
          className="bg-blue-500 text-white font-semibold px-3 py-2 rounded-md mt-4"
          onClick={() => handleView(sprint.id)}
        >
          View
        </button>
      </div>
    );
  };

  const renderSprintDetailCard = (sprint) => {
    return (
      <div key={sprint.id} className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-xl font-semibold mb-4">{sprint.name}</h2>
        <div className="mb-4 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Overview</h3>
          <p className="text-gray-600">{sprint.overview}</p>
        </div>

        <div className="mb-4 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Milestones</h3>
          {renderMilestoneList(sprint.milestones)}
        </div>

        <div className="mb-4 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">High Priority</h3>
          <p className="text-gray-600">{sprint.highPriority}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Completed Sprints</h3>
          {renderMilestoneList(sprint.completedSprints)}
        </div>
      </div>
    );
  };

  return (
    <div
      className="w-full"
      style={{ overflowY: "auto", maxHeight: "calc(100vh - 64px)" }}
    >
      {" "}
      <h2 className="text-xl font-semibold mb-4">Sprints</h2>
      {isViewing ? (
        <div>
          {sprints.map((sprint) => {
            if (sprint.id === selectedSprint) {
              return (
                <div key={sprint.id}>
                  {renderSprintDetailCard(sprint)}
                  <button
                    className="bg-red-500 text-white font-semibold px-3 py-2 rounded-md mt-4"
                    onClick={handleClose}
                  >
                    Close
                  </button>
                </div>
              );
            }
            return null;
          })}
        </div>
      ) : (
        <div>{sprints.map((sprint) => renderSprintCard(sprint))}</div>
      )}
    </div>
  );
};

export default Sprints;
