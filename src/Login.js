import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "./slices/userSlices";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const { loggedIn } = useSelector((state) => state.user);
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  console.log(loggedIn);
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateInputs()) {
      return;
    }

    setIsPending(true);

    axios
      .get("http://192.168.1.106:8001/users")
      .then((response) => {
        const loguser = response.data.find(
          (loguser) => loguser.email === email && loguser.password === password
        );

        if (loguser != null) {
          dispatch(login(loguser));
          setIsPending(false);
          sessionStorage.setItem("user", JSON.stringify(loguser)); // Store user details in sessionStorage
          navigate("/dashboard/home");
          console.log("Successful");
          console.log(loggedIn);
        } else {
          setAuthError("Invalid email or password");
          setIsPending(false);
        }
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
    return emailRegex.test(email);
  };

  return (
    <div className="container">
      <div className="login-form">
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
            {authError && <p className="Cant_connect">{authError}</p>}
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
