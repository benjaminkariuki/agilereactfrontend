import React, { useState, useEffect } from "react";

const CreateUser = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contacts, setContacts] = useState("");
  const [role_id, setRole] = useState("");
  const [roles, setRoles] = useState([]);
  const [errors, seterrors] = useState("");

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch("http://192.168.88.187:8000/api/allRoles");
      const data = await response.json();
      setRoles(data.roles);
    } catch (error) {
      console.log(error);
    }
  };

  const createUser = async () => {
    try {
      const response = await fetch("http://192.168.88.187:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          contacts,
          role_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create user.");
      } else {
        seterrors("created successfuly");
      }

      // Reset the form
      setFirstName("");
      setLastName("");
      setEmail("");
      setContacts("");
      setRole("");
    } catch (error) {
      console.log(error);
      seterrors(error);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    createUser();
    console.log(Error);
    console.log(errors);
  };

  return (
    <div className="w-full max-w-sm mx-auto pt-10">
      <h2 className="text-center text-xl font-bold mb-4 text-blue-800">
        Create an Account for an AgilePM user
      </h2>

      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
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
          />
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
            value={role_id.id}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="" disabled>
              Select a role
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Create Account
          </button>
        </div>
      </form>
      <div className="credits">
        Designed by{" "}
        <a
          href="https://agilebiz.co.ke/"
          rel="noopener noreferrer"
          target="_blank"
        >
          Agile Business Solutions
        </a>
      </div>
    </div>
  );
};

export default CreateUser;
