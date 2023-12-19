import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { useSelector } from "react-redux/es/hooks/useSelector";
import axios from "axios";
import { Toast } from "primereact/toast";
import { Chart } from "primereact/chart";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../../../apiConfig";

const ProjectDetailView = ({ project, onBack }) => {

    const [activeTab, setActiveTab] = useState('Details'); // Default active tab is 'Details'


    const handleNavigationClick = (tab) => {
        setActiveTab(tab); // Update the active tab state
        // Logic to switch component views
      };

      const handleCreateIssue = () => {
        console.log("Create Issue Clicked");
        // Add your logic for creating an issue here
      };
    


    return (
      <div className="p-5 h-full mb-12 overflow-auto">
        <div className="flex justify-between items-start mb-4">
          <button 
            onClick={onBack} 
            className="flex items-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-300"
          >
            <svg 
              className="w-4 h-4 mr-2 fill-current" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20"
            >
              <path d="M7.707 14.707L3.414 10.414 7.707 6.121 6.293 4.707 0.586 10.414 6.293 16.121z"/>
            </svg>
            Back to Projects
          </button>

          <button 
         onClick={handleCreateIssue} 

            className="flex items-center bg-green-500 text-white py-2 px-4 rounded hover:bg-green-300"
          >
            {/* Add Icon */}
          <svg 
            className="w-4 h-4 mr-2 fill-current" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
            Create an issue.
          </button>
        
        </div>

          {/* Project Title and Status */}
      <div className="flex items-center mb-2 mt-8">
        <h2 className="font-bold text-black">{project.title}</h2>
        {project.status === "active" ? (
          <span className="ml-2 rounded-full bg-green-500 text-white px-2 py-0.5 text-sm font-medium">
            Active
          </span>
        ) : (
          <span className="ml-2 rounded-full bg-red-500 text-white px-2 py-0.5 text-sm font-medium">
            Inactive
          </span>
        )}
      </div>

        <p className="text-gray-600">{project.overview}</p>

        
        <div className="flex space-x-4 mb-4 mt-8">
        {/* Navigation tabs */}
        <span 
          className={`cursor-pointer ${activeTab === 'Details' ? 'text-green-500 border-b-2 border-green-500' : 'text-blue-500'}`} 
          onClick={() => handleNavigationClick('Details')}
        >
          Details
        </span>
        <span 
          className={`cursor-pointer ${activeTab === 'Applications' ? 'text-green-500 border-b-2 border-green-500' : 'text-blue-500'}`} 
          onClick={() => handleNavigationClick('Applications')}
        >
          Applications
        </span>
        <span 
          className={`cursor-pointer ${activeTab === 'Discussion' ? 'text-green-500 border-b-2 border-green-500' : 'text-blue-500'}`} 
          onClick={() => handleNavigationClick('Discussion')}
        >
          Discussion
        </span>
      </div>
      {/* Placeholder for the content that changes when navigation items are clicked */}
      <div id="content">
        {/* Dynamically include the component based on the state set by handleNavigationClick */}
      </div>




      </div>
    );
};

export default ProjectDetailView;
