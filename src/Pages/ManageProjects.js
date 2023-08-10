import React, { useState } from "react";
import { useSelector } from "react-redux/es/hooks/useSelector";
import { Menubar } from "primereact/menubar";
import { InputText } from "primereact/inputtext";
import CreateProject from "./projects/CreateProject";
import EditProject from "./projects/EditProject";
import ProjectDetails from "./projects/ProjectDetails";
import ListProjects from "./projects/ListProjects";
import ArchivedProjects from "./projects/ArchivedProjects";
import { BsArchive } from "react-icons/bs";

const ManageProjects = () => {
  const [activeComponent, setActiveComponent] = useState("list");
  const [editProjectId, setEditProjectId] = useState(null);
  const [projectDetailsId, setProjectDetailsId] = useState(null);

  const userActivities = useSelector((state) => state.user.userActivities);
  const projectsActivity = userActivities.find(
    (activity) => activity.name === "Projects"
  );
  const hasReadPermission = projectsActivity.pivot.permissions.includes("read");
  const hasWritePermission =
    projectsActivity.pivot.permissions.includes("write");

  const handleEditProject = (projectId) => {
    setActiveComponent("EditProject");
    setEditProjectId(projectId);
  };

  const handleProjectDetails = (projectId) => {
    setActiveComponent("ProjectDetails");
    setProjectDetailsId(projectId);
  };

  const routeToListProjects = () => {
    setActiveComponent("list");
  };

  const menuItems = [
    {
      label: "List Projects",
      icon: "pi pi-fw pi-list",
      command: () => setActiveComponent("list"),
    },
    {
      label: "Create Project",
      icon: "pi pi-fw pi-plus",
      command: () => setActiveComponent("CreateProject"),
      disabled: !hasReadPermission || !hasWritePermission,
    },
    {
      label: " Archived Projects",
      icon: <BsArchive />, // Use the BsArchive icon
      command: () => setActiveComponent("ArchivedProjects"),
      disabled: !hasReadPermission || !hasWritePermission,
    },
  ];

  let activeContent = null;
  if (activeComponent === "list") {
    activeContent = (
      <ListProjects
        onEditProject={handleEditProject}
        onViewProjectDetails={handleProjectDetails}
      />
    );
  } else if (activeComponent === "CreateProject") {
    activeContent = <CreateProject routeToListProjects={routeToListProjects} />;
  } else if (activeComponent === "EditProject") {
    activeContent = (
      <EditProject
        projectId={editProjectId}
        routeToListProjects={routeToListProjects}
      />
    );
  } else if (activeComponent === "ProjectDetails") {
    activeContent = (
      <ProjectDetails
        projectId={projectDetailsId}
        routeToListProjects={routeToListProjects}
      />
    );
  } else if (activeComponent === "ArchivedProjects") {
    activeContent = <ArchivedProjects />;
  }

  const end = <InputText placeholder="Search" type="text" className="w-full" />;

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-4 text-center text-blue-800">
        Manage Projects
      </h1>
      <Menubar model={menuItems} end={end} />
      <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 220px)" }}>
        {activeContent}
      </div>
    </div>
  );
};

export default ManageProjects;
