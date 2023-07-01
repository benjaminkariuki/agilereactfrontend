import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createUser } from "../slices/userSlices";

const CreateUser = () => {
  const dispatch = useDispatch();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log(firstName, lastName, email, role);
    // Dispatch the createUser action with the user details
    dispatch(
      createUser({
        firstName,
        lastName,
        email,
        role,
        profilephoto: "/profile2.jpeg",
        password: "123456", // You can set the profile photo here or modify it as needed
      })
    );

    // Reset the form
    setFirstName("");
    setLastName("");
    setEmail("");
    setRole("");
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
            htmlFor="roles"
          >
            Roles
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="roles"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="" disabled>
              Select a role
            </option>
            <option value="COO">COO</option>
            <option value="Project Manager">Project Manager</option>
            <option value="Developer">Developer</option>
            <option value="Business Analyst">Business Analyst</option>
            <option value="Team Lead">Team Lead</option>
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
