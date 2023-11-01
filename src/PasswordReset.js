import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PasswordReset = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setconfirmPassword(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateInputs()) {
      return;
    }
    // Extract the token from the URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    // Send the password and token in the POST request to the backend API
    setIsPending(true);
    axios
      .post("https://agilepmtest.agilebiz.co.ke/api/reset_password", {
        password,
        token,
      })
      .then((response) => {
        setSuccessMessage(response.data.message);
        setErrorMessage("");
        navigate("/");
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 422) {
            setErrorMessage("Reset token has expired.");
          } else if (error.response.status === 404) {
            setErrorMessage("Invalid reset token.");
          }
        } else if (error.request) {
          // Network error
          setErrorMessage("Network error occurred. Please try again.");
        } else {
          // Other errors
          setErrorMessage("An error occurred. Please try again.");
        }
      })
      .finally(() => {
        setIsPending(false);
      });
  };

  const validateInputs = () => {
    const inputErrors = {};
    // Clear previous errors
    setErrors({});

    if (password.length < 6) {
      inputErrors.password = "Password must be at least 6 characters long.";
    }

    if (password !== confirmPassword) {
      inputErrors.confirm = "Passwords do not match.";
    }

    setErrors(inputErrors);

    return Object.keys(inputErrors).length === 0;
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
            <h5 className="title_Login">Create New Password</h5>
            <p className="info_Login">Enter your new password</p>

            {successMessage && (
              <p className="text-green-500">{successMessage}</p>
            )}

            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          </div>

          <form className="the_form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="yourPassword" className="form_lable">
                Password
              </label>
              <div className="input_form">
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  className={`form-control ${errors.password ? "is-invalid" : ""}`}
                  id="username"
                />

                {errors.password && (
                  <div className="text-red-500">{errors.password}</div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label
                htmlFor="confrimYourPassword"
                className="form_label"
              >
                Confirm Password
              </label>
              <div className="input_form">
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className={`form-control ${
                    errors.confirm ? "is-invalid" : ""
                  }`}
                  id="yourPassword"
                  required
                />
                {errors.confirm && (
                  <div className="text-red-500">{errors.confirm}</div>
                )}
              </div>
            </div>
            <div className="form-group">
              <button type="submit" disabled={isPending}>
                {isPending ? "Submitting..." : "Submit"}
              </button>
            </div>
            <div className="form-group">
              <p>
                <Link className="login_link" to="/">
                  Back to login
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

export default PasswordReset;
