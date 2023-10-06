import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { logout, updateUser } from "../slices/userSlices";
import { FiTrash2 } from "react-icons/fi";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { useNavigate } from "react-router-dom";
import _ from "lodash";
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';


const EditProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {});
  const {
    userId,
    userRole,
    userEmail,
    userFName,
    userLName,
    userDepartment,
    userProfilePhoto,
    userContacts,
  } = useSelector((state) => state.user);

  const baseUrl = "https://agile-pm.agilebiz.co.ke/storage/";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setNewPassword] = useState("");
  const [Oldpassword, setOldPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useRef(null);
  const [profile_pic, setPhoto] = useState("");
  const [previewImage, setPreviewImage] = useState();
  const [error, setError] = useState(null);
  const [contact, setcontact] = useState();

  const [isConfirmPasswordMismatch, setIsConfirmPasswordMismatch] =
    useState(false);

  const onSuccess = (success) => {
    if (success) {
      toast.current.show({
        severity: "success",
        summary: "Created successfully",
        detail: `Name: ${success}`,
        life: 3000,
      });
    }
  };

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

  const onError = (error) => {
    if (error) {
      toast.current.show({
        severity: "warn",
        summary: "Error creating user",
        detail: handleErrorMessage(error),
        life: 3000,
      });
    }
  };

  const confirmDelete = () => {
    confirmDialog({
      message: "Do you want to delete profile picture?",
      header: "Delete Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => handleDeletePhoto(),
    });
  };

  

  

  const handleFirstNameChange = (event) => {
    setFirstName(event.target.value);
  };

  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
  };

  

  const handleProfilePic = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      setPhoto(file);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("contacts", contact);
    formData.append("profile_pic", profile_pic);

    const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

    axios
      .post(
        `https://agile-pm.agilebiz.co.ke/api/updateUsers/${userId}`,
        formData,
        {
          headers: {
            ...config.headers,  // Include the headers from your config
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        setIsLoading(false);
        onSuccess(response.data.message);
        const { user } = response.data;
        dispatch(updateUser(user));
        // Update session storage with the new user data
        sessionStorage.setItem("user", JSON.stringify(user));
        setTimeout(() => {
          setIsLoading(false);
          setIsEditing(false);
          setFirstName("");
          setLastName("");
          setcontact("");
          setPreviewImage();
          setPhoto("");
          setcontact();
        }, 1000);
      })
      .catch((error) => {
        setIsLoading(false);
          onError(error);
        
        
      });
  };

  //CHANGING THE PASSWORD
  const handleTogglePasswordModal = () => {
    setNewPassword("");
    setConfirmPassword("");
    setOldPassword("");
    setError("");
    setIsConfirmPasswordMismatch(null);
    setShowPasswordModal(false);

  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
    setIsConfirmPasswordMismatch(false);
  };

  const handleOldPasswordChange = (e) => {
    setOldPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
    setIsConfirmPasswordMismatch(password !== event.target.value);
  };

  const handlePasswordSave = (e) => {
    e.preventDefault(); // Prevent default form submission

    if (password === confirmPassword) {
      setError(null);
      setIsLoading(true);
      // Save the new password

      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

      axios
        .post(`https://agile-pm.agilebiz.co.ke/api/changepassword/${userId}`, {
          password: password,
          previousPass:Oldpassword,
        },config)
        .then((response) => {
          onSuccess(response.data.message);
          setTimeout(() => {
            setNewPassword("");
            setConfirmPassword("");
            setIsLoading(false);
            setShowPasswordModal(false);
            dispatch(logout());
            navigate("/");
          }, 1000);
        })
        .catch((error) => {
          // Error occurred while changing password
          
          onError(error);
          setIsLoading(false);
        });
    } else setError("Passwords don't match");
  };

  const handleCloseEdit = () => {
    setIsEditing(!isEditing);
    setFirstName("");
    setLastName("");
    setcontact("");
    setPhoto("");
    setPreviewImage();
    setIsLoading(false);
  };

  //DELETING THE PROFILE pHOTO
  const handleDeletePhoto = () => {
    // Delete the photo

    const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

    axios
      .delete(`https://agile-pm.agilebiz.co.ke/api/deleteImage/${userId}`,config)
      .then((response) => {
        const { user } = response.data;
        dispatch(updateUser(user));
        // Update session storage with the new user data
        sessionStorage.setItem("user", JSON.stringify(user));
      })
      .catch((error) => {
      });
  };

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />
      <h2 className="text-xl font-bold mb-4 text-center text-blue-500">
        User account settings
      </h2>
      <div
        className="w-full"
        style={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}
      >
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="relative">
            <div className="mb-4 absolute top-0 right-0">
              <label
                className="block text-gray-700  font-bold mb-2"
                htmlFor="profile_pic"
              ></label>
              <div className="relative w-24 h-24 rounded-full overflow-hidden">
                <img
                  src={
                    userProfilePhoto
                      ? baseUrl + userProfilePhoto
                      : process.env.PUBLIC_URL + "/profile2.jpeg"
                  }
                  alt="User"
                  className="w-full h-full rounded-full object-cover"
                />
                <div>
                  {userProfilePhoto && (
                    <button
                      onClick={confirmDelete}
                      className="absolute bottom-0 right-0 bg-red-500 hover:bg-red-700 text-white font-bold p-2 rounded-full focus:outline-none focus:shadow-outline"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="mb-4 text-gray-700">
              <label
                className="block text-gray-700  font-bold mb-2"
                htmlFor="email"
              >
                <strong>Email:</strong>
              </label>
              <span className="text-gray-700">{userEmail}</span>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700  font-bold mb-2"
                htmlFor="fullName"
              >
                <strong> Full Name:</strong>
              </label>
              <span className="text-gray-700">
                {_.startCase(userFName)} {_.startCase(userLName)}
              </span>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700  font-bold mb-2"
                htmlFor="fullName"
              >
                <strong>Contacts:</strong>
              </label>
              <span className="text-gray-700">{userContacts}</span>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700  font-bold mb-2"
                htmlFor="fullName"
              >
                <strong>Role:</strong>
              </label>
              <span className="text-gray-700">{_.startCase(userRole)}</span>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700  font-bold mb-2"
                htmlFor="fullName"
              >
                Department:
              </label>

              <span className="text-gray-700">
                {_.startCase(userDepartment)}
              </span>
            </div>

            <div className="flex justify-between mt-4">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                Edit details
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
        {/*Edit profile deatils
      @param firstname
      @param lastname
      @contacts
      @photo      
      */}
        <Dialog
          header="Edit User"
          visible={isEditing}
          onHide={handleCloseEdit}
          style={{ width: "50vw" }}
        >
          <div className="p-fluid">
            <div className="mb-4">
              <label
                className="block text-gray-700 font-bold mb-2"
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
                placeholder={userFName}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700  font-bold mb-2"
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
                placeholder={userLName}
              />
            </div>

            <div className="mb-4">
              <div className="flex items-center">
                <label
                  className="block text-gray-700  font-bold mb-2 mr-2"
                  htmlFor="contact"
                >
                  Contacts:
                </label>

                <label
                  htmlFor="contact"
                  className="block text-sm font-medium mb-2"
                >
                  {userContacts}
                </label>
              </div>

              <PhoneInput
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                international
                defaultCountry="KE"
                value={contact}
                onChange={setcontact}
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 font-bold mb-2"
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <i
                    className="pi pi-spin pi-spinner"
                    style={{ fontSize: "1.4rem" }}
                  ></i>
                ) : (
                  "Save"
                )}
              </button>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={handleCloseEdit}
              >
                Close
              </button>
            </div>
          </div>
        </Dialog>
        {/*Edit password/change
      @param paswword
      @param confirm-passwpord
            
      */}

        <Dialog
          header="Change Password"
          visible={showPasswordModal}
          onHide={handleTogglePasswordModal}
        >
          <div>
            {error && <p className="text-red-500">{error}</p>}
            <form>
              <div className="mb-4">
                <label
                  className="block text-gray-700  font-bold mb-2"
                  htmlFor="old-password"
                >
                  Old Password
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="old-password"
                  type="password"
                  value={Oldpassword}
                  onChange={handleOldPasswordChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700  font-bold mb-2"
                  htmlFor="new-password"
                >
                  New Password
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700  font-bold mb-2"
                  htmlFor="confirmPassword"
                >
                  Confirm New Password
                </label>
                <input
                  className={`shadow appearance-none border ${
                    isConfirmPasswordMismatch ? "border-red-500" : ""
                  } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                />
              </div>
              <div className="flex justify-between">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={handlePasswordSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <i
                      className="pi pi-spin pi-spinner"
                      style={{ fontSize: "1.4rem" }}
                    ></i>
                  ) : (
                    "Save"
                  )}
                </button>
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={handleTogglePasswordModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default EditProfile;
