import React, { useState } from "react";
import AddRoles from "./roles/AddRoles";
import UpdateRoles from "./roles/UpdateRoles";
import ViewRoles from "./roles/ViewRoles";

const ManageRoles = () => {
  const [activeComponent, setActiveComponent] = useState("add"); // Set the initial active component

  const renderComponent = () => {
    if (activeComponent === "add") {
      return <AddRoles />;
    } else if (activeComponent === "update") {
      return <UpdateRoles />;
    } else if (activeComponent === "view") {
      return <ViewRoles />;
    } else {
      return null;
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-4 text-center text-blue-800">
        Manage Roles
      </h1>
      <div className="flex justify-center space-x-4 mb-4">
        {" "}
        {/* Updated line */}
        <button
          className={`bg-blue-500 text-white px-4 py-2 rounded ${
            activeComponent === "add" && "bg-blue-600"
          }`}
          onClick={() => setActiveComponent("add")}
        >
          Add Roles
        </button>
        <button
          className={`bg-blue-500 text-white px-4 py-2 rounded ${
            activeComponent === "update" && "bg-blue-600"
          }`}
          onClick={() => setActiveComponent("update")}
        >
          Update Roles
        </button>
        <button
          className={`bg-blue-500 text-white px-4 py-2 rounded ${
            activeComponent === "view" && "bg-blue-600"
          }`}
          onClick={() => setActiveComponent("view")}
        >
          View Roles
        </button>
      </div>
      {renderComponent()}
    </div>
  );
};

export default ManageRoles;
