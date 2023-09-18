import React, { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import axios from "axios";

const CreateUser = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contacts, setContacts] = useState("");
  const [role_id, setRole] = useState("");
  const [selelctedDepartment, setSelelctedDepartment] = useState(""); // New department state
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  const [departments] = useState([
    "Portfolio Managers Department",
    "Web Department",
    "Business Central Department",
    "Infrastructure Department",
    "Business Analyst Department",
    "Implementation Department",
  ]);

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
    if (error) {
      toast.current.show({
        severity: "warn",
        summary: "Error creating user",
        detail: `${error}`,
        life: 3000,
      });
    }
  };

  const onFetchingRoles = (error) => {
    if (error) {
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
      const response = await fetch(
        "https://agile-pm.agilebiz.co.ke/api/allRoles"
      );
      const data = await response.json();
      setRoles(data.roles);
    } catch (error) {
      onFetchingRoles("Can't fetch roles, contact the admin");
    }
  };

  const createUser = async () => {
    setLoading(true);
    axios
      .post("https://agile-pm.agilebiz.co.ke/api/register", {
        firstName,
        lastName,
        email,
        contacts,
        department: selelctedDepartment,
        role_id,
      })
      .then((response) => {
        if (response.status === 200) {
          onSuccessCreate(response.data.message);
        }

        setLoading(false);
        setFirstName("");
        setLastName("");
        setEmail("");
        setContacts("");
        setRole("");
        setSelelctedDepartment("");
      })
      .catch((error) => {
        onCreatingUser("Error creating users");
        onCreatingUserInfo(error.message);
        setLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createUser();
  };

  return (
    <div>
      <Toast ref={toast} />
      <h2 className="text-3xl font-bold mb-4 text-center text-blue-800">
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
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="contacts"
              type="text"
              placeholder="Enter contacts"
              value={contacts}
              onChange={(e) => setContacts(e.target.value)}
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
            <button
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
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
