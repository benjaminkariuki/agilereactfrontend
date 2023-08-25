import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { FaPlus } from "react-icons/fa";
import MicroTask from "./MicroTask2.jsx";
import { useSelector } from "react-redux";

const ProjectDetails = ({ projectId, routeToListProjects }) => {
  const [projectData, setProjectData] = useState([]);
  const [showMicroTasksModal, setShowMicroTasksModal] = useState(false);
  const [selectedActivty, setSelectedActivitiy] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [selectedIcon, setSelectedIcon] = useState("");
  const toast = useRef(null);
  const { userActivities } = useSelector((state) => state.user);
  const baseUrl = "https://agile-pm.agilebiz.co.ke/storage/";

  //getting the permission for projects
  const projectsActivity = userActivities.find(
    (activity) => activity.name === "Projects"
  );
  const hasReadPermissionProject =
    projectsActivity.pivot.permissions.includes("read");
  const hasWritePermissionProject =
    projectsActivity.pivot.permissions.includes("write");

  //getting permission for tasks
  const tasksActivity = userActivities.find(
    (activity) => activity.name === "Tasks"
  );
  const hasReadPermissionTasks =
    tasksActivity.pivot.permissions.includes("read");
  const hasWritePermissionTasks =
    tasksActivity.pivot.permissions.includes("write");

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

  // Function to show a success toast when roles are updated successfully
  const onSuccess = (success) => {
    toast.current?.show({
      severity: "success",
      summary: "Successfully",
      detail: `${success}`,
      life: 3000,
    });
  };

  // Function to show a warning toast when fetching activities fails
  const onError = (error) => {
    toast.current?.show({
      severity: "warn",
      summary: "Error encountered",
      detail: `${error}`,
      life: 3000,
    });
  };

  //handles the modal functionalities
  const handleMicroTasksModal = (projectId, activityId, phaseId, option) => {
    setShowMicroTasksModal(!showMicroTasksModal);
    setSelectedActivitiy(activityId);
    setSelectedPhase(phaseId);
    setSelectedIcon(option);
  };

  const fetchProjectDetails = (projectId) => {
    axios
      .get(`https://agile-pm.agilebiz.co.ke/api/allProjectsWithId/${projectId}`)
      .then((response) => {
        const fetchedprojectsid = response.data.data;
        setProjectData(fetchedprojectsid);
        onSuccess("Project Found");
      })
      .catch((error) => {
        if (error.response && error.response.status === 429) {
          setTimeout(() => {
            fetchProjectDetails(projectId);
          }, 2000);
        }
        onError("Error getting project details:");
        setProjectData([]);
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

  return (
    <div>
      <Toast ref={toast} />
      <div className="bg-white rounded-lg shadow p-4 ">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4 text-center">
            {projectData.title} Details
          </h1>
          <p className="text-gray-600">Overview: {projectData.overview}</p>
          <p className="text-gray-600">Status: {projectData.status}</p>
          <p className="text-gray-600">Client Name: {projectData.clientname}</p>
          <p className="text-gray-600">
            Client Contact: {projectData.clientcontact}
          </p>
          <p className="text-gray-600">
            Client Email: {projectData.clientemail}
          </p>
          <p className="text-gray-600">Start Date: {projectData.start_date}</p>
          <p className="text-gray-600">End Date: {projectData.end_date}</p>
        </div>
        <div className="mb-8 ">
          <h2 className="text-2xl font-bold mb-4 text-center">Phases</h2>

          <div className="grid gap-4">
            {projectData.phases &&
              projectData.phases.map((phase, index) => (
                <div key={index} className="min-w-1000 overflow-x-auto">
                  <h3 className="text-xl font-bold mb-2">{phase.name}</h3>
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
                          <PiMicrosoftExcelLogoFill
                            className="bg-blue-500 text-white rounded"
                            onClick={() =>
                              handleMicroTasksModal(
                                projectId,
                                rowData.id,
                                phase.id,
                                "view"
                              )
                            }
                            size={30}
                            style={{ marginRight: 4 }}
                          />
                          {hasWritePermissionTasks && (
                            <FaPlus
                              className="bg-blue-500 text-white rounded"
                              size={30}
                              onClick={() =>
                                handleMicroTasksModal(
                                  projectId,
                                  rowData.id,
                                  phase.id,
                                  "add"
                                )
                              }
                            />
                          )}
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
          {/* Modal
            @projectId= takes the project ID
            @activityId=takes the activity Id from the selected phase and activity
            @phaseId=takes the phase Id from the selected phase
            
            @selectedIcon= pass the value of the icon clickec(either edit or upload)
            @projectData.projectmanager =pass the projects projectmanagers to the modal where they are assigned micro tasks
            @projectData.businessanalyst =pass the projects BAs to the modal where they are assigned micro tasks
            @projectData.teamleads=pass the projects TeamLeads to the modal where they are assigned micro tasks
            @projectData.developers=pass the projects Developers to the modal where they are assigned micro tasks
         */}
          {showMicroTasksModal && (
            <MicroTask
              projectId={projectId}
              activityId={selectedActivty}
              phaseId={selectedPhase}
              selectedIcon={selectedIcon}
              projectManagers={projectData.projectmanager}
              businessAnalysts={projectData.businessanalyst}
              teamLeads={projectData.teamleads}
              developers={projectData.developers}
            />
          )}
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Project Crew</h2>

          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Project Managers */}
            <div>
              <h3 className="text-xl font-bold mb-2">Project Managers</h3>
              {projectData.projectmanager &&
                projectData.projectmanager.map((manager, index) => (
                  <div key={index} className="border rounded-md p-2 break-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div>
                          <p className="text-gray-600">
                            Name: {manager.user.firstName}{" "}
                            {manager.user.lastName}
                          </p>
                          <p className="text-gray-600">
                            Email: {manager.user.email}
                          </p>
                          <p className="text-gray-600">
                            Contacts: {manager.user.contacts}
                          </p>
                        </div>
                        {manager.user.profile_pic && (
                          <img
                            src={
                              manager.profile_pic
                                ? baseUrl + manager.profile_pic
                                : process.env.PUBLIC_URL + "/profile2.jpeg"
                            }
                            alt="User"
                            className="w-10 h-10 rounded-full ml-2"
                          />
                        )}
                      </div>
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            manager.status === "active"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <p className="text-gray-600 ml-1">
                          {manager.status === "active" ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Team Leads */}
            <div>
              <h3 className="text-xl font-bold mb-2">Team Leads</h3>
              {projectData.teamleads &&
                projectData.teamleads.map((teamLead, index) => (
                  <div key={index} className="border rounded-md p-2 break-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div>
                          <p className="text-gray-600">
                            Name: {teamLead.user.firstName}{" "}
                            {teamLead.user.lastName}
                          </p>
                          <p className="text-gray-600">
                            Email: {teamLead.user.email}
                          </p>
                          <p className="text-gray-600">
                            Contacts: {teamLead.user.contacts}
                          </p>
                          <p className="text-gray-600">
                            Team Lead: {teamLead.user.role.name}
                          </p>
                        </div>
                        {teamLead.user.profile_pic && (
                          <img
                            src={
                              teamLead.profile_pic
                                ? baseUrl + teamLead.profile_pic
                                : process.env.PUBLIC_URL + "/profile2.jpeg"
                            }
                            alt="User"
                            className="w-10 h-10 rounded-full ml-2"
                          />
                        )}
                      </div>
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            teamLead.status === "active"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <p className="text-gray-600 ml-1">
                          {teamLead.status === "active" ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Business Analysts */}
            <div>
              <h3 className="text-xl font-bold mb-2">Business Analysts</h3>
              {projectData.businessanalyst &&
                projectData.businessanalyst.map((analyst, index) => (
                  <div key={index} className="border rounded-md p-2 break-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div>
                          <p className="text-gray-600">
                            Name: {analyst.user.firstName}{" "}
                            {analyst.user.lastName}
                          </p>
                          <p className="text-gray-600">
                            Email: {analyst.user.email}
                          </p>
                          <p className="text-gray-600">
                            Contacts: {analyst.user.contacts}
                          </p>
                        </div>
                        {analyst.user.profile_pic && (
                          <img
                            src={
                              analyst.profile_pic
                                ? baseUrl + analyst.profile_pic
                                : process.env.PUBLIC_URL + "/profile2.jpeg"
                            }
                            alt="User"
                            className="w-10 h-10 rounded-full ml-2"
                          />
                        )}
                      </div>
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            analyst.status === "active"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <p className="text-gray-600 ml-1">
                          {analyst.status === "active" ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Developers */}
            <div>
              <h3 className="text-xl font-bold mb-2">Developers</h3>
              {projectData.developers &&
                projectData.developers.map((developer, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-start md:items-center">
                      <div className="w-2/3">
                        <p className="text-gray-600 break-words">
                          Name: {developer.user.firstName}{" "}
                          {developer.user.lastName}
                        </p>
                        <p className="text-gray-600 break-words">
                          Email: {developer.user.email}
                        </p>
                        <p className="text-gray-600 break-words">
                          Contacts: {developer.user.contacts}
                        </p>
                      </div>
                      <div className="w-1/3 flex flex-col items-end justify-between ml-4">
                        <div className="flex flex-col mt-4">
                          <div className="w-20 h-20 rounded-full overflow-hidden">
                            {developer.user.profile_pic && (
                              <img
                                src={
                                  developer.user.profile_pic
                                    ? baseUrl + developer.user.profile_pic
                                    : process.env.PUBLIC_URL + "/profile2.jpeg"
                                }
                                alt="User"
                                className="w-full h-full rounded-full object-cover"
                              />
                            )}
                          </div>
                          <div
                            className={`w-3 h-3 rounded-full ${
                              developer.status === "active"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          <p className="text-gray-600 ml-1">
                            {developer.status === "active"
                              ? "Active"
                              : "Inactive"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
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
    </div>
  );
};

export default ProjectDetails;
