import React, { useState, useEffect } from "react";
// import { useDropzone } from "react-dropzone";
import { useSelector } from "react-redux";
// import { updateUser } from "../slices/userSlices";, useDispatch
import axios from "axios";

const EditProfile = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contacts, setConatcts] = useState("");

  const [password, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // const dispatch = useDispatch();
  useEffect(() => {});
  const {
    userId,
    baseUrl,
    userRole,
    userEmail,
    userFName,
    userLName,
    userProfilePhoto,
    userContacts,
  } = useSelector((state) => state.user);

  //DEALING WITH IMAGES
  const [profilephoto, setPhoto] = useState("");
  const [previewImage, setPreviewImage] = useState();
  console.log(isEditing);
  const handleFirstNameChange = (event) => {
    setFirstName(event.target.value);
  };

  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };
  const handleContactChange = (event) => {
    setConatcts(event.target.value);
  };
  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleProfilePic = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      // Store the file name separately
      setPhoto(file);
    }
  };

  // const handlePhotoUpload = (acceptedFiles) => {
  //   const file = acceptedFiles[0];
  //   const reader = new FileReader();

  //   reader.onload = () => {
  //     const uploadedPhoto = reader.result;
  //     setPhoto(uploadedPhoto);
  //   };

  //   if (file) {
  //     reader.readAsDataURL(file);
  //   }
  // };

  // const { getRootProps, getInputProps } = useDropzone({
  //   accept: "image/*",
  //   multiple: false,
  //   onDrop: handlePhotoUpload,
  // });
  console.log(userProfilePhoto);

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("profile_pic", profilephoto);

    // setIsPending(true);

    axios
      .post(`http://192.168.88.187:8000/api/updateUsers/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        const { user } = response.data;
        // const userDetails = {
        //   id: user.id,
        //   email: user.email,
        //   firstName: user.firstName,
        //   lastName: user.lastName,
        //   profilePic: user.profile_pic,
        // };
        // setError("");
        // setSuccess("Update Successful.");
        // setIsPending(false);
        // dispatch(login(userDetails));
        console.log(user);
        console.log(response.data.message);
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 422) {
            // setError("Update Failed!");
            console.log(error.response.data);
          } else {
            // setError("An error occurred. Please try again.");
            console.log(error.response.message);
          }
        } else {
          // setError("An error occurred. Please try again.");
          console.log("network");
        }
      })
      .finally(() => {
        setIsEditing(!isEditing);
      });
  };

  //CHANGING THE PASSWORD
  const handleTogglePasswordModal = () => {
    setShowPasswordModal(!showPasswordModal);
  };
  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
  };

  const handlePasswordSave = () => {
    // Save the new password
    axios
      .post(`http://192.168.88.187:8000/api/changepassword/${userId}`, {
        password: password,
      })
      .then((response) => {
        // Password change successful
        setShowPasswordModal(false);
        console.log("Password changed successfully");
      })
      .catch((error) => {
        // Error occurred while changing password
        console.error("Error changing password:", error);
      });
  };

  const handleClose = () => {
    setIsEditing(!isEditing);
    setFirstName("");
    setLastName("");
    setConatcts("");
    setEmail("");
    // Reset the form and close the edit profile window
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
                defaultValue={userFName}
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
                defaultValue={userLName}
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
                defaultValue={userEmail}
                value={email}
                onChange={handleEmailChange}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="email"
              >
                Contacts
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                defaultValue={userContacts}
                value={contacts}
                onChange={handleContactChange}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="photo"
              >
                Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePic}
                name="profile_pic"
              />
              {previewImage && <img src={previewImage} alt="Profile" />}
            </div>
            <div className="flex justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={handleSubmit}
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
                <img
                  src={
                    userProfilePhoto
                      ? baseUrl + userProfilePhoto
                      : process.env.PUBLIC_URL + "/profile2.jpeg"
                  }
                  alt="User"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="email"
              >
                Email:
              </label>
              <span className="text-gray-700">{userEmail}</span>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="fullName"
              >
                Full Name:
              </label>
              <span className="text-gray-700">
                {userFName} {userLName}
              </span>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="fullName"
              >
                Contacts:
              </label>
              <span className="text-gray-700">{userContacts}</span>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="fullName"
              >
                Role:
              </label>
              <span className="text-gray-700">{userRole}</span>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="fullName"
              >
                Acting Role:
              </label>
              <span className="text-gray-700">{}</span>
            </div>

            <div className="flex justify-between mt-4">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={handleEdit}
              >
                Edit details
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={handleTogglePasswordModal}
              >
                Change Password
              </button>
            </div>
          </div>
        )}
      </div>
      {showPasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="bg-white p-4 shadow-lg rounded-lg z-10">
            <h2 className="text-lg font-bold mb-4">Change Password</h2>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="newPassword"
              >
                New Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="newPassword"
                type="password"
                value={password}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="confirmPassword"
              >
                Confirm New Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
              />
            </div>
            <div className="flex justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={handlePasswordSave}
              >
                Save
              </button>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={handleTogglePasswordModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
