import React, { useState, useEffect, useRef } from "react";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";


const CreateUserForm = ({
    handleSubmit,
    setFirstName,
    setLastName,
    setEmail,
    setSelelctedDepartment,
    setRole,
    hasWritePermissionCreateUser,
    loading,
    roles,
    role_id,
    departments,
    firstName,
    lastName,
    email,
    contact,
    setcontact,
    selelctedDepartment,

}) => {

  return (
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
                <option key={index} value={department.name}>
                  {department.name}
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
            {hasWritePermissionCreateUser && (
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
            )}
          </div>
        </form>
      </div>
  );
};

export default CreateUserForm;