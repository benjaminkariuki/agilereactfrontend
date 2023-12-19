import React, { useState, useEffect, useRef } from "react";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";

const CreateClientForm = ({
  handleSubmitClient,
  setFirstNameClient,
  setLastNameClient,
  setEmailClient,
  setRolesClient,
  hasWritePermissionCreateUser,
  loadingClient,
  rolesClient,
  role_id_client,
  projects,
  firstNameClient,
  lastNameClient,
  emailClient,
  contactClient,
  setcontactClient,
  setProjects,
  selectedprojects,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProjects, setFilteredProjects] = useState(projects);

  const handleProjectSelection = (e) => {
    const selectedId = parseInt(e.target.value);
    if (e.target.checked) {
      setProjects([...selectedprojects, selectedId]);
    } else {
      setProjects(selectedprojects.filter((id) => id !== selectedId));
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filtered = projects.filter((project) =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProjects(filtered);
    }, 200); // 200 milliseconds delay for search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, projects]);

  return (
    <div
      className="w-full"
      style={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}
    >
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-sm mx-auto"
        onSubmit={handleSubmitClient}
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
            value={firstNameClient}
            onChange={(e) => setFirstNameClient(e.target.value)}
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
            value={lastNameClient}
            onChange={(e) => setLastNameClient(e.target.value)}
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
            value={emailClient}
            onChange={(e) => setEmailClient(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 texCt-sm font-bold mb-2"
            htmlFor="contacts"
          >
            Contacts
          </label>

          <PhoneInput
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            international
            defaultCountry="KE"
            value={contactClient}
            onChange={setcontactClient}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Projects
          </label>
          <input
            type="text"
            placeholder="Search projects"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
          />
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {filteredProjects.map((project, index) => (
              <div key={index} className="mb-2">
                <input
                  type="checkbox"
                  id={`project-${project.id}`}
                  value={project.id}
                  checked={selectedprojects.includes(project.id)}
                  onChange={handleProjectSelection}
                  className="mr-2 leading-tight"
                />
                <label
                  htmlFor={`project-${project.id}`}
                  className="text-gray-700 text-sm"
                >
                  {project.title}
                </label>
              </div>
            ))}
          </div>
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
            value={role_id_client}
            onChange={(e) => setRolesClient(e.target.value)}
            required
          >
            <option value="" disabled required>
              Select a role
            </option>

            {rolesClient.length > 0 &&
              rolesClient.map((role, index) => (
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
              disabled={loadingClient} // Disable button while loading
            >
              {loadingClient ? (
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

export default CreateClientForm;
