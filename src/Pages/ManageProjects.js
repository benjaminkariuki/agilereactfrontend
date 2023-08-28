import React, { useState } from "react";
import { useSelector } from "react-redux/es/hooks/useSelector";
import { Menubar } from "primereact/menubar";
import CreateProject from "./projects/CreateProject";
import EditProject from "./projects/EditProject";
import ProjectDetails from "./projects/ProjectDetails";
import ListProjects from "./projects/ListProjects";
import ArchivedProjects from "./projects/ArchivedProjects";
import { TableIcon } from "@heroicons/react/solid";
import { ArchiveIcon } from "@heroicons/react/outline";

const ManageProjects = () => {
  const [activeComponent, setActiveComponent] = useState("list");
  const [editProjectId, setEditProjectId] = useState(null);
  const [projectDetailsId, setProjectDetailsId] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
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
  const routetoEdit = (id) => {
    handleEditProject(id);
  };
  const routeToviewMore = (id) => {
    handleProjectDetails(id);
  };

  const menuItems = [
    {
      label: "List Projects",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776"
          />
        </svg>
      ),
      command: () => setActiveComponent("list"),
    },
    {
      label: "Create Project",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      ),
      command: () => setActiveComponent("CreateProject"),
      disabled: !hasReadPermission || !hasWritePermission,
    },
    {
      label: "Archived Projects",
      icon: <ArchiveIcon className="w-6 h-6" />,
      command: () => setActiveComponent("ArchivedProjects"),
      disabled: !hasReadPermission || !hasWritePermission,
    },
    {
      label: "View mode",
      icon:
        viewMode === "grid" ? (
          <TableIcon className="w-6 h-6" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
              className="w-6 h-6"
            />
          </svg>
        ),
      command: () => toggleViewMode(),
      disabled:
        activeComponent !== "list" && activeComponent !== "ArchivedProjects",
    },
  ];
  let activeContent = null;
  if (activeComponent === "list") {
    activeContent = (
      <ListProjects
        onEditProject={(projectId) => handleEditProject(projectId)}
        onViewProjectDetails={(projectId) => handleProjectDetails(projectId)}
        viewMode={viewMode}
      />
    );
  } else if (activeComponent === "CreateProject") {
    activeContent = <CreateProject routeToListProjects={routeToListProjects} />;
  } else if (activeComponent === "EditProject") {
    activeContent = (
      <EditProject
        projectId={editProjectId}
        routeToListProjects={routeToListProjects}
        routeToviewMore={() => routeToviewMore(editProjectId)}
      />
    );
  } else if (activeComponent === "ProjectDetails") {
    activeContent = (
      <ProjectDetails
        projectId={projectDetailsId}
        routeToListProjects={routeToListProjects}
        routetoEdit={() => routetoEdit(projectDetailsId)}
      />
    );
  } else if (activeComponent === "ArchivedProjects") {
    activeContent = <ArchivedProjects />;
  }

  // const end = <InputText placeholder="Search" type="text" className="w-full" />;end={}

  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === "grid" ? "list" : "grid"));
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-4 text-center text-blue-800">
        Manage Projects
      </h1>
      <Menubar model={menuItems} />
      <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 220px)" }}>
        {activeContent}
      </div>
    </div>
  );
};

export default ManageProjects;
