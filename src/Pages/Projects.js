import { useSelector, useDispatch } from "react-redux";
import React, { useState, useEffect } from "react";
import * as AiIcons from "react-icons/ai";
import axios from "axios";
//import { useNavigate } from "react-router-dom";
import { createProject } from "../slices/projectsSlice"; // Import the createProject action

const Projects = () => {
  const userRole = useSelector((state) => state.user.userRole);
  const userId = useSelector((state) => state.user.userId);
  const [create, setCreate] = useState(false);
  const [projects, setProjects] = useState([]);
  //const Navigate = useNavigate();
  const dispatch = useDispatch();

  const canCreateEditDelete =
    userRole === "COO" || userRole === "Project Manager";

  useEffect(() => {
    axios
      .get("http://192.168.88.188:8000/api/projects")
      .then((response) => {
        const filteredProjects = response.data.filter((project) => {
          if (userRole === "COO" || userRole === "Project Manager") {
            return true;
          } else {
            return (
              project.projectManager === userId ||
              project.businessAnalyst === userId ||
              project.developers.includes(userId) ||
              project.teamLeads.includes(userId)
            );
          }
        });

        setProjects(filteredProjects);
      })
      .catch((error) => {
        // Handle the error if needed
      });
  }, [userRole, userId]);

  const handleCreateProject = () => {
    setCreate(!create);
    console.log("Create project");
  };

  const handleEditProject = (projectId) => {
    // Navigate.push(`/projects/${projectId}/edit`);
  };

  const handleDeleteProject = (projectId) => {
    console.log("Delete project", projectId);
  };

  const ProjectCard = ({ project }) => (
    <div key={project.id} className="bg-white rounded-lg shadow p-4">
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

      <p className="text-gray-600">{project.overview}</p>

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
  );

  function DropdownField({ label, name, value, onChange, options }) {
    return (
      <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium">
          {label}
        </label>
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
          required
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.id} value={option.firstName}>
              {option.firstName} {option.lastName}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const CreateProjectForm = () => {
    const [projectData, setProjectData] = useState({
      title: "",
      overview: "",
      milestones: "",
      status: "active",
      projectManager: "",
      businessAnalyst: "",
      developers: [],
      teamLeads: [],
      clientName: "",
      clientId: "",
      clientEmail: "",
      startDate: "",
      endDate: "",
    });
    const [usersData, setUsersData] = useState([]);

    const handleInputChange = (event) => {
      const { name, value } = event.target;
      setProjectData({ ...projectData, [name]: value });
    };

    useEffect(() => {
      async function fetchUsersData() {
        try {
          const response = await fetch("http://192.168.88.188:8000/api/users");
          const data = await response.json();
          setUsersData(data);
        } catch (error) {
          console.error("Error fetching users:", error);
          // Handle error state here if needed
        }
      }

      fetchUsersData();
    }, []);

    const getOptionsForRole = (role) => {
      return usersData.filter((user) => user.role === role);
    };
    const handleCheckboxChange = (event) => {
      const { name, value, checked } = event.target;

      setProjectData((prevState) => {
        if (checked) {
          console.log(name);
          return {
            ...prevState,
            [name]: [...prevState[name], value],
          };
          
        } else {
          return {
            ...prevState,
            [name]: prevState[name].filter((item) => item !== value),
          };
        }
      });
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      // Dispatch an action to create a new project with projectData
      dispatch(createProject(projectData));
      setCreate(false);
    };

    return (
      <div className="bg-white rounded-lg shadow p-4">
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold mb-4">Create New Project</h2>

          {/* Title */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={projectData.title}
              onChange={handleInputChange}
              className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
              required
            />
          </div>

          {/* Overview */}
          <div className="mb-4">
            <label htmlFor="overview" className="block text-sm font-medium">
              Overview
            </label>
            <textarea
              id="overview"
              name="overview"
              value={projectData.overview}
              onChange={handleInputChange}
              className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
              required
            />
          </div>

          {/* Milestones */}
          <div className="mb-4">
            <label htmlFor="milestones" className="block text-sm font-medium">
              Milestones
            </label>
            <textarea
              id="milestones"
              name="milestones"
              value={projectData.milestones}
              onChange={handleInputChange}
              className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
              required
            />
          </div>

          {/* Status */}
          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium">
              Status
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() =>
                  handleInputChange({
                    target: { name: "status", value: "active" },
                  })
                }
                className={`px-4 py-2 rounded-md focus:outline-none ${
                  projectData.status === "active"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() =>
                  handleInputChange({
                    target: { name: "status", value: "inactive" },
                  })
                }
                className={`px-4 py-2 rounded-md focus:outline-none ${
                  projectData.status === "inactive"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* Project Manager Name */}
          <DropdownField
            label="Project Manager Name"
            name="projectManager"
            value={projectData.projectManager.id}
            onChange={handleInputChange}
            options={getOptionsForRole("Project Manager")}
          />

          {/* Business Analyst Name */}
          <DropdownField
            label="Business Analyst Name"
            name="businessAnalyst"
            value={projectData.businessAnalyst.id}
            onChange={handleInputChange}
            options={getOptionsForRole("Business Analyst")}
          />
          {/* Developers */}
          <div className="mb-4">
            <label htmlFor="developers" className="block text-sm font-medium">
              Developers
            </label>
            {getOptionsForRole("Developer").map((developer) => (
              <div key={developer.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`developer-${developer.id}`}
                  name="developers"
                  value={developer.id}
                  checked={projectData.developers.includes(developer.id)}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                <label
                  htmlFor={`developer-${developer.id}`}
                  className={`checkbox-label ${
                    projectData.developers.includes(developer.id)
                      ? "bg-blue-500 text-white"
                      : "bg-white"
                  }`}
                >
                  {developer.firstName} {developer.lastName}
                </label>
              </div>
            ))}
          </div>

          {/* Team Leads */}
          <div className="mb-4">
            <label htmlFor="teamLeads" className="block text-sm font-medium">
              Team Leads
            </label>
            {getOptionsForRole("Team Lead").map((teamLead) => (
              <div key={teamLead.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`teamLead-${teamLead.id}`}
                  name="teamLeads"
                  value={teamLead.id}
                  checked={projectData.teamLeads.includes(teamLead.id)}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                <label
                  htmlFor={`teamLead-${teamLead.id}`}
                  className={`checkbox-label ${
                    projectData.teamLeads.includes(teamLead.id)
                      ? "bg-blue-500 text-white"
                      : "bg-white"
                  }`}
                >
                  {teamLead.firstName} {teamLead.lastName}
                </label>
              </div>
            ))}
          </div>
          {/* Client Name */}
          <div className="mb-4">
            <label htmlFor="clientName" className="block text-sm font-medium">
              Client Name
            </label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={projectData.clientName}
              onChange={handleInputChange}
              className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
              required
            />
          </div>

          {/* Client ID */}
          <div className="mb-4">
            <label htmlFor="clientId" className="block text-sm font-medium">
              Client ID
            </label>
            <input
              type="text"
              id="clientId"
              name="clientId"
              value={projectData.clientId}
              onChange={handleInputChange}
              className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
              required
            />
          </div>

          {/* Client Email */}
          <div className="mb-4">
            <label htmlFor="clientEmail" className="block text-sm font-medium">
              Client Email
            </label>
            <input
              type="email"
              id="clientEmail"
              name="clientEmail"
              value={projectData.clientEmail}
              onChange={handleInputChange}
              className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
              required
            />
          </div>

          {/* Start Date */}
          <div className="mb-4">
            <label htmlFor="startDate" className="block text-sm font-medium">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={projectData.startDate}
              onChange={handleInputChange}
              className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
              required
            />
          </div>

          {/* End Date */}
          <div className="mb-4">
            <label htmlFor="endDate" className="block text-sm font-medium">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={projectData.endDate}
              onChange={handleInputChange}
              className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setCreate(false)}
              className="bg-gray-200 text-gray-700 font-semibold px-3 py-2 rounded-md mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white font-semibold px-3 py-2 rounded-md"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Projects</h1>
        {canCreateEditDelete && (
          <button
            onClick={handleCreateProject}
            className="bg-green-500 text-white font-semibold px-4 py-2 rounded-md"
          >
            Create Project
          </button>
        )}
      </div>
      {create ? (
        <CreateProjectForm />
      ) : (
        <div>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
