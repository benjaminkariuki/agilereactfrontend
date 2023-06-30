import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import clsx from "clsx";
import SidebarData from "./SidebarData";

function SideBar({ isOpen }) {
  const userRole = useSelector((state) => state.user.userRole);

  const filteredSidebarData = SidebarData.filter((item) => {
    if (userRole === "COO" && (item.id === 5 || item.id === 6)) {
      // COO can view items with id 5 and 6
      return true;
    } else if (userRole === "Project Manager" && item.id === 6) {
      // Project Manager cannot view item with id 6 (Create User)
      return false;
    } else if (
      userRole !== "COO" &&
      userRole !== "Project Manager" &&
      (item.id === 5 || item.id === 6)
    ) {
      // Other roles cannot view items with id 5 and 6 (Users and Create User)
      return false;
    }
    return true; // Include all other menu items
  });

  return (
    <div
      className={clsx([
        "bg-white transition-all duration-500 ease-in",
        isOpen ? "w-1/4" : "w-10",
      ])}
    >
      <ul className="flex flex-col">
        {filteredSidebarData.map((item) => (
          <li key={item.id} className="text-blue-900">
            <a
              href={item.path}
              className="flex items-center py-2 pl-2 hover:bg-blue-100 rounded"
            >
              <span className="text-2xl mr-2">
                {isOpen ? item.iconOpened : item.iconClosed}
              </span>
              <span className="font-bold text-blue-800">{item.title}</span>
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
