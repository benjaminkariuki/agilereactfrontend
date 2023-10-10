import React, { useState } from "react";
import { useSelector } from "react-redux/es/hooks/useSelector";

import Admin from "./Dash/Admin.js";
import Consultant from "./Dash/Consultant.js";
import Default from "./Dash/Default.js";
import Leads from "./Dash/Leads.js";
import Management from "./Dash/Management.js";
import PManager from "./Dash/PManager.js";

const Dashboard = () => {
  const userActivities = useSelector((state) => state.user.userActivities);

  const dashActivity = userActivities.find(
    (activity) => activity.name.toLowerCase() === "dashboard".toLowerCase()
  );

 

    const hasAdminPermission =
  dashActivity && dashActivity.pivot.permissions.includes("Administrator");
const hasManagePermission =
  dashActivity && dashActivity.pivot.permissions.includes("Management");
const hasPmanagePermission =
  dashActivity && dashActivity.pivot.permissions.includes("ProjectManager");
const hasLeadPermission =
  dashActivity && dashActivity.pivot.permissions.includes("TeamLeads");

const hasConsultPermission =
  dashActivity && dashActivity.pivot.permissions.includes("Consultant");
const hasDefaultPermission =
  dashActivity && dashActivity.pivot.permissions.includes("Default");


  return (
    <div className="h-full">
      <h1 className="text-xl font-bold  text-center text-blue-500">
        Dashboard
      </h1>
      {hasAdminPermission ? <Admin /> :
      hasManagePermission ? <Management /> :
      hasPmanagePermission ? <PManager /> :
      hasLeadPermission ? <Leads /> :
      hasConsultPermission ? <Consultant /> :
      <Default />}
    </div>
  );
};

export default Dashboard;
