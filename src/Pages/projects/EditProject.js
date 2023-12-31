import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import FileDownload from "react-file-download";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import _ from "lodash";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../apiConfig";


const EditProject = ({ projectId, routeToListProjects }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUsersArray, setSelectedUsersArray] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [contact, setcontact] = useState();


  const [projectData, setProjectData] = useState({
    title: "",
    editedTitle: "", //edited title

    overview: "",
    editedOverview: "", //updating overview

    excel_file: null,

    status: "active",

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
  const navigate = useNavigate();


  const [categoryOptions, setCategory] = useState([]);

  const [systemOptions, setSystemOptions] = useState([]);

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
    if (error && toast.current) {
      toast.current?.show({
        severity: "error",
        summary: "Error occurred",
        detail: handleErrorMessage(error),
        life: 3000,
      });
    }
  };

  const handleErrorMessage = (error) => {
    if (
      error &&
      error.response &&
      error.response.data &&
      error.response.data.errors
    ) {
      // Extract error messages and join them into a single string
      return Object.values(error.response.data.errors).flat().join(" ");
    } else if (error && error.message) {
      // Client-side error (e.g., no internet)
      return error.message;
    }
    // If no errors property is found, return the main message or a default error message
    return error &&
      error.response &&
      error.response.data &&
      error.response.data.message
      ? error.response.data.message
      : "An unexpected error occurred.";
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

  useEffect(() => {
    fetchName();
    fetchCategories();
   
    fetchSystemTypes();
  }, []);

  const fetchName = async () => {
    try {
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly
  
      const response = await fetch(
        `${API_BASE_URL}/appName`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 401) {
        navigate('/');
      }
  
      // Rest of your code...
    } catch (error) {
      // Error handling code...
    }
  };

  const fetchUsers = () => {
    const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios
      .get(`${API_BASE_URL}/allUsersData`, config)
      .then((response) => {

        if (response.status === 401) {
          navigate('/');
        }

        setUsersData(response.data.users);
      })
      .catch((error) => {
        
        onError(error);
      });
  };

  const fetchCategories = async () => {
    try {
      const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await fetch(
        `${API_BASE_URL}/getCategoriesProject`,
        {
          method: "GET",
          headers: config.headers,
        }
      );

      if (response.status === 401) {
        navigate("/");
      }

      const data = await response.json();
      setCategory(data.categories.map(category => ({ label: category.name, value: category.name })));
    } catch (error) {
      onError(error);
    }
  };

  const fetchSystemTypes = async () => {
    try {
      const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await fetch(
        `${API_BASE_URL}/getSystemTypeProject`,
        {
          method: "GET",
          headers: config.headers,
        }
      );

      if (response.status === 401) {
        navigate("/");
      }

      const data = await response.json();
      setSystemOptions(data.systype.map(sys => ({ label: sys.name, value: sys.name })));

    } catch (error) {
      onError(error);
    }
  };

  const fetchProjectDetails = (projectId) => {
    const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios
      .get(
        `${API_BASE_URL}/allProjectsWithId/${projectId}`,
        config
      )
      .then((response) => {

        if (response.status === 401) {
          navigate('/');
        }

        const fetchedprojectsid = response.data.data;
        const sDate = new Date(fetchedprojectsid.start_date);
        const eDate = new Date(fetchedprojectsid.end_date);

        const organizationIds = fetchedprojectsid.organization
          .filter((user) => user.status !== "inactive")
          .map((org) => org.userId);

        setProjectData({
          title: fetchedprojectsid.title,
          overview: fetchedprojectsid.overview,
          excel_file: null,
          status: fetchedprojectsid.status,
          clientName: fetchedprojectsid.clientname,
          clientContacts: fetchedprojectsid.clientcontact,
          clientEmail: fetchedprojectsid.clientemail,
          startDate: sDate,
          endDate: eDate,
          category: fetchedprojectsid.category,
          system: fetchedprojectsid.system_type,
        });
        setSelectedUsersArray(organizationIds);
      })
      .catch((error) => {
       
        onError(error);
      });
  };

  const handleCheckboxChange = (user, isChecked) => {
    if (isChecked) {
      setSelectedUsers((prevUsers) => [...prevUsers, user]);
    } else {
      setSelectedUsers((prevUsers) =>
        prevUsers.filter((u) => u.id !== user.id)
      );
    }
  };

  const handleSubmit = (event) => {
    fetchName();
    event.preventDefault();

    setIsLoading(true);
    const selectedUserIds = selectedUsers.map((user) => user.id);

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
    if (contact && contact.trim() !== "") {
      formData.append("clientcontact", contact);
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

    if (selectedUserIds.length > 0) {
      selectedUserIds.forEach((id, index) => {
        formData.append(`selectedUsers[${index}]`, id);
      });
    }

    if (projectData.editedcategory && projectData.editedcategory.trim !== "") {
      formData.append("category", projectData.editedcategory);
    }

    if (projectData.editedsystem && projectData.editedsystem.trim !== "") {
      formData.append("system_type", projectData.editedsystem);
    }

    if (projectData.excel_file !== null) {
      formData.append("excel_file", projectData.excel_file);
  }

    const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios
      .post(
        `${API_BASE_URL}/edit_projects/${projectId}`,
        formData,
        {
          headers: {
            ...config.headers,
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {

        if (response.status === 401) {
          navigate('/');
        }

        onSuccess(response.data.message);

        setTimeout(() => {
          setIsLoading(false);
          routeToListProjects();
        }, 1000);
      })
      .catch((error) => {
        setIsLoading(false);

        
        onError(error);
      });
  };

  //HANDLING DOWNLOADING THE EXCEL TEMPLATE
  const downloadExcelFile = async () => {
    fetchName();
    try {
      const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(
        `${API_BASE_URL}/download-excel-edit/${projectId}`,
        {
          ...config,
          responseType: "blob",
        }
      );

      if (response.status === 401) {
        navigate('/');
      }

      FileDownload(response.data, "project_data.xlsx");
    } catch (error) {
      
      onError(error);
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

  
  
  return (
    <div className="bg-white rounded-lg  shadow p-4">
      <Toast ref={toast} />
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

            <div>
              <InputText
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="h-8"
              />

              <div
                style={{
                  overflowY: "auto",
                  maxHeight: "50vh",
                  marginTop: "10px",
                }}
              >
                {usersData
                  .filter((user) => {
                    const nameMatch = `${user.firstName} ${user.lastName}`
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase());

                    const departmentMatch = user.department
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase());

                    const roleMatch = user.role.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase());

                    return nameMatch || departmentMatch || roleMatch;
                  })
                  .map((user) => (
                    <div key={user.id}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.some((u) => u.id === user.id)}
                        onChange={(e) =>
                          handleCheckboxChange(user, e.target.checked)
                        }
                      />
                      <label
                        className={`ml-2 text-sm ${
                          selectedUsersArray.includes(user.id)
                            ? "text-blue-600"
                            : "text-gray-700"
                        }`}
                      >
                        {_.startCase(user.firstName)}{" "}
                        {_.startCase(user.lastName)} -{" "}
                        {_.startCase(user.role.name)} -{" "}
                        {_.startCase(user.department)}
                      </label>
                    </div>
                  ))}
              </div>
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
              <div className="flex items-center">
                <label
                  htmlFor="clientEmail"
                  className="block text-sm font-medium mr-4" // added 'mr-4' for some right margin space
                >
                  Client Contacts
                </label>
                <label
                  htmlFor="clientEmail"
                  className="block text-sm font-medium"
                >
                  {projectData.clientContacts}
                </label>
              </div>

              <PhoneInput
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                international
                defaultCountry="KE"
                value={contact}
                onChange={setcontact}
                
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
