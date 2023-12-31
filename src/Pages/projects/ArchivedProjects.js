import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Toast } from "primereact/toast";
import * as AiIcons from "react-icons/ai";
import {  confirmDialog } from "primereact/confirmdialog";
import _ from "lodash";
import { Paginator } from "primereact/paginator";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../apiConfig";


const Archive = ({ onRestoreProject,viewMode }) => {
  const [projects, setProjects] = useState([]);
  const toast = useRef(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();


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
    if (error && toast.current) {
      toast.current?.show({
        severity: "error",
        summary: "Error occurred",
        detail: handleErrorMessage(error),
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
      reject: () => {
        // You can perform any logic if needed when the user clicks "No" or simply do nothing
      },
    });
  };

  const confirmRestore = (id) => {
    confirmDialog({
      message: "Do you want to restore this record?",
      header: "Restore Confirmation",
      icon: "pi pi-info-circle",
      accept: () => handleRestoreProject(id),
      reject: () => {
        // You can perform any logic if needed when the user clicks "No" or simply do nothing
      },
    });
  };

  useEffect(() => {
    fetchName();
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [page]);


  const fetchName = async () => {
    try {
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly
  
      const response = await fetch(
        `${API_BASE_URL}/appName`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 401) {
        navigate('/');
      }
  
      // Rest of your code...
    } catch (error) {
      // Error handling code...
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

  const fetchProjects =() => {
    setIsLoading(true);
    const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios
      .get(`${API_BASE_URL}/allProjectsArchived?page=${page + 1}`,config)
      .then((response) => {

        if (response.status === 401) {
          navigate('/');
        }
      
      setProjects(response.data.data.data);
      setTotalRecords(response.data.data.total);
      setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);

        
        onError(error);
      });
  };

  const handleSearch = () => {
    if (searchTerm && searchTerm.trim() !== '') {
      setIsLoading(true);
      // Modify the endpoint to accommodate the searchTerm in the query string 
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    setPage(0); 

      axios
        .get(`${API_BASE_URL}/allProjectsArchived?page=${page + 1}&searchTerm=${searchTerm}`,config)
        .then((response) => {

          if (response.status === 401) {
            navigate('/');
          }

          setProjects(response.data.data.data);
          setTotalRecords(response.data.data.total);
          setIsLoading(false);
        })
        .catch((error) => {
          setIsLoading(false);
         
          onError(error);
        
        });
    } else {
      // If there is no search term, just fetch porjects normally
      fetchProjects();
    }
  };


  const handleRestoreProject = async (id) => {
    fetchName();
    setIsRestoring(true);
    try {
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
      const response = await axios.post(
        `${API_BASE_URL}/restore/${id}`, {},  
        config
      );

      if (response.status === 401) {
        navigate('/');
      }

      if (response.status === 200) {
        onSuccess("Restored");
        setIsRestoring(false);
         fetchProjects();
      } 
    } catch (error) {
      setIsRestoring(false);

      
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        onError(error);
      } else {
        onError("Failed to restore project");
      }
    }
  };

  const handleDeleteProject = async (id) => {
    fetchName();
    setIsDeleting(true);
    try {
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
      const response = await axios.delete(
        `${API_BASE_URL}/deletePermanently/${id}`,config
      );

      if (response.status === 401) {
        navigate('/');
      }
      // If deletion was successful
      if (response.status === 200) {
        onSuccess("Project deleted successfully");
        setIsDeleting(false);
       fetchProjects();
      }
    } catch (error) {
      setIsDeleting(false);

      

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        onError(error.response.data.message);
      } else {
        onError("Failed to delete project");
      }
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

export default Archive;
