import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Toast } from "primereact/toast";
import _ from "lodash";

import * as AiIcons from "react-icons/ai";
import { Paginator } from "primereact/paginator";

const ListProjects = ({ onEditProject, onViewProjectDetails, viewMode }) => {
  const [projects, setProjects] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const toast = useRef(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

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

  useEffect(() => {
    fetchProjects();
  }, [page]);

  const onSuccessUpdate = (success) => {
    if (success) {
      toast.current?.show({
        severity: "success",
        summary: "Successfully",
        detail: `Name: ${success}`,
        life: 3000,
      });
    }
  };

  const onError = (error) => {
    if (error) {
      toast.current?.show({
        severity: "danger",
        summary: "Error Encountered",
        detail: handleErrorMessage(error),
        life: 3000,
      });
    }
  };

  const handleErrorMessage = (error) => {
    if (
      error &&
      error.response &&
      error.response.data &&
      error.response.data.errors
    ) {
      // Extract error messages and join them into a single string
      return Object.values(error.response.data.errors).flat().join(" ");
    } else if (error && error.message) {
      // Client-side error (e.g., no internet)
      return error.message;
    }
    // If no errors property is found, return the main message or a default error message
    return error &&
      error.response &&
      error.response.data &&
      error.response.data.message
      ? error.response.data.message
      : "An unexpected error occurred.";
  };

  const fetchProjects = () => {
    setIsLoading(true);
    const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
    axios
      .get(`https://agile-pm.agilebiz.co.ke/api/allProjects?page=${page + 1}`,config)
      .then((response) => {
        setProjects(response.data.data.data);
        setTotalRecords(response.data.data.total);
        setIsLoading(false);
      })
      .catch((error) => {
        onError(error);
        console.error("Error getting projects:", error);
        setIsLoading(false);
      });
  };

  const handleSearch = () => {
    if (searchTerm && searchTerm.trim() !== "") {
      setIsLoading(true);
      // Modify the endpoint to accommodate the searchTerm in the query string
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
      axios
        .get(
          `https://agile-pm.agilebiz.co.ke/api/allProjects?page=${
            page + 1
          }&searchTerm=${searchTerm}`,
          config
        )
        .then((response) => {
          setProjects(response.data.data.data);
          setTotalRecords(response.data.data.total);
          setIsLoading(false);
        })
        .catch((error) => {
          onError(error);
          console.error("Error getting projects:", error);
          setIsLoading(false);
        });
    } else {
      // If there is no search term, just fetch porjects normally
      fetchProjects();
    }
  };

  const handleArchiveProject = async (id) => {
    try {
      setIsSubmitting(true);
      // Update the "isArchiving" state of the selected project to true
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
      const response = await axios.post(
        `https://agile-pm.agilebiz.co.ke/api/archive/${id}`,
        {},
        config
      );
      // If archive was successful
      if (response.status === 200) {
        // Archive successful
        fetchProjects();
      } else {
        // Handle other status codes if needed
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

  return (
    <>
      <Toast ref={toast} />

      <div className="mb-4 flex justify-end mt-0.5">
        <input
          type="text"
          placeholder="Search projects"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            handleSearch();
          }}
          className="border rounded px-2 py-1 w-1/3 mr-2"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-24">
          <i className="pi pi-spin pi-spinner text-blue-500 text-4xl"></i>
        </div>
      ) : projects.length === 0 ? (
        <div>No projects found</div>
      ) : (
        <div>
          {errorMessage && <p>{errorMessage}</p>}

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
      )}

      <div className="mb-6">
        {projects.length > 0 ? (
          <Paginator
            first={page * 5}
            rows={5}
            totalRecords={totalRecords}
            onPageChange={(e) => {
              setPage(e.page);
            }}
            template={{ layout: "PrevPageLink CurrentPageReport NextPageLink" }}
          />
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default ListProjects;
