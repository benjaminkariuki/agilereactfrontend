import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import FileDownload from "react-file-download";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";

const EditProject = ({ projectId, routeToListProjects }) => {
  const [projectData, setProjectData] = useState({
    title: "",
    editedTitle: "", //edited title

    overview: "",
    editedOverview: "", //updating overview

    excel_file: null,

    status: "active",

    projectManager: [],
    editedProjectManager: [], //updating the project managers

    businessAnalyst: [],
    editedBusinessAnalyst: [], //updating the business analysts

    developers: [],
    editedDevelopers: [], //updating developers

    teamLeads: [],
    editedTeamLeads: [], //updating team leads

    clientName: "",
    editedClientName: "", // updating client names

    clientContacts: "",
    editedClientContacts: "", // updating client contacts

    clientEmail: "",
    editedClientEmail: "", //updating client email

    startDate: "",
    editedStartDate: "", //updating start date

    endDate: "",
    editedEndDate: "", //updating end date

    category: "", // Original category value
    editedcategory: "", // New category value

    system: "", // Original system value
    editedsystem: "", // New system value
  });
  const [usersData, setUsersData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const categoryOptions = [
    { label: "Implementation", value: "implementation" },
    { label: "Support", value: "support" },
  ];

  const systemOptions = [
    { label: "Business Applications", value: "business applications" },
    { label: "CRM Solutions", value: "CRM solutions" },
    { label: "Analytics", value: "analytics" },
    { label: "EDMs", value: "EDMs" },
    { label: "Cloud Solutions", value: "cloud solutions" },
    { label: "ICT Infrastructure", value: "ict infrastructure" },
  ];

  const toast = useRef(null);

  const onSuccess = (success) => {
    if (success) {
      toast.current?.show({
        severity: "success",
        summary: "Successfully",
        detail: `${success}`,
        life: 3000,
      });
    }
  };

  const onError = (error) => {
    if (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error occurred",
        detail: `${error}`,
        life: 3000,
      });
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setProjectData({ ...projectData, [name]: value || "" });
  };

  const handleStartDateChange = (event) => {
    const { name, value } = event.target;
    setProjectData((prevState) => ({
      ...prevState,
      [name]: new Date(value) || "", // Convert the string value to a Date object
    }));
  };

  const handleEndDateChange = (event) => {
    const { name, value } = event.target;
    setProjectData((prevState) => ({
      ...prevState,
      [name]: new Date(value) || "", // Convert the string value to a Date object
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
    if (projectId) {
      fetchUsers();
      fetchProjectDetails(projectId);
    }
  }, [projectId]);

  const fetchUsers = () => {
    axios
      .get("https://agile-pm.agilebiz.co.ke/api/allUsers")
      .then((response) => {
        setUsersData(response.data.users);
      })
      .catch((error) => {
        console.log("Error getting users:", error);
      });
  };

  const fetchProjectDetails = (projectId) => {
    axios
      .get(`https://agile-pm.agilebiz.co.ke/api/allProjectsWithId/${projectId}`)
      .then((response) => {
        const fetchedprojectsid = response.data.data;
        const sDate = new Date(fetchedprojectsid.start_date);
        const eDate = new Date(fetchedprojectsid.end_date);

        const projectManagersIds = fetchedprojectsid.projectmanager
          .filter((user) => user.status !== "inactive")
          .map((pm) => pm.userId);

        const businessAnalystIds = fetchedprojectsid.businessanalyst
          .filter((user) => user.status !== "inactive")
          .map((ba) => ba.userId);
        const developersIds = fetchedprojectsid.developers
          .filter((user) => user.status !== "inactive")
          .map((dev) => dev.userId);
        const teamLeadsIds = fetchedprojectsid.teamleads
          .filter((user) => user.status !== "inactive")
          .map((tl) => tl.userId);

        setProjectData({
          title: fetchedprojectsid.title,
          overview: fetchedprojectsid.overview,
          excel_file: null,
          status: fetchedprojectsid.status,
          projectManager: projectManagersIds,
          businessAnalyst: businessAnalystIds,
          developers: developersIds,
          teamLeads: teamLeadsIds,
          clientName: fetchedprojectsid.clientname,
          clientContacts: fetchedprojectsid.clientcontact,
          clientEmail: fetchedprojectsid.clientemail,
          startDate: sDate,
          endDate: eDate,
          category: fetchedprojectsid.category,
          system: fetchedprojectsid.system_type,
        });
      })
      .catch((error) => {
        if (error.response && error.response.status === 429) {
          // Retry the API call after a delay (e.g., 2 seconds)
          setTimeout(() => {
            fetchProjectDetails(projectId);
          }, 2000);
        } else {
          console.log("Error fetching project details:", error);
        }
      });
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
    setIsLoading(true);
    const formData = new FormData();
    // Check and append edited fields if they exist and are not empty
    if (projectData.editedTitle && projectData.editedTitle.trim() !== "") {
      formData.append("title", projectData.editedTitle);
    }

    if (
      projectData.editedOverview &&
      projectData.editedOverview.trim() !== ""
    ) {
      formData.append("overview", projectData.editedOverview);
    }
    if (
      projectData.editedClientName &&
      projectData.editedClientName.trim() !== ""
    ) {
      formData.append("clientname", projectData.editedClientName);
    }
    if (
      projectData.editedClientContacts &&
      projectData.editedClientContacts.trim() !== ""
    ) {
      formData.append("clientcontact", projectData.editedClientContacts);
    }

    if (
      projectData.editedClientEmail &&
      projectData.editedClientEmail.trim() !== ""
    ) {
      formData.append("clientemail", projectData.editedClientEmail);
    }

    if (projectData.editedStartDate && projectData.editedStartDate !== "") {
      formData.append("start_date", formatDate(projectData.editedStartDate));
    }

    if (projectData.editedEndDate && projectData.editedEndDate !== "") {
      formData.append("end_date", formatDate(projectData.editedEndDate));
    }

    //uploading the excel
    formData.append("excel_file", projectData.excel_file);

    // For array data, we append each element of the array
    // Append editedProjectManager if it exists and is not empty

    projectData.editedProjectManager?.forEach((pm, index) => {
      formData.append(`projectmanager[${index}]`, pm);
    });

    // Append editedBusinessAnalyst if it exists and is not empty

    projectData.editedBusinessAnalyst?.forEach((ba, index) => {
      formData.append(`businessanalyst[${index}]`, ba);
    });

    // Append editedDevelopers if it exists and is not empty

    projectData.editedDevelopers?.forEach((dev, index) => {
      formData.append(`developers[${index}]`, dev);
    });

    // Append editedTeamLeads if it exists and is not empty

    projectData.editedTeamLeads?.forEach((tl, index) => {
      formData.append(`teamleads[${index}]`, tl);
    });

    if (projectData.editedcategory && projectData.editedcategory.trim !== "") {
      formData.append("category", projectData.editedcategory);
    }
    if (projectData.editedsystem && projectData.editedsystem.trim !== "") {
      formData.append("system_type", projectData.editedsystem);
    }

    axios
      .post(
        `https://agile-pm.agilebiz.co.ke/api/edit_projects/${projectId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        onSuccess(response.data.message);
        setTimeout(() => {
          setIsLoading(false);
          routeToListProjects();
        }, 1000);
        
      })
      .catch((error) => {
        onError(error.response.data.error);
        setIsLoading(false);
      });
  };

  //HANDLING DOWNLOADING THE EXCEL TEMPLATE
  const downloadExcelFile = async () => {
    try {
      const response = await axios.get(
        `https://agile-pm.agilebiz.co.ke/api/download-excel-edit/${projectId}`,
        {
          responseType: "blob",
        }
      );
      FileDownload(response.data, "project_data.xlsx");
    } catch (error) {
      onError(error.response.data.message);
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
    routeToListProjects();
  };

  if (!projectId) {
    return (
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        Click a project First
      </div>
    );
  }

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
      <Toast ref={toast}  />
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold mb-4 text-center">
          Edit Project {projectData.title}
        </h2>

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
                name="editedTitle"
                placeholder={projectData.title}
                value={projectData.editedTitle}
                onChange={handleInputChange}
                className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
              />
            </div>
            {/* Overview */}
            <div className="mb-4">
              <label htmlFor="overview" className="block text-sm font-medium">
                Overview
              </label>
              <textarea
                id="overview"
                name="editedOverview"
                placeholder={projectData.overview}
                value={projectData.editedOverview}
                onChange={handleInputChange}
                className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
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
                  Download {projectData.title} Data
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
              <Dropdown
                id="category"
                name="editedcategory"
                value={
                  projectData.editedcategory
                    ? projectData.editedcategory
                    : projectData.category
                }
                options={categoryOptions}
                onChange={handleInputChange}
                placeholder="Select Category"
                className="w-full"
              />
            </div>
            {/* System */}
            <div className="mb-4">
              <label htmlFor="system" className="block text-sm font-medium">
                System
              </label>
              <Dropdown
                id="system"
                name="editedsystem"
                value={
                  projectData.editedsystem
                    ? projectData.editedsystem
                    : projectData.system
                }
                options={systemOptions}
                onChange={handleInputChange}
                placeholder="Select System"
                className="w-full"
              />
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
                  name="editedStartDate"
                  placeholder={formatDate(projectData.startDate)}
                  value={
                    projectData.editedStartDate
                      ? formatDate(projectData.editedStartDate)
                      : formatDate(projectData.startDate)
                  }
                  onChange={handleStartDateChange}
                  className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
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
                  name="editedEndDate"
                  placeholder={formatDate(projectData.endDate)}
                  value={
                    projectData.editedEndDate
                      ? formatDate(projectData.editedEndDate)
                      : formatDate(projectData.endDate)
                  }
                  onChange={handleEndDateChange}
                  className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
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
                      onChange={(e) =>
                        handleRoleCheckboxChange(
                          "editedProjectManager",
                          user.id,
                          e.target.value
                        )
                      }
                      className={`form-checkbox ${
                        projectData.projectManager.includes(user.id)
                          ? "checked:bg-red-500"
                          : "checked:bg-blue-500"
                      } appearance-none h-5 w-5 mr-2 border border-gray-300 rounded-md checked:border-transparent focus:outline-none`}
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
                      onChange={(e) =>
                        handleRoleCheckboxChange(
                          "editedBusinessAnalyst",
                          user.id,
                          e.target.value
                        )
                      }
                      className={`form-checkbox ${
                        projectData.businessAnalyst.includes(user.id)
                          ? "checked:bg-red-500"
                          : "checked:bg-blue-500"
                      } appearance-none h-5 w-5 mr-2 border border-gray-300 rounded-md checked:bg-blue-500 checked:border-transparent focus:outline-none`}
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
                    onChange={(e) =>
                      handleRoleCheckboxChange(
                        "editedTeamLeads",
                        user.id,
                        e.target.value
                      )
                    }
                    className={`form-checkbox ${
                      projectData.teamLeads.includes(user.id)
                        ? "checked:bg-red-500"
                        : "checked:bg-blue-500"
                    } appearance-none h-5 w-5 mr-2 border border-gray-300 rounded-md checked:bg-blue-500 checked:border-transparent focus:outline-none`}
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
                    onChange={(e) =>
                      handleRoleCheckboxChange(
                        "editedDevelopers",
                        user.id,
                        e.target.value
                      )
                    }
                    className={`form-checkbox ${
                      projectData.developers.includes(user.id)
                        ? "checked:bg-red-500"
                        : "checked:bg-blue-500"
                    } appearance-none h-5 w-5 mr-2 border border-gray-300 rounded-md  checked:border-transparent focus:outline-none`}
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
                name="editedClientName"
                placeholder={projectData.clientName}
                value={projectData.editedClientName}
                onChange={handleInputChange}
                className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
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
                name="editedClientEmail"
                placeholder={projectData.clientEmail}
                value={projectData.editedClientEmail}
                onChange={handleInputChange}
                className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
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
                name="editedClientContacts"
                placeholder={projectData.clientContacts}
                value={projectData.editedClientContacts}
                onChange={handleInputChange}
                className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <button
            type="submit" // Add type="submit" to trigger form submission
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {isLoading ? (
              <i
                className="pi pi-spin pi-spinner"
                style={{ fontSize: "1.4rem" }}
              ></i>
            ) : (
              "Save"
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

export default EditProject;
