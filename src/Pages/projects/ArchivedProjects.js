import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Toast } from "primereact/toast";
import * as AiIcons from "react-icons/ai";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

const Archive = ({ onRestoreProject }) => {
  const [projects, setProjects] = useState([]);
  const toast = useRef(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const confirmDelete = (id) => {
    confirmDialog({
      message: "Do you want to delete this record?",
      header: "Delete Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => handleDeleteProject(id),
    });
  };

  const confirmRestore = (id) => {
    confirmDialog({
      message: "Do you want to restore this record?",
      header: "Restore Confirmation",
      icon: "pi pi-info-circle",
      accept: () => handleRestoreProject(id),
    });
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
    setIsRestoring(true);
    try {
      const response = await axios.post(
        `https://agile-pm.agilebiz.co.ke/api/restore/${id}`
      );

      if (response.status === 200) {
        onSuccess("Restored");
        setIsRestoring(false);
        await fetchProjects();
      } else {
        onError("Failed to restore project:");
        setIsRestoring(false);
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        onError(error.response.data.message);
      } else {
        onError("Failed to restore project");
      }
      setIsRestoring(false);
    }
  };

  const handleDeleteProject = async (id) => {
    setIsDeleting(true);
    try {
      const response = await axios.delete(
        `https://agile-pm.agilebiz.co.ke/api/deletePermanently/${id}`
      );
      // If deletion was successful
      if (response.status === 200) {
        onSuccess("Project deleted successfully");
        setIsDeleting(false);
        await fetchProjects();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        onError(error.response.data.message);
      } else {
        onError("Failed to delete project");
      }
      setIsDeleting(false);
    }
  };

  const ProjectCard = ({ project }) => {
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

        <div key={project.id} className="flex space-x-2 mt-2">
          {/* Restore Button */}
          <button
            onClick={() => confirmRestore(project.id)}
            className="bg-green-500 text-white font-semibold px-2 py-1 rounded-md"
            disabled={isRestoring || isDeleting}
          >
            {isRestoring ? "Restoring..." : "Restore"}
          </button>

          {/* Delete Button */}
          <button
            key={project.id}
            onClick={() => confirmDelete(project.id)}
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
      <ConfirmDialog />
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
