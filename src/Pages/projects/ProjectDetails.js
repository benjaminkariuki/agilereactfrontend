import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { FaPlus } from "react-icons/fa";
import MicroTask from "./MicroTask2.jsx";
import { useSelector } from "react-redux";
import _ from "lodash";
import { useNavigate } from "react-router-dom";


const ProjectDetails = ({ projectId, routeToListProjects, routetoEdit }) => {
  const [projectData, setProjectData] = useState([]);
  const [showMicroTasksModal, setShowMicroTasksModal] = useState(false);
  const [selectedActivty, setSelectedActivitiy] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [selectedIcon, setSelectedIcon] = useState("");
  const toast = useRef(null);
  const { userActivities } = useSelector((state) => state.user);
  const baseUrl = "https://agile-pm.agilebiz.co.ke/storage/";
  const navigate = useNavigate();


  //getting the permission for projects
  const projectsActivity = userActivities.find(
    (activity) => activity.name === "Projects"
  );
  const hasReadPermissionProject =
    projectsActivity.pivot.permissions.includes("read");

  const hasWritePermissionProject =
    projectsActivity.pivot.permissions.includes("write");

  //getting permission for tasks

  
 

  //getting permission for sprints
  const sprintsActivity = userActivities.find(
    (activity) => activity.name === "Sprints"
  );
  const hasReadPermissionSprints =
    sprintsActivity.pivot.permissions.includes("read");
  const hasWritePermissionSprint =
    sprintsActivity.pivot.permissions.includes("write");

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails(projectId);
    }
  }, [projectId]);



  // Function to show a warning toast when fetching activities fails
  const onError = (error) => {
    if(toast.current && error){
    toast.current?.show({
      severity: "warn",
      summary: "Error encountered",
      detail: `${error}`,
      life: 3000,
    });
  }
  };

  //handles the modal functionalities
  const handleMicroTasksModal = (projectId, activityId, phaseId, option) => {
    setShowMicroTasksModal(!showMicroTasksModal);
    setSelectedActivitiy(activityId);
    setSelectedPhase(phaseId);
    setSelectedIcon(option);
  };

  const fetchProjectDetails = (projectId) => {
    const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
    axios
      .get(`https://agile-pm.agilebiz.co.ke/api/allProjectsWithId/${projectId}`, config)
      .then((response) => {

        if (response.status === 401) {
          navigate('/');
        }

        const fetchedprojectsid = response.data.data;

        setProjectData(fetchedprojectsid);
       
      })
      .catch((error) => {
        setProjectData([]);

        onError("Error getting project details:");
      });
  };

  const handleCancel = () => {
    routeToListProjects();
    setSelectedActivitiy(null);
    setSelectedPhase(null);
  };

  if (projectData === null) {
    return (
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <Toast ref={toast} />
        <div>
          <h1>Click a project First </h1>
        </div>
        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-md focus:outline-none focus:shadow-outline mt-4"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }
  const handleEdit = () => {
    routetoEdit(projectId);
  };

  
  return (
    <div>
      <Toast ref={toast} />
      <div className="bg-white rounded-lg shadow p-4 ">
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-4 text-center">
           
            {_.startCase(projectData.title)}
          </h1>
          <p className="text-gray-600">Overview: {_.startCase(projectData.overview)}</p>
          <p className="text-gray-600">Status: {_.startCase(projectData.status)}</p>
          <p className="text-gray-600">Client Name: {_.startCase(projectData.clientname)}</p>
          <p className="text-gray-600">
            Client Contact: {projectData.clientcontact}
          </p>
          <p className="text-gray-600">
            Client Email: {projectData.clientemail}
          </p>
          <p className="text-gray-600">Start Date: {projectData.start_date}</p>
          <p className="text-gray-600">End Date: {projectData.end_date}</p>

          <p className="text-gray-600">Category: {_.startCase(projectData.category)}</p>
          <p className="text-gray-600">Type of System: {_.startCase(projectData.system_type)}</p>

        </div>
        <div className="mb-8 ">
          <h2 className="text-2xl font-bold mb-4 text-center">Phases</h2>

          <div className="grid gap-4">
            {projectData.phases &&
              projectData.phases.map((phase, index) => (
                <div key={index} className="min-w-1000 overflow-x-auto">
                  <h3 className="text-xl font-bold mb-2">
                    <strong>Phase: </strong>
                    {_.startCase(phase.name)}
                  </h3>
                  <h4 className="text-lg font-bold mt-4 mb-2">Activities</h4>
                  <DataTable
                    key={phase.id}
                    value={phase.phases_activity}
                    className="border rounded-md p-4"
                    removableSort
                  >
                    <Column
                      body={(rowData) => <h1 key={rowData.id}>{rowData.id}</h1>}
                    />
                    <Column
                      field="name"
                      header="Activity Name"
                      sortable
                    ></Column>
                    <Column
                      header="Micro Tasks"
                      body={(rowData) => (
                        <div className="flex" key={rowData.id}>
                          {/* Placeholder Excel icon */}

                  <FaPlus
                            className="bg-blue-500 text-white rounded"
                            onClick={() =>
                              handleMicroTasksModal(
                                projectId,
                                rowData.id,
                                phase.id,
                                "view"
                              )
                            }
                            size={18}
                            style={{ marginRight: 4 }}
                          />
                        
                           {hasWritePermissionProject && ( <PiMicrosoftExcelLogoFill
                              className="bg-blue-500 text-white rounded"
                              size={18}
                              onClick={() =>
                                handleMicroTasksModal(
                                  projectId,
                                  rowData.id,
                                  phase.id,
                                  "add"
                                )
                              }
                            />)}
                          
                        </div>
                      )}
                    />
                    <Column
                      field="start_date"
                      header="Start Date"
                      sortable
                    ></Column>
                    <Column
                      field="end_date"
                      header="End Date"
                      sortable
                    ></Column>
                    <Column
                      field="duration"
                      header="Duration"
                      sortable
                    ></Column>
                    <Column
                      field="responsibleCompany"
                      header="Responsible Company"
                      sortable
                    ></Column>
                    <Column
                      field="responsibleClient"
                      header="Responsible Client"
                      sortable
                    ></Column>
                  </DataTable>
                </div>
              ))}
          </div>
       
          {showMicroTasksModal && (
            <MicroTask
              projectId={projectId}
              activityId={selectedActivty}
              phaseId={selectedPhase}
              selectedIcon={selectedIcon}
              organization={projectData.organization}
            
            />
          )}
        </div>
        <div className="grid gap-4 mb-4">
          <h2 className="text-2xl font-bold mb-4 text-center">Project Crew</h2>

          <div className="min-w-1000 overflow-x-auto">
            <DataTable value={projectData.organization}>
              <Column
                field="user.firstName"
                header="First Name"
                
              />
              <Column
                field="user.lastName"
                header="Last Name"
              
              />
              <Column field="user.email" header="Email" />
              <Column
                field="user.role.name"
                header="Role"
              />

              <Column
                field="user.department"
                header="Department"
              />
              <Column
                header="Profile Pic"
                body={(org) => (
                  <img
                    src={
                      org.user && org.user.profile_pic
                        ? baseUrl + org.user.profile_pic
                        : process.env.PUBLIC_URL + "/profile2.jpeg"
                    }
                    alt="User"
                    className="w-12 h-12 rounded-md ml-2"
                  />
                )}
              />
              <Column
                header="Status"
                body={(org) => (
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        org.status === "active" ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <p className="text-gray-600 ml-1">
                      {org.status === "active" ? "Active" : "Inactive"}
                    </p>
                  </div>
                )}
              />
            </DataTable>
          </div>
        </div>
        <div className="flex justify-between">
          {hasWritePermissionProject && (
            <button
              className="px-4 py-2 bg-yellow-500 text-white rounded-md focus:outline-none focus:shadow-outline mt-4"
              onClick={handleEdit}
            >
              Edit
            </button>
          )}

          <button
            className="px-4 py-2 bg-red-500 text-white rounded-md focus:outline-none focus:shadow-outline mt-4"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
