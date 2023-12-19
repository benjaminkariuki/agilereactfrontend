import React, { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import axios from "axios";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import CreateUserForm from "./UserComponents/CreateUserForm";
import CreateClientForm from "./UserComponents/CreateClientForm";
import { AnimatePresence, motion } from "framer-motion";

const CreateUser = () => {
  const [formType, setFormType] = useState(0); // 'user=0' or 'client=1'

  const [firstName, setFirstName] = useState("");
  const [firstNameClient, setFirstNameClient] = useState("");

  const [lastName, setLastName] = useState("");
  const [lastNameClient, setLastNameClient] = useState("");

  const [email, setEmail] = useState("");
  const [emailClient, setEmailClient] = useState("");

  const [contact, setcontact] = useState();
  const [contactClient, setcontactClient] = useState();

  const navigate = useNavigate();

  const [role_id, setRole] = useState("");
  const [role_id_client, setRoleClient] = useState("");

  const [selelctedDepartment, setSelelctedDepartment] = useState(""); // New department state
  const [roles, setRoles] = useState([]);
  const [rolesClient, setRolesClient] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingClient, setLoadingClient] = useState(false);

  const toast = useRef(null);
  const { userActivities } = useSelector((state) => state.user);

  const createActivity = userActivities.find(
    (activity) => activity.name === "Create-User"
  );
  const hasReadPermissionCreateUser =
    createActivity.pivot.permissions.includes("read");

  const hasWritePermissionCreateUser =
    createActivity.pivot.permissions.includes("write");

  const [departments, setDepartments] = useState([]);

  const [projects, setProjects] = useState([]);
  const [selectedprojects, setSelectedProjects] = useState([]);

  // Function to toggle form type

  const toggleFormType = (type) => {
    if (type === 0) {
      // Reset client form fields
      setFirstNameClient("");
      setLastNameClient("");
      setEmailClient("");
      setcontactClient("");
      setRoleClient("");
      setSelectedProjects([]);

      setFirstName("");
      setLastName("");
      setEmail("");
      setcontact("");
      setRole("");
      setSelelctedDepartment("");
    } else if (type === 1) {
      // Reset user form fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setcontact("");
      setRole("");
      setSelelctedDepartment("");

      setFirstNameClient("");
      setLastNameClient("");
      setEmailClient("");
      setcontactClient("");
      setRoleClient("");
      setSelectedProjects([]);
    }
    setFormType(type);
  };
  
  const handleErrorMessage = (error) => {
    if (error && error.response && error.response.data) {
      if (error.response.data.errors) {
        // Handle validation errors
        return Object.values(error.response.data.errors).flat().join(" ");
      } else if (error.response.data.error) {
        // Handle single error message
        return error.response.data.error;
      } else if (error.response.data.message) {
        // Handle other server-side errors
        return error.response.data.message;
      }
    } else if (error && error.message) {
      // Client-side error (e.g., no internet)
      return error.message;
    }
  
    // Default error message
    return "An unexpected error occurred.";
  };
  
  const onSuccessCreate = (success) => {
    if (success) {
      toast.current.show({
        severity: "success",
        summary: "Created successfully",
        detail: `Name: ${success}`,
        life: 3000,
      });
    }
  };

  const onCreatingUser = (error) => {
    if (error && toast.current) {
      toast.current.show({
        severity: "warn",
        summary: "Error creating user",
        detail: handleErrorMessage(error),
        life: 3000,
      });
    }
  };

  const onFetchingRoles = (error) => {
    if (error && toast.current) {
      toast.current.show({
        severity: "error",
        summary: "Error fetching roles",
        detail: `${error}`,
        life: 3000,
      });
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchDepartments();
    fetchProjects();
  }, []);

  const fetchRoles = async () => {
    try {
      const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await fetch(`${API_BASE_URL}/allRoles`, {
        method: "GET",
        headers: config.headers,
      });

      if (response.status === 401) {
        navigate("/");
      }

      const data = await response.json();
      setRoles(data.roles);
      setRolesClient(data.roles);
    } catch (error) {
      onFetchingRoles("Can't fetch roles, contact the admin");
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await fetch(`${API_BASE_URL}/getDepartments`, {
        method: "GET",
        headers: config.headers,
      });

      if (response.status === 401) {
        navigate("/");
      }

      const data = await response.json();
      setDepartments(data.departments);
    } catch (error) {
      onFetchingRoles("Error  fetching departments");
    }
  };

  const fetchProjects = async () => {
    try {
      const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await fetch(`${API_BASE_URL}/allProjectsClients`, {
        method: "GET",
        headers: config.headers,
      });

      if (response.status === 401) {
        navigate("/");
      }

      const data = await response.json();
      setProjects(data.data);
    } catch (error) {
      onFetchingRoles("Error  fetching projects");
    }
  };

  const createUser = async () => {
    setLoading(true);

    const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios
      .post(
        `${API_BASE_URL}/register`,
        {
          firstName,
          lastName,
          email,
          contact,
          department: selelctedDepartment,
          role_id,
        },
        config
      )
      .then((response) => {
        if (response.status === 200) {
          onSuccessCreate(response.data.message);
        }

        if (response.status === 401) {
          navigate("/");
        }

        setLoading(false);
        setFirstName("");
        setLastName("");
        setEmail("");
        setcontact("");
        setRole("");
        setSelelctedDepartment("");
      })
      .catch((error) => {
        setLoading(false);

        onCreatingUser(error);
      });
  };

  const createUserClient = async () => {
    setLoadingClient(true);

    const token = sessionStorage.getItem("token"); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios
      .post(
        `${API_BASE_URL}/registerClient`,
        {
          firstName:firstNameClient,
          lastName:lastNameClient,
          email:emailClient,
          contact:contactClient,
          projectIds: selectedprojects,
          role_id:role_id_client,
        },
        config
      )
      .then((response) => {
        if (response.status === 200) {
          onSuccessCreate(response.data.message);
        }

        if (response.status === 401) {
          navigate("/");
        }

        setLoadingClient(false);
        setFirstNameClient("");
        setLastNameClient("");
        setEmailClient("");
        setcontactClient("");
        setRoleClient("");
        setSelectedProjects([]);

      })
      .catch((error) => {
        setLoadingClient(false);

        onCreatingUser(error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createUser();
  };

  const  handleSubmitClient = (e) => {
    e.preventDefault();
    createUserClient();
  };

  return (
    <div>
      <Toast ref={toast} />
      <div className="text-xl font-bold mb-4 text-center">
    <button
        className={`mr-4 px-4 py-2 rounded ${
            formType === 0 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
        } hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 transition-all duration-300 ease-in-out`}
        onClick={() => toggleFormType(0)}
    >
        Create User
    </button>

    <button
        className={`px-4 py-2 rounded ${
            formType === 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
        } hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 transition-all duration-300 ease-in-out`}
        onClick={() => toggleFormType(1)}
    >
        Create Client
    </button>
</div>


      <AnimatePresence>
        {formType === 0 && (
          <motion.div
            key="createUserForm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CreateUserForm
              handleSubmit={handleSubmit}
              setFirstName={setFirstName}
              setLastName={setLastName}
              setEmail={setEmail}
              setSelelctedDepartment={setSelelctedDepartment}
              setRole={setRole}
              hasWritePermissionCreateUser={hasWritePermissionCreateUser}
              loading={loading}
              roles={roles}
              role_id={role_id}
              departments={departments}
              firstName={firstName}
              lastName={lastName}
              email={email}
              contact={contact}
              setcontact={setcontact}
              selelctedDepartment={selelctedDepartment}
            />
          </motion.div>
        )}

        {formType === 1 && (
          <motion.div
            key="createClientForm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CreateClientForm
              handleSubmitClient={handleSubmitClient}
              setFirstNameClient={setFirstNameClient}
              setLastNameClient={setLastNameClient}
              setEmailClient={setEmailClient}
              setRolesClient={setRoleClient}
              hasWritePermissionCreateUser={hasWritePermissionCreateUser}
              loadingClient={loadingClient}
              rolesClient={rolesClient}
              role_id_client={role_id_client}
              projects={projects}
              firstNameClient={firstNameClient}
              lastNameClient={lastNameClient}
              emailClient={emailClient}
              contactClient={contactClient}
              setcontactClient={setcontactClient}
              setProjects={setSelectedProjects}
              selectedprojects={selectedprojects}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateUser;
