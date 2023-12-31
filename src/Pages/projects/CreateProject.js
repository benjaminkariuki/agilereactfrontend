import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import FileDownload from "react-file-download";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import _ from "lodash";
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../apiConfig";




const CreateProject = ({ routeToListProjects }) => {
  const [projectData, setProjectData] = useState({
    title: "",
    overview: "",
    excel_file: null,
    category: null,
    system: null,
    clientName: "",
    clientContacts: "",
    clientEmail: "",
    startDate: "",
    endDate: "",
  });
  const [isloading, setisloading] = useState(false);
  const [usersData, setUsersData] = useState([]);
  const [create, setCreate] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [contact, setcontact] = useState();
  const navigate = useNavigate();

  
  const [categoryOptions, setCategory] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
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
        detail: `${error}`,
        life: 3000,
      });
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setProjectData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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
    fetchName();
    fetchUsers();
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
    const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios
      .get(`${API_BASE_URL}/allUsersData`,config)
      .then((response) => {

        if (response.status === 401) {
          navigate('/');
        }

        setUsersData(response.data.users);
      })
      .catch((error) => {
       
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
  

  const handleSubmit = (event) => {
    fetchName();
    event.preventDefault();
    const selectedUserIds = selectedUsers.map(user => user.id);

    const formData = new FormData();
    formData.append("title", projectData.title);
    formData.append("overview", projectData.overview);
    formData.append("clientname", projectData.clientName);
    formData.append("clientcontact", contact);

    formData.append("clientemail", projectData.clientEmail);
    formData.append("start_date", formatDate(projectData.startDate));
    formData.append("end_date", formatDate(projectData.endDate));
    
    if (projectData.excel_file) {

      formData.append("excel_file", projectData.excel_file);
  }
    formData.append("category", projectData.category);
    formData.append("system_type", projectData.system);
    // For array data, we append each element of the array
 

    selectedUserIds.forEach((id, index) => {
      formData.append(`selectedUsers[${index}]`, id);
    });

    setisloading(true);
    const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios
      .post(`${API_BASE_URL}/create_projects`, formData, {
        ...config,
        headers: {
            ...config.headers,
            "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {

        if (response.status === 401) {
          navigate('/');
        }

        onSuccess(response.data.message);

        setProjectData({
          title: "",
          overview: "",
          excel_file: null,
          system: "",
          category: "",
          clientName: "",
          clientContacts: "",
          clientEmail: "",
          startDate: "",
          endDate: "",
        });
        setcontact();
        setisloading(false);
        setSelectedUsers([]);
        routeToListProjects();

      })
      .catch((error) => {
        setisloading(false);
        
        if (
          error.response &&
          error.response.data &&
          error.response.data.errors
        ) {
          const errorMessages = Object.values(
            error.response.data.errors
          ).flat();
          
        
          onError(errorMessages.join(" "));
        } else {
        
          onError("An unknown error occurred."); // generic error
        }

        // Handle the error in your application
      });
  };

  //HANDLING DOWNLOADING THE EXCEL TEMPLATE
  const downloadExcelFile = async () => {
    fetchName();
    try {
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
      const response = await axios.get(
        `${API_BASE_URL}/download-excel`,
        {
          
          ...config, // Spread the contents of the config object
          responseType: "blob",

        }
      );

      if (response.status === 401) {
        navigate('/');
      }

      FileDownload(response.data, "Excel_template.xlsx");
    } catch (error) {

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
      clientName: "",
      clientContacts: "",
      clientEmail: "",
      startDate: "",
      endDate: "",
    });
    setSelectedUsers([]);
    setcontact();
    setisloading(false);
    setCreate(!create);
    routeToListProjects();
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

  return (
    <div className="bg-white rounded-lg  shadow p-4">
      <Toast ref={toast} />
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
              <textarea
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
              <Dropdown
                id="category"
                name="category"
                value={projectData.category}
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
                name="system"
                value={projectData.system}
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

            {/* Team Leads */}
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
                      {_.startCase(user.firstName)} {_.startCase(user.lastName)}{" "}
                      - {_.startCase(user.role.name)} -{" "}
                      {_.startCase(user.department)}
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
                Client Contact
              </label>
             
              <PhoneInput
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                international
                defaultCountry="KE"
                value={contact}
                onChange={setcontact}
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
                style={{ fontSize: "1.5rem" }}
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
