import React, { useState, useEffect } from "react";
import axios from "axios";
import FileDownload from "react-file-download";
import { Editor } from "primereact/editor";

const CreateProject = ({ routeToListProjects }) => {
  const [projectData, setProjectData] = useState({
    title: "",
    overview: "",
    excel_file: null,
    category: "",
    system: "",
    projectManager: [],
    businessAnalyst: [],
    developers: [],
    teamLeads: [],
    clientName: "",
    clientContacts: "",
    clientEmail: "",
    startDate: "",
    endDate: "",
  });
  const [isloading, setisloading] = useState(false);
  const [usersData, setUsersData] = useState([]);
  const [create, setCreate] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setProjectData({ ...projectData, [name]: value });
  };

  const handleStartDateChange = (event) => {
    const { name, value } = event.target;
    setProjectData((prevState) => ({
      ...prevState,
      [name]: new Date(value), // Convert the string value to a Date object
    }));
  };

  const handleEndDateChange = (event) => {
    const { name, value } = event.target;
    setProjectData((prevState) => ({
      ...prevState,
      [name]: new Date(value), // Convert the string value to a Date object
    }));
  };

  const formatDate = (date) => {
    if (!date) return ""; // Return an empty string if the date is not provided
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios
      .get("https://agile-pm.agilebiz.co.ke/api/allUsers")
      .then((response) => {
        setUsersData(response.data.users);
      })
      .catch((error) => {
        console.log("Error fetching users:", error);
      });
  };
  const getOptionsForRole = (role) => {
    return usersData.filter((user) => user.role.name === role);
  };

  const handleRoleCheckboxChange = (role, userId, checked) => {
    setProjectData((prevState) => {
      const existingRoleData = prevState[role];

      if (Array.isArray(existingRoleData)) {
        if (checked) {
          return {
            ...prevState,
            [role]: [...existingRoleData, userId],
          };
        } else {
          return {
            ...prevState,
            [role]: existingRoleData.filter((id) => id !== userId),
          };
        }
      } else {
        // Convert single value to array
        const updatedRoleData = checked ? [userId] : [];
        return {
          ...prevState,
          [role]: updatedRoleData,
        };
      }
    });
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("title", projectData.title);
    formData.append("overview", projectData.overview);
    formData.append("clientname", projectData.clientName);
    formData.append("clientcontact", projectData.clientContacts);
    formData.append("clientemail", projectData.clientEmail);
    formData.append("start_date", formatDate(projectData.startDate));
    formData.append("end_date", formatDate(projectData.endDate));
    formData.append("excel_file", projectData.excel_file);
    formData.append("category", projectData.category);
    formData.append("system_type", projectData.system);
    // For array data, we append each element of the array
    projectData.projectManager.forEach((pm, index) => {
      formData.append(`projectmanager[${index}]`, pm);
    });
    projectData.businessAnalyst.forEach((ba, index) => {
      formData.append(`businessanalyst[${index}]`, ba);
    });
    projectData.developers.forEach((dev, index) => {
      formData.append(`developers[${index}]`, dev);
    });
    projectData.teamLeads.forEach((tl, index) => {
      formData.append(`teamleads[${index}]`, tl);
    });
    setisloading(true);
    axios
      .post("https://agile-pm.agilebiz.co.ke/api/create_projects", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log("Project created successfully:", response.data);

        // Reset the form after successful submission
        setProjectData({
          title: "",
          overview: "",
          excel_file: null,
          system: "",
          category: "",
          projectManager: [],
          businessAnalyst: [],
          developers: [],
          teamLeads: [],
          clientName: "",
          clientContacts: "",
          clientEmail: "",
          startDate: "",
          endDate: "",
        });
      })
      .catch((error) => {
        console.log("This is console log error", error);
        console.error("Error creating project:", error);
        setisloading(false);
        // Handle the error in your application
      });
  };

  //HANDLING DOWNLOADING THE EXCEL TEMPLATE
  const downloadExcelFile = async () => {
    try {
      const response = await axios.get(
        "https://agile-pm.agilebiz.co.ke/api/download-excel",
        {
          responseType: "blob",
        }
      );
      FileDownload(response.data, "project_data_template.xlsx");
    } catch (error) {
      console.error("Error downloading Excel file:", error);
    }
  };

  //handle input from excel
  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProjectData({ ...projectData, excel_file: file });
      };
      reader.readAsDataURL(file);
      setProjectData({ ...projectData, excel_file: file });
    }
  };

  const handleCancel = () => {
    // Reset the form fields to initial values
    setProjectData({
      title: "",
      overview: "",
      excel_file: null,
      projectManager: [],
      businessAnalyst: [],
      developers: [],
      teamLeads: [],
      clientName: "",
      clientContacts: "",
      clientEmail: "",
      startDate: "",
      endDate: "",
    });
    setisloading(false);
    setCreate(!create);
    routeToListProjects();
  };

  // Filter users based on department and role
  const filterUsersByRoleAndDepartment = (roleName, department) => {
    return usersData.filter(
      (user) => user.department === department && user.role.name === roleName
    );
  };
  // Filter users for team leads
  const filterWithTeamLead = () => {
    return filterUsersByRoleAndDepartment(
      "Team lead business central",
      "Business Central Department"
    )
      .concat(
        filterUsersByRoleAndDepartment(
          "Team lead infrastructure",
          "Infrastructure Department"
        )
      )
      .concat(
        filterUsersByRoleAndDepartment(
          "Team lead business analyst",
          "Business Analyst Department"
        )
      )
      .concat(
        filterUsersByRoleAndDepartment(
          "Team lead Implementation",
          "Implementation Department"
        )
      )
      .concat(
        filterUsersByRoleAndDepartment("Team lead web", "Web Department")
      );
  };

  console.log("team leads ", filterWithTeamLead());

  // Filter users for project managers and senior project managers
  const getProjectManagers = (department) => {
    return filterUsersByRoleAndDepartment("Project manager", department);
  };

  // Filter users for business analysts
  const getBusinessAnalysts = (department) => {
    return filterUsersByRoleAndDepartment("business analyst", department);
  };

  // Filter users for developers
  const getDevelopers = (department) => {
    return filterUsersByRoleAndDepartment("developer", department);
  };

  return (
    <div className="bg-white rounded-lg  shadow p-4">
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold mb-4">Create New Project</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left section */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Projects Details</h2>
            {/* Title */}
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={projectData.title}
                onChange={handleInputChange}
                className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
                required
              />
            </div>
            {/* Overview */}
            <div className="mb-4">
              <label htmlFor="overview" className="block text-sm font-medium">
                Overview
              </label>
              <Editor
                id="overview"
                name="overview"
                value={projectData.overview}
                onChange={handleInputChange}
                className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
                required
                style={{ height: "320px" }}
              />
            </div>
            {/* Milestones */}
            <div className="mb-4">
              <label
                htmlFor="milestones"
                className="block text-sm font-medium mb-2"
              >
                Milestones/Phases
              </label>
              <div className="flex items-start">
                <button
                  type="button"
                  onClick={downloadExcelFile}
                  className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-2 font-bold rounded focus:outline-none focus:shadow-outline mr-2"
                >
                  Download Excel Template
                </button>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="milestones"
                  name="milestones"
                />
                <label
                  htmlFor="milestones"
                  className="cursor-pointer bg-gray-100 px-2 py-2 rounded-md border border-gray-300 hover:bg-gray-200 focus:bg-gray-200 flex items-center"
                >
                  {projectData.excel_file
                    ? projectData.excel_file.name // Display the file name
                    : "Choose a filled Excel file"}
                </label>
              </div>
            </div>
            {/* Category */}
            <div className="mb-4">
              <label htmlFor="category" className="block text-sm font-medium">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={projectData.category}
                onChange={handleInputChange}
                className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
                required
              >
                <option value="" disabled required>
                  Select Category
                </option>
                <option value="implementation">Implementation</option>
                <option value="support">Support</option>
              </select>
            </div>

            {/* System */}
            <div className="mb-4">
              <label htmlFor="system" className="block text-sm font-medium">
                System
              </label>
              <select
                id="system"
                name="system"
                value={projectData.system}
                onChange={handleInputChange}
                className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
                required
              >
                <option value="" disabled required>
                  Select System
                </option>
                <option value="business applications">
                  Business Applications
                </option>
                <option value="CRM solutions">CRM Solutions</option>
                <option value="analytics">Analytics</option>
                <option value="EDMs">EDMs</option>
                <option value="cloud solutions">Cloud Solutions</option>
                <option value="ict infrastructure">ICT Infrastructure</option>
              </select>
            </div>

            {/* Date inputs */}
            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="mb-4">
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium"
                >
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formatDate(projectData.startDate)}
                  onChange={handleStartDateChange}
                  className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
                  required
                />
              </div>

              {/* End Date */}
              <div className="mb-4">
                <label htmlFor="endDate" className="block text-sm font-medium">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formatDate(projectData.endDate)}
                  onChange={handleEndDateChange}
                  className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
                  required
                />
              </div>
            </div>
          </div>
          {/* Middle section */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Projects Crew</h2>
            {/* Project Manager */}
            <div className="mb-4">
              <label
                htmlFor="projectManager"
                className="block text-sm font-medium"
              >
                Project Manager
              </label>
              {getProjectManagers("Porfolio Managers Department").map(
                (user) => (
                  <div key={user.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`projectManager-${user.id}`}
                      name="projectManager"
                      value={user.id}
                      checked={projectData.projectManager.includes(user.id)}
                      onChange={(e) =>
                        handleRoleCheckboxChange(
                          "projectManager",
                          user.id,
                          e.target.checked
                        )
                      }
                      className="form-checkbox text-blue-500 appearance-none h-5 w-5 mr-2 border border-gray-300 rounded-md checked:bg-blue-500 checked:border-transparent focus:outline-none"
                    />
                    <label
                      htmlFor={`projectManager-${user.id}`}
                      className={`ml-2 text-sm ${
                        projectData.projectManager.includes(user.id)
                          ? "text-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      {user.firstName} {user.lastName}
                    </label>
                  </div>
                )
              )}
            </div>
            {/* Business Analyst */}
            <div className="mb-4">
              <label
                htmlFor="businessAnalyst"
                className="block text-sm font-medium"
              >
                Business Analyst
              </label>
              {getBusinessAnalysts("Business Analyst Department").map(
                (user) => (
                  <div key={user.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`businessAnalyst-${user.id}`}
                      name="businessAnalyst"
                      value={user.id}
                      checked={projectData.businessAnalyst.includes(user.id)}
                      onChange={(e) =>
                        handleRoleCheckboxChange(
                          "businessAnalyst",
                          user.id,
                          e.target.checked
                        )
                      }
                      className="form-checkbox text-blue-500 appearance-none h-5 w-5 mr-2 border border-gray-300 rounded-md checked:bg-blue-500 checked:border-transparent focus:outline-none"
                    />
                    <label
                      htmlFor={`businessAnalyst-${user.id}`}
                      className={`ml-2 text-sm ${
                        projectData.businessAnalyst.includes(user.id)
                          ? "text-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      {user.firstName} {user.lastName}
                    </label>
                  </div>
                )
              )}
            </div>
            {/* Team Leads */}
            <div className="mb-4">
              <label htmlFor="teamLeads" className="block text-sm font-medium">
                Team Leads
              </label>
              {filterWithTeamLead().map((user) => (
                <div key={user.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`teamLead-${user.id}`}
                    name="teamLeads"
                    value={user.id}
                    checked={projectData.teamLeads.includes(user.id)}
                    onChange={(e) =>
                      handleRoleCheckboxChange(
                        "teamLeads",
                        user.id,
                        e.target.checked
                      )
                    }
                    className="form-checkbox text-blue-500 appearance-none h-5 w-5 mr-2 border border-gray-300 rounded-md checked:bg-blue-500 checked:border-transparent focus:outline-none"
                  />
                  <label
                    htmlFor={`teamLead-${user.id}`}
                    className={`ml-2 text-sm ${
                      projectData.teamLeads.includes(user.id)
                        ? "text-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    {user.firstName} {user.lastName} - {user.department}
                  </label>
                </div>
              ))}
            </div>
            {/* Developers */}
            <div className="mb-4">
              <label htmlFor="developers" className="block text-sm font-medium">
                Developers
              </label>
              {getDevelopers("Web Department").map((user) => (
                <div key={user.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`developer-${user.id}`}
                    name="developers"
                    value={user.id}
                    checked={projectData.developers.includes(user.id)}
                    onChange={(e) =>
                      handleRoleCheckboxChange(
                        "developers",
                        user.id,
                        e.target.checked
                      )
                    }
                    className="form-checkbox text-blue-500 appearance-none h-5 w-5 mr-2 border border-gray-300 rounded-md checked:bg-blue-500 checked:border-transparent focus:outline-none"
                  />
                  <label
                    htmlFor={`developer-${user.id}`}
                    className={`ml-2 text-sm ${
                      projectData.developers.includes(user.id)
                        ? "text-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    {user.firstName} {user.lastName}
                  </label>
                </div>
              ))}
            </div>
          </div>
          {/* Right section */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Client Details</h2>
            {/* Client Name */}
            <div className="mb-4">
              <label htmlFor="clientName" className="block text-sm font-medium">
                Client Name
              </label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={projectData.clientName}
                onChange={handleInputChange}
                className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
                required
              />
            </div>
            {/* Client Contacts */}
            <div className="mb-4">
              <label
                htmlFor="clientEmail"
                className="block text-sm font-medium"
              >
                Client Email
              </label>
              <input
                type="email"
                id="clientEmail"
                name="clientEmail"
                value={projectData.clientEmail}
                onChange={handleInputChange}
                className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
                required
              />
            </div>
            {/* Client Email */}
            <div className="mb-4">
              <label
                htmlFor="clientEmail"
                className="block text-sm font-medium"
              >
                Client Conatcts
              </label>
              <input
                type="text"
                id="clientContacts"
                name="clientContacts"
                value={projectData.clientContacts}
                onChange={handleInputChange}
                className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
                required
              />
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <button
            type="submit" // Add type="submit" to trigger form submission
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isloading}
          >
            {isloading ? (
              <i
                className="pi pi-spin pi-spinner"
                style={{ fontSize: "2rem" }}
              ></i>
            ) : (
              "Create Project"
            )}
          </button>
          <button
            type="button" // Use type="button" for the cancel button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;
