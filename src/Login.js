import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { login } from "./slices/userSlices";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";
import { Toast } from "primereact/toast";

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toast = useRef(null);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateInputs()) {
      return;
    }

    setIsPending(true);

    try {
      const response = await axios.post(
        "https://agile-pm.agilebiz.co.ke/api/login",
        {
          email,
          password,
        }
      );

      const loguser = response.data.user;
      dispatch(login(loguser));
      setIsPending(false);
      
      sessionStorage.setItem('token', response.data.user.token);
     
      
      sessionStorage.setItem("user", JSON.stringify(loguser));
      onLoginSuccess(response.data.message);
    
        navigate("/dashboard/home");
    
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          onLoginError(error.response.data.message);
        }
      }
      // onLoginError(error.message);

      setIsPending(false);
    }
  };

  const validateInputs = () => {
    const inputErrors = {};

    if (!isValidEmail(email)) {
      inputErrors.email = "Email is not in a valid format.";
    }

    if (password.length < 6) {
      inputErrors.password = "Password should be at least 6 characters long.";
    }

    setErrors(inputErrors);

    return Object.keys(inputErrors).length === 0;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const requireDomain = "@agilebiz.co.ke";

    if (!emailRegex.test(email) && !email.includes(requireDomain)) {
      return false;
    }
    return true;
  };

  const onLoginSuccess = (message) => {
    toast.current.show({
      severity: "success",
      summary: "Successful",
      detail: message,
      life: 1000,
    });
  };

  const onLoginError = (errorMessage) => {
    toast.current.show({
      severity: "error",
      summary: "Unsuccessful",
      detail: errorMessage,
      life: 3000,
    });
  };

  return (
    <div className="bg-blue-100 h-screen flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full min-w-[400px]">
        <Toast ref={toast} />
        <div className="text-center">
          <img
            src={process.env.PUBLIC_URL + "/logo192.png"}
            alt="Logo"
            className="mx-auto w-20"
          />
        </div>
        <h2 className="text-2xl font-semibold text-center mt-4">
          Login to Your Dashboard
        </h2>
        <p className="text-center text-gray-600 mt-2">
          Enter your Email and Password
        </p>

        <form className="mt-4" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              name="username"
              value={email}
              placeholder="firstname.secondname@agilebiz.co.ke"
              onChange={handleEmailChange}
              required
              className={`mt-1 p-2 w-full border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded focus:outline-none focus:border-blue-500`}
              id="username"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={handlePasswordChange}
                className="mt-1 p-2 w-full border rounded focus:outline-none focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600"
              >
                {showPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
              </button>
            </div>
          </div>
          <div className="mb-4">
            <button
              type="submit"
              className={`w-full bg-blue-500 text-white font-semibold p-2 rounded ${
                isPending
                  ? "opacity-75 cursor-not-allowed"
                  : "hover:bg-blue-600"
              }`}
              disabled={isPending}
            >
              {isPending ? (
              <i
                className="pi pi-spin pi-spinner"
                style={{ fontSize: "1.5rem" }}
              ></i>
            ) : "Login"}
            </button>
          </div>
          <div className="text-center">
            <p>
              <Link className="text-blue-500" to="/forgetpassword">
                Forgot Password?
              </Link>
            </p>
          </div>
        </form>
        <footer className="mt-4 text-center text-gray-500 text-sm">
          Designed by{" "}
          <a
            href="https://agilebiz.co.ke/"
            rel="noopener noreferrer"
            target="_blank"
            className="text-blue-500"
          >
            Agile Business Solutions
          </a>
        </footer>
      </div>
    </div>
  );
};

export default LoginForm;
