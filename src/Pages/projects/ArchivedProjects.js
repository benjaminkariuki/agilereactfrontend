import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Toast } from "primereact/toast";
import * as AiIcons from "react-icons/ai";

const Archive = ({ onRestoreProject }) => {
  const [projects, setProjects] = useState([]);
  const [archiveStatus, setArchivedStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const toast = useRef(null);

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
        summary: "Please upload micro task(s)",
        detail: `${error}`,
        life: 3000,
      });
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const archivedProjectsResponse = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/allProjectsArchived"
      );
      const archivedProjects = archivedProjectsResponse.data.data;
      setProjects(archivedProjects);
      onSuccess("Archived projects");
    } catch (error) {
      if (error.response.status === 404) {
        onWarn(error.response.data.message);
        return;
      }
      onError("Error fetching archived projects:");
    }
  };

  const handleRestoreProject = async (id) => {
    try {
      const response = await axios.post(
        `https://agile-pm.agilebiz.co.ke/api/restore/${id}`
      );

      // If restoration was successful
      if (response.status === 200) {
        console.log("Restored");
        await fetchProjects(); // Refetch the projects to update the listing
      } else {
        console.log("Failed to restore project:", response.data.message);
        setArchivedStatus(response.data.message);
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setArchivedStatus(error.response.data.message);
        setErrorMessage(error.response.data.message);
      } else {
        setArchivedStatus("Failed to restore project");
        setErrorMessage("Failed to restore project");
      }
    }
  };

  const handleDeleteProject = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this project permanently?"
      )
    ) {
      try {
        const response = await axios.delete(
          `https://agile-pm.agilebiz.co.ke/api/deletePermanently/${id}`
        );

        // If deletion was successful
        if (response.status === 200) {
          console.log("Project deleted successfully");
          await fetchProjects(); // Refetch the projects to update the listing
        } else {
          console.log("Failed to delete project:", response.data.message);
          setArchivedStatus(response.data.message);
        }
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          setArchivedStatus(error.response.data.message);
          setErrorMessage(error.response.data.message);
        } else {
          setArchivedStatus("Failed to delete project");
          setErrorMessage("Failed to delete project");
        }
      }
    }
  };

  const ProjectCard = ({ project }) => {
    const [isRestoring, setIsRestoring] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    return (
      <div
        key={project.id}
        className="bg-white rounded-lg shadow p-4 h-64 flex flex-col justify-between relative"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">{project.title}</h2>
          <p></p>
          {/* Display project status icons based on project status */}
          {project.status === "In Progress" && (
            <AiIcons.AiFillClockCircle className="text-yellow-500 text-2xl" />
          )}
          {project.status === "Completed" && (
            <AiIcons.AiFillCheckCircle className="text-green-500 text-2xl" />
          )}
          {project.status === "Planned" && (
            <AiIcons.AiFillCloseCircle className="text-red-500 text-2xl" />
          )}
        </div>
        <div className="flex-1 max-h-40 overflow-y-auto bg-white border rounded-md shadow-sm p-4">
          <p className="text-gray-600 break-words">{project.overview}</p>
        </div>

        <div className="flex space-x-2 mt-2">
          {/* Restore Button */}
          <button
            onClick={async () => {
              setIsRestoring(true);

              try {
                await handleRestoreProject(project.id);
              } catch (error) {
                // Handle errors, if necessary
              } finally {
                setIsRestoring(false);
              }
            }}
            className="bg-green-500 text-white font-semibold px-2 py-1 rounded-md"
            disabled={isRestoring || isDeleting}
          >
            {isRestoring ? "Restoring..." : "Restore"}
          </button>

          {/* Delete Button */}
          <button
            onClick={async () => {
              setIsDeleting(true);

              try {
                await handleDeleteProject(project.id);
              } catch (error) {
                // Handle errors, if necessary
              } finally {
                setIsDeleting(false);
              }
            }}
            className="bg-red-500 text-white font-semibold px-2 py-1 rounded-md"
            disabled={isRestoring || isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Toast ref={toast} />
      {errorMessage && <p>{errorMessage}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div key={project.id}>
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Archive;
