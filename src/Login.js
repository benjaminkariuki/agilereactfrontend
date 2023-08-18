import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { login } from "./slices/userSlices";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { Toast } from "primereact/toast";

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const { loggedIn } = useSelector((state) => state.user);
  const toast = useRef(null);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };


  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateInputs()) {
      return;
    }

    setIsPending(true);

    axios
      .post("http://192.168.88.150:8000/api/login", {
        email,
        password,
      })
      .then((response) => {
        const loguser = response.data.user;
        dispatch(login(loguser));
        setIsPending(false);
        sessionStorage.setItem("user", JSON.stringify(loguser));
        console.log("Successful");
        onLoginSuccess(response.data.message);
        setTimeout(() => {
          navigate("/dashboard/home");
        }, 1000);
      })
      .catch((error) => {
        let errorMessage = "An error occurred. Please try again.";

        if (error.response) {
          if (error.response.status === 401) {
            errorMessage = "Invalid email or password";
          } else {
            errorMessage = "Request error";
          }
        } else {
          errorMessage = "Connection error";
        }

        setAuthError(errorMessage);
        onLoginError(authError);
        setIsPending(false);
      });
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

  const onLoginSuccess = (authError) => {
    toast.current.show({
      severity: "success",
      summary: "Successful",
      detail: `${authError}`,
      life: 1000,
    });
  };

  const onLoginError = (authError) => {
    toast.current.show({
      severity: "error",
      summary: "Unsuccessful",
      detail: `${authError}`,
      life: 3000,
    });
  };

  return (
    <div className="container">
      <div className="login-form">
        <Toast ref={toast} />
        <div className="logo-container">
          <img
            src={process.env.PUBLIC_URL + "/logo192.png"}
            alt="Logo"
            className="logo"
          />
        </div>
        <div className="Loginform">
          <div className="top_Loginform">
            <h5 className="title_Login">Login to Your Dashboard</h5>
            <p className="info_Login">Enter your username and password</p>
          </div>

          <form className="the_form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form_lable">
                Username
              </label>
              <div className="input_form">
                <input
                  type="email"
                  name="username"
                  value={email}
                  placeholder="firstname.secondname@agilebiz.co.ke"
                  onChange={handleEmailChange}
                  required
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  id="username"
                />
                {errors.email && <p className="Cant_connect">{errors.email}</p>}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form_lable">
                Password
              </label>
              <div className="input_form">
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={handlePasswordChange}
                  className={`form-control ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  id="yourPassword"
                  required
                />
                {errors.password && (
                  <p className="Cant_connect">{errors.password}</p>
                )}
              </div>
            </div>
            <div className="form-group">
              {!isPending && <button type="submit">Login</button>}
              {isPending && (
                <button disabled type="submit">
                  Logging in...
                </button>
              )}
            </div>
            <div className="form-group">
              <p>
                <Link className="login_link" to="/forgetpassword">
                  Forgot Password?
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
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

export default LoginForm;
