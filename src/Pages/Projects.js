import { useSelector } from "react-redux";
// import { Link } from "react-router-dom";
import projectsData from "../server/projectsData.json";
import * as AiIcons from "react-icons/ai";

const Projects = () => {
  const userRole = useSelector((state) => state.user.userRole);

  const canCreateEditDelete =
    userRole === "COO" || userRole === "Project Manager";

  const handleCreateProject = () => {
    // Logic for creating a new project
    console.log("Create project");
  };

  const handleEditProject = (projectId) => {
    // Logic for editing a project
    console.log("Edit project", projectId);
  };

  const handleDeleteProject = (projectId) => {
    // Logic for deleting a project
    console.log("Delete project", projectId);
  };

  return (
    <div>
      <h1 className="text-center text-3xl font-bold mb-4 text-blue-800">
        Projects
      </h1>
      {/* Create Project button */}
      {canCreateEditDelete && (
        <div className="mt-4">
          <button
            onClick={handleCreateProject}
            className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-md"
          >
            Create Project
          </button>
        </div>
      )}
      {/* Display projects */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projectsData.projects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow p-4">
            {/* Project Title */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">{project.title}</h2>
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

            {/* Project Overview */}
            <p className="text-gray-600">{project.overview}</p>

            {/* Edit and delete buttons */}
            {canCreateEditDelete && (
              <div className="mt-4">
                <button
                  onClick={() => handleEditProject(project.id)}
                  className="bg-yellow-500 text-white font-semibold px-2 py-1 rounded-md mr-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="bg-red-500 text-white font-semibold px-2 py-1 rounded-md"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
