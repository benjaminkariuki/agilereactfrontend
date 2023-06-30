import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../slices/userSlices";
import axios from "axios";

const EditProfile = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");
  const [role, setRole] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useDispatch();
  const {
    userId,
    userRole,
    userEmail,
    userFName,
    userLName,
    userProfilePhoto,
  } = useSelector((state) => state.user);

  useEffect(() => {
    // Set initial values from the user data obtained from session storage
    setFirstName(userFName);
    setLastName(userLName);
    setEmail(userEmail);
    setRole(userRole);
    setPhoto(userProfilePhoto);
  }, [userEmail, userFName, userLName, userRole, userProfilePhoto]);

  const handleFirstNameChange = (event) => {
    setFirstName(event.target.value);
  };

  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePhotoUpload = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = () => {
      const uploadedPhoto = reader.result;
      setPhoto(uploadedPhoto);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    multiple: false,
    onDrop: handlePhotoUpload,
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    const updatedUser = {
      id: userId,
      firstName,
      lastName,
      email,
      // password: password,
      role: userRole,
      profilephoto: photo,
    };

    axios
      .put(`http://192.168.88.188:8001/users/${userId}`, updatedUser)
      .then((response) => {
        // Dispatch the update user action
        dispatch(updateUser(response.data));

        // Reset the editing state
        setIsEditing(false);
      })
      .catch((error) => {
        console.log("Error updating user:", error);
      });
  };
  const handleClose = () => {
    // Reset the form and close the edit profile window
    setFirstName(userFName);
    setLastName(userLName);
    setEmail(userEmail);
    setPhoto(userProfilePhoto);
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto pt-10">
      <h2 className="text-center text-xl font-bold mb-4 text-blue-800">
        User Information
      </h2>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        {isEditing ? (
          <div className="">
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="firstName"
              >
                First Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="firstName"
                type="text"
                value={firstName}
                onChange={handleFirstNameChange}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="lastName"
              >
                Last Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="lastName"
                type="text"
                value={lastName}
                onChange={handleLastNameChange}
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
                value={email}
                onChange={handleEmailChange}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="photo"
              >
                Photo
              </label>
              <div
                {...getRootProps()}
                className="border-2 border-gray-300 rounded p-2 bg-gray-100 cursor-pointer"
              >
                <input {...getInputProps()} />
                <p className="text-gray-500 text-sm">
                  Drag and drop a photo here, or click to select a file
                </p>
              </div>
              {photo && <img src={photo} alt="Profile" />}
            </div>
            <div className="flex justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={handleSave}
              >
                Save
              </button>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={handleClose}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="profilePhoto"
              >
                Profile Photo
              </label>
              <div className="w-24 h-24 rounded-full overflow-hidden">
                {photo ? (
                  <img
                    src={photo}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={process.env.PUBLIC_URL + "/profile2.jpeg"}
                    alt="Default User"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <span className="text-gray-700">{email}</span>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="fullName"
              >
                Full Name
              </label>
              <span className="text-gray-700">
                {firstName} {lastName}
              </span>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="fullName"
              >
                Role
              </label>
              <span className="text-gray-700">{role}</span>
            </div>

            <div className="flex justify-center mt-4">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={handleEdit}
              >
                Edit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfile;
