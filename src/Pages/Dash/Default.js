import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { useSelector } from "react-redux/es/hooks/useSelector";
import axios from "axios";
import { Toast } from "primereact/toast";
import { Chart } from "primereact/chart";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../apiConfig";
import ProjectDetailView from "./Dialogs/ClientComponents/ProjectDetailView";

const Default = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const toast = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useSelector((state) => state.user);

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      fetchProjectsForClient();
    }
  }, [userId]);

  // Function to handle card click
  const handleCardClick = (project) => {
    setSelectedProject(project);
  };

  const handleBackButtonClick = () => {
    setSelectedProject(null);
  };

  const handleErrorMessage = (error) => {
    if (
      error &&
      error.response &&
      error.response.data &&
      error.response.data.message
    ) {
      // Handle error messages directly under data property
      return error.response.data.message;
    } else if (
      error &&
      error.response &&
      error.response.data &&
      error.response.data.errors
    ) {
      // Extract error messages and join them into a single string
      return Object.values(error.response.data.errors).flat().join(" ");
    } else if (
      error &&
      error.response &&
      error.response.data &&
      error.response.data.error
    ) {
      // Handle error structures like {error: "No active sprint found"}
      return error.response.data.error;
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

  const onFetchingRoles = (error) => {
    if (toast.current && error) {
      toast.current.show({
        severity: "warn",
        summary: "Error",
        detail: handleErrorMessage(error),
        life: 3000,
      });
    }
  };

  const fetchProjectsForClient = async () => {
    try {
      const token = sessionStorage.getItem("token");
      console.log("Fetching projects for user ID:", userId);

      const response = await fetch(
        `${API_BASE_URL}/specificProjectsClient?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        navigate("/");
      }

      const data = await response.json();
      setProjects(data.data);
    } catch (error) {
      onFetchingRoles(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedProject) {
    return (
      <ProjectDetailView
        project={selectedProject}
        onBack={handleBackButtonClick}
      />
    );
  }

  return !isLoading ? (
    <div className="p-5 h-full mb-12 overflow-auto">
      <Toast ref={toast} />
      <h1 className="text-xl font-bold mb-4 text-center">My Projects</h1>
      <div className="flex flex-col gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="border rounded-lg overflow-hidden shadow-lg hover:border-blue-500 mb-6"
            onClick={() => handleCardClick(project)}
          >
            <div className="p-4">
              <div className="flex items-center">
                <span
                  className={`h-3 w-3 rounded-full ${
                    project.status === "active" ? "bg-green-500" : "bg-red-500"
                  }`}
                  aria-hidden="true"
                ></span>
                <h2 className="text-lg font-semibold ml-2">{project.title}</h2>
              </div>
              <p className="text-gray-600 mt-2">{project.overview}</p>
              {/* ... other details */}
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-center h-24">
      <i className="pi pi-spin pi-spinner text-blue-500 md:text-4xl text-3xl"></i>
    </div>
  );
};

export default Default;
