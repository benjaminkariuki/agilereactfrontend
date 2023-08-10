import React from "react";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ page, requiredActivity }) => {
  const UnauthorizedComponent = () => {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-red-600 text-xl font-bold">
          You are not authorized to access this page.
        </h1>
      </div>
    );
  };
  const loggedInUser = useSelector((state) => state.user);
  const hasRequiredActivity = loggedInUser.userActivities.some(
    (activity) => activity.route === requiredActivity
  );

  return hasRequiredActivity ? page : <UnauthorizedComponent />;
};

export default ProtectedRoute;
