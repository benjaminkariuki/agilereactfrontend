import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ForgotPass = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const validateInputs = () => {
    const inputErrors = {};

    if (!isValidEmail(email)) {
      inputErrors.email = "Email is not in a valid format.";
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

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateInputs()) {
      return;
    }

    setIsSubmitting(true);

    axios
      .post("http://192.168.88.187:8000/api/pass_reset", {
        email,
      })
      .then((response) => {
        setSuccessMessage(response.data.message);
        setErrorMessage("");
      })
      .catch((error) => {
        setErrorMessage("Failed to reset password. Please try again.");
        setSuccessMessage("");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
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
            <h5 className="title_Login">Reset Password</h5>
            <p className="info_Login">
              Enter your email address to reset your password
            </p>
          </div>

          <form className="the_form" onSubmit={handleSubmit}>
            <div className="form-group">
              {successMessage && (
                <p className="text-green-500 mb-4">{successMessage}</p>
              )}
              {errorMessage && (
                <p className="text-red-500 mb-4">{errorMessage}</p>
              )}
              {errors.email && (
                <p className="text-red-500 mb-4">{errors.email}</p>
              )}

              <label htmlFor="email" className="form_lable">
                Email Address
              </label>
              <div className="input_form">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className="form-control"
                  id="email"
                />
              </div>
            </div>

            <div className="form-group">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Reset Password"}
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

export default ForgotPass;
