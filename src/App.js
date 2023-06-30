import React from "react";
import { Route, Routes } from "react-router-dom";
import LoginForm from "./Login";
import ForgotPass from "./ForgetPassword";
import PasswordReset from "./PasswordReset";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/forgetpassword" element={<ForgotPass />} />
        <Route path="/resetpassword" element={<PasswordReset />} />
      </Routes>
    </div>
  );
}

export default App;
