import React, { useState } from "react";
import { Menubar } from "primereact/menubar";
import CreateSprint from "./sprints/CreateSprint";
import ActiveSprint from "./sprints/ActiveSprint";
import InActiveSprint from "./sprints/InActiveSprint";
import CompletedSprints from "./sprints/CompletedSprint";
import {
  CalendarIcon,
  PlusCircleIcon,
  PlayIcon,
  CheckCircleIcon,
} from "@heroicons/react/outline";

const ManageSprints = () => {
  const [activeComponent, setActiveComponent] = useState("ActiveSprint");


  const menuItems = [
    {
      label: "Create Sprint",
      icon: <PlusCircleIcon className="h-5 w-4 mr-2" />,
      command: () => setActiveComponent("CreateSprint"),
    },
    {
      label: "Active Sprint",
      icon: <PlayIcon className="h-5 w-4 mr-2" />,
      command: () => setActiveComponent("ActiveSprint"),
    },
    {
      label: "Inactive Sprint",
      icon: <CalendarIcon className="h-5 w-4 mr-2" />,
      command: () => setActiveComponent("InActiveSprint"),
    },
    {
      label: "Completed Sprints",
      icon: <CheckCircleIcon className="h-5 w-4 mr-2" />,
      command: () => setActiveComponent("CompletedSprints"),
    },
  ];

  const renderComponent = () => {
    switch (activeComponent) {
      case "CreateSprint":
        return <CreateSprint rerouting={routeToListing} />;
      case "ActiveSprint":
        return <ActiveSprint rerouting={routeToListing} routeToCompletedSprints={routeToCompletedSprints} />;
      case "InActiveSprint":
        return <InActiveSprint rerouting={routeToListing} routeToInactiveSprints={routeToInactiveSprints} />;
      case "CompletedSprints":
        return <CompletedSprints rerouting={routeToListing}  />;
      default:
        return <CreateSprint rerouting={routeToListing} />;
    }
  };

  const routeToListing = () => {
    setActiveComponent("ActiveSprint");
  };


  const routeToCompletedSprints = () => {
    setActiveComponent("CompletedSprints");
  };


  const routeToInactiveSprints = () => {
    setActiveComponent("InActiveSprint");
  };

  return (
    <div className="w-full">
      <h1 className="text-xl font-bold mb-4 text-center text-blue-500">
        Manage Sprints
      </h1>
      <Menubar model={menuItems} className="p-mb-2" />
      <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 220px)" }}>
        {renderComponent()}
      </div>
    </div>
  );
};

export default ManageSprints;
