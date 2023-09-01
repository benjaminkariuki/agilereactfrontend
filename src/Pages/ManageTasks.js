import React, { useState } from "react";
import { Menubar } from "primereact/menubar";
import ClosedTasks from "./tasks/ClosedTasks";
import DevelopmentTasks from "./tasks/DevelopmentTasks";
import TestingTasks from "./tasks/TestingTasks";
import ReviewTasks from "./tasks/ReviewTasks";
import MyTasks from "./tasks/MyTasks";
import { FaCheck, FaCode, FaBug, FaSearch, FaUser } from "react-icons/fa";

const ManageTasks = () => {
  const [activeComponent, setActiveComponent] = useState("MyTasks");

  const menuItems = [
    {
      label: "My Tasks",
      icon: <FaUser className="h-5 w-4 mr-2" />,
      command: () => setActiveComponent("MyTasks"),
    },

    {
      label: "Development Tasks",
      icon: <FaCode className="h-5 w-4 mr-2"/>,
      command: () => setActiveComponent("DevelopmentTasks"),
    },
    {
      label: "Testing Tasks",
      icon: <FaBug className="h-5 w-4 mr-2"/>,
      command: () => setActiveComponent("TestingTasks"),
    },
    {
      label: "Review Tasks",
      icon: <FaSearch className="h-5 w-4 mr-2"/>,
      command: () => setActiveComponent("ReviewTasks"),
    },
    {
      label: "Closed Tasks",
      icon: <FaCheck className="h-5 w-4 mr-2"/>,
      command: () => setActiveComponent("ClosedTasks"),
    },
  ];

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case "ClosedTasks":
        return <ClosedTasks />;
      case "DevelopmentTasks":
        return <DevelopmentTasks />;
      case "TestingTasks":
        return <TestingTasks />;
      case "ReviewTasks":
        return <ReviewTasks />;
      case "MyTasks":
        return <MyTasks />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-4 text-center text-blue-800">
        Task Manager
      </h1>
      <Menubar model={menuItems} className="min-w-4/5d" />
      <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 220px)" }}>
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default ManageTasks;
