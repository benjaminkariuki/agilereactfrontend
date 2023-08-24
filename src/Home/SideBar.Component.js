import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import clsx from "clsx";
import {
  HomeIcon,
  BriefcaseIcon,
  PresentationChartBarIcon,
  UsersIcon,
  UserAddIcon,
  CogIcon,
  CheckCircleIcon,
} from "@heroicons/react/outline";

import {
  HomeIcon as HomeOutlineIcon,
  BriefcaseIcon as BriefcaseOutlineIcon,
  PresentationChartBarIcon as PresentationChartBarOutlineIcon,
  UsersIcon as UsersOutlineIcon,
  UserAddIcon as UserAddOutlineIcon,
  CogIcon as CogOutlineIcon,
  CheckCircleIcon as CheckCircleOutlineIcon,
} from "@heroicons/react/solid";

function getSolidIcon(iconName) {
  switch (iconName) {
    case "HomeIcon":
      return <HomeIcon className="w-6 h-6" />;
    case "BriefcaseIcon":
      return <BriefcaseIcon className="w-6 h-6" />;
    case "PresentationChartBarIcon":
      return <PresentationChartBarIcon className="w-6 h-6" />;
    case "UsersIcon":
      return <UsersIcon className="w-6 h-6" />;
    case "UserAddIcon":
      return <UserAddIcon className="w-6 h-6" />;
    case "CogIcon":
      return <CogIcon className="w-6 h-6" />;
    case "CheckCircleIcon":
      return <CheckCircleIcon className="w-6 h-6" />;
    default:
      return null;
  }
}

function getOutlineIcon(iconName) {
  switch (iconName) {
    case "HomeOutlineIcon":
      return <HomeOutlineIcon className="w-6 h-6" />;
    case "BriefcaseOutlineIcon":
      return <BriefcaseOutlineIcon className="w-6 h-6" />;
    case "PresentationChartBarOutlineIcon":
      return <PresentationChartBarOutlineIcon className="w-6 h-6" />;
    case "UsersOutlineIcon":
      return <UsersOutlineIcon className="w-6 h-6" />;
    case "UserAddOutlineIcon":
      return <UserAddOutlineIcon className="w-6 h-6" />;
    case "CogOutlineIcon":
      return <CogOutlineIcon className="w-6 h-6" />;
    case "CheckCircleOutlineIcon":
      return <CheckCircleOutlineIcon className="w-6 h-6" />;
    default:
      return null;
  }
}

function SideBar({ isOpen }) {
  const userActivities = useSelector((state) => state.user.userActivities);
  const sideBareDisplay = userActivities.filter(
    (activity) => activity.iconClosed !== "" && activity.iconOpened !== ""
  );
  console.log(userActivities);
  return (
    <div
      className={clsx([
        "bg-white transition-all duration-500 ease-in",
        isOpen ? "w-40" : "w-10",
      ])}
    >
      <ul className="flex flex-col items-strecth">
        {sideBareDisplay.map((activity) => (
          <li key={activity.id} className="text-blue-900 whitespace-nowrap">
            <a
              href={activity.route}
              className="flex items-center py-2 pl-2 hover:bg-blue-100 rounded"
            >
              <span
                key={activity.id}
                className={`text-2xl mr-2 ${isOpen ? "" : "text-blue-800"}`}
              >
                {isOpen
                  ? getSolidIcon(activity.iconClosed)
                  : getOutlineIcon(activity.iconOpened)}
              </span>
              <span className="font-bold text-blue-800">{activity.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

SideBar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
};

export default SideBar;
