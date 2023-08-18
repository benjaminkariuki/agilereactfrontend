import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { FaThLarge, FaList } from "react-icons/fa";
import * as AiIcons from "react-icons/ai";

const ListProjects = ({ onEditProject, onViewProjectDetails, viewMode }) => {
  const [projects, setProjects] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  //const [viewMode, setViewMode] = useState("grid");
  //fetching user activities and the corresponding permissions
  const userActivities = useSelector((state) => state.user.userActivities);

  const projectsActivity = userActivities.find(
    (activity) => activity.name === "Projects"
  );
  // Check if the user has "read" and "write" permissions for the "Projects" activity
  const hasReadPermission = projectsActivity.pivot.permissions.includes("read");

  const hasWritePermission =
    projectsActivity.pivot.permissions.includes("write");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        "http://192.168.88.150:8000/api/allProjects"
      );

      const fetchedprojects = response.data.data;
      // Add an "isArchiving" property to each project in the fetched data
      const projectsWithStatus = fetchedprojects.map((project) => ({
        ...project,
        isArchiving: false,
      }));
      setProjects(projectsWithStatus);
    } catch (error) {
      console.error("Error getting projects:", error);
    }
  };

  const handleArchiveProject = async (id) => {
    try {
      setIsSubmitting(true);
      // Update the "isArchiving" state of the selected project to true
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === id ? { ...project, isArchiving: true } : project
        )
      );
      const response = await axios.post(
        `http://192.168.88.150:8000/api/archive/${id}`
      );
      // If archive was successful
      if (response.status === 200) {
        // Archive successful
        console.log("archived");
        // Refetch the projects
        await fetchProjects();
      } else {
        // Handle other status codes if needed
        console.log("Failed to archive project:", response.data.message);
        setDeleteStatus(response.data.message);
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        // Keep the delete status unchanged
        setDeleteStatus(error.response.data.message);
        // Also, set the error message
        setErrorMessage(error.response.data.message);
      } else {
        // Keep the delete status unchanged
        setDeleteStatus("Failed to archive project");
        // Also, set the error message
        setErrorMessage("Failed to archive project");
      }
    } finally {
      // Reset the "isArchiving" state to false after the archiving process is done

      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === id ? { ...project, isArchiving: false } : project
        )
      );

      setIsSubmitting(false);
    }
  };

  const ProjectCard = ({ project }) => (
    <div
      key={project.id}
      className="bg-white rounded-lg shadow p-4 h-64 flex flex-col justify-between relative"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">{project.title}</h2>

        <p></p>

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
        {hasReadPermission && hasWritePermission && (
          <button
            onClick={() => onEditProject(project.id)}
            className="bg-yellow-500 text-white font-semibold px-2 py-1 rounded-md"
          >
            Edit
          </button>
        )}

        <button
          onClick={() => onViewProjectDetails(project.id)}
          className="bg-blue-500 text-white font-semibold px-2 py-1 rounded-md"
        >
          View More
        </button>
        {hasReadPermission && hasWritePermission && (
          <button
            onClick={() => handleArchiveProject(project.id)}
            className="bg-red-500 text-white font-semibold px-2 py-1 rounded-md absolute right-2 "
            disabled={isSubmitting || project.isArchiving} // Disable the button if the project is currently archiving
          >
            {project.isArchiving ? "Archiving..." : "Archive"}
          </button>
        )}
      </div>
    </div>
  );
  // const toggleViewMode = () => {
  //   setViewMode((prevMode) => (prevMode === "grid" ? "list" : "grid"));
  // };
  // <div className="flex justify-end">
  //           {viewMode === "grid" ? (
  //             <FaList onClick={toggleViewMode} />
  //           ) : (
  //             <FaThLarge onClick={toggleViewMode} />
  //           )}

  //       </div>

  return (
    <div>
      {errorMessage && <p>{errorMessage}</p>}{" "}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4"
            : "flex flex-col gap-4"
        }
      >
        {projects.map((project) => (
          <div key={project.id}>
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListProjects;
