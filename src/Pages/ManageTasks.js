import React, { useState } from "react";
import { Menubar } from "primereact/menubar";
import ClosedTasks from "./tasks/ClosedTasks";
import DevelopmentTasks from "./tasks/DevelopmentTasks";
import TestingTasks from "./tasks/TestingTasks";
import ReviewTasks from "./tasks/ReviewTasks";
import MyTasks from "./tasks/MyTasks";
import { FaCheck, FaCode, FaBug, FaSearch, FaUser, FaHourglassHalf } from "react-icons/fa";

const ManageTasks = () => {
  const [activeComponent, setActiveComponent] = useState("MyTasks");

  const menuItems = [
    {
      label: "To Do",
      icon: <FaHourglassHalf className="h-5 w-4 mr-2" />,
      command: () => setActiveComponent("MyTasks"),
      className: activeComponent === "MyTasks" ? "border-2 border-blue-500 rounded" : "",

    },

    {
      label: "Development Tasks",
      icon: <FaCode className="h-5 w-4 mr-2"/>,
      command: () => setActiveComponent("DevelopmentTasks"),
      className: activeComponent === "DevelopmentTasks" ? "border-2 border-blue-500 rounded" : "",

    },
    {
      label: "Testing Tasks",
      icon: <FaBug className="h-5 w-4 mr-2"/>,
      command: () => setActiveComponent("TestingTasks"),
      className: activeComponent === "TestingTasks" ? "border-2 border-blue-500 rounded" : "",

    },
    {
      label: "Review Tasks",
      icon: <FaSearch className="h-5 w-4 mr-2"/>,
      command: () => setActiveComponent("ReviewTasks"),
      className: activeComponent === "ReviewTasks" ? "border-2 border-blue-500 rounded" : "",

    },
    {
      label: "Closed Tasks",
      icon: <FaCheck className="h-5 w-4 mr-2"/>,
      command: () => setActiveComponent("ClosedTasks"),
      className: activeComponent === "ClosedTasks" ? "border-2 border-blue-500 rounded" : "",

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
      <h1 className="text-xl font-bold mb-4 text-center text-blue-500">
        Task Manager
      </h1>
      <Menubar model={menuItems} className="" />
      <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 220px)" }}>
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default ManageTasks;
