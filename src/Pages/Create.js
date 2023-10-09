import React, { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import axios from "axios";
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";



const CreateUser = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setcontact] = useState();
  const navigate = useNavigate();


  const [role_id, setRole] = useState("");
  const [selelctedDepartment, setSelelctedDepartment] = useState(""); // New department state
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const { userActivities } = useSelector((state) => state.user);

  const createActivity = userActivities.find(
    (activity) => activity.name === "Create-User"
  );
  const hasReadPermissionCreateUser =
  createActivity.pivot.permissions.includes("read");

  const hasWritePermissionCreateUser =
  createActivity.pivot.permissions.includes("write");

  const [departments] = useState([
    "Management",
    "Administration",
    "Web And Mobile",
    "Project Managers",
    "Business Central",
    "Infrastructure",
    "Implementation",
    "Finance",
    "Human Resource",
    "Sales and Marketing",
    "Sales",
  ]);

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
        severity: "warn",
        summary: "Error fetching roles",
        detail: `${error}`,
        life: 3000,
      });
    }
  };
 
  const onCreatingUserInfo = (error) => {
    if (error) {
      toast.current.show({
        severity: "info",
        summary: "Server Error",
        detail: `${error}`,
        life: 3000,
      });
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {

      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };

      const response = await fetch(
        "https://agile-pm.agilebiz.co.ke/api/allRoles",{
          method: 'GET',
          headers: config.headers 
        }
      );

      if (response.status === 401) {
        navigate('/');
      }

      const data = await response.json();
      setRoles(data.roles);
    } catch (error) {
      
      onFetchingRoles("Can't fetch roles, contact the admin");
    }
  };

  const createUser = async () => {
    setLoading(true);

    const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

    axios
      .post("https://agile-pm.agilebiz.co.ke/api/register", {
        firstName,
        lastName,
        email,
        contact,
        department: selelctedDepartment,
        role_id,
      },config)
      .then((response) => {
        if (response.status === 200) {
          onSuccessCreate(response.data.message);
        }

        if (response.status === 401) {
          navigate('/');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    createUser();
  };

  return (
    <div>
      <Toast ref={toast} />
      <h2 className="text-xl font-bold mb-4 text-center text-blue-500">
        Create an AgilePM user account
      </h2>
      <div
        className="w-full"
        style={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}
      >
        <form
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-sm mx-auto"
          onSubmit={handleSubmit}
        >
          {/* Form fields */}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="firstname"
            >
              First Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="firstname"
              type="text"
              placeholder="Enter first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="lastname"
            >
              Last Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="lastname"
              type="text"
              placeholder="Enter last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="contacts"
            >
              Contacts
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
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="department"
            >
              Department
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="department"
              value={selelctedDepartment}
              onChange={(e) => setSelelctedDepartment(e.target.value)}
              required
            >
              <option value="" disabled required>
                Select a department
              </option>
              {departments.map((department, index) => (
                <option key={index} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="roles"
            >
              Roles
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="roles"
              value={role_id}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="" disabled required>
                Select a role
              </option>
              {roles.map((role, index) => (
                <option key={index} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-center">
           
           {hasWritePermissionCreateUser && ( <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={loading} // Disable button while loading
            >
              {loading ? (
                <i
                  className="pi pi-spin pi-spinner"
                  style={{ fontSize: "2rem" }}
                ></i>
              ) : (
                "Create Account"
              )}
            </button>)}

          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
