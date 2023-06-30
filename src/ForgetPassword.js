import { useState } from "react";
import { Link } from "react-router-dom";

const ForgotPass = () => {
  const [email, setEmail] = useState("");
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Perform login logic here
    console.log("Email:", email);
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
                  onChange={handleEmailChange}
                  required
                  className="form-control"
                  id="username"
                />
              </div>
            </div>

            <div className="form-group">
              <button type="submit">Submit</button>
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
