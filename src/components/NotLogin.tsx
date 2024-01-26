import React from "react";
import { NavLink } from "react-router-dom";

interface NotLoginProps {
  error: string;
  message: string;
}

const NotLogin: React.FC<NotLoginProps> = ({ error, message }) => {
  return (
    <div className="h-screen w-full bg-gray-800">
      <div className="text-white">
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="flex flex-col justify-center items-center h-screen">
            <div className="flex flex-col text-center items-center space-y-2">
              <div className="text-2xl font-bold text-red-800">
                Error:{" "}
                <span className="text-2xl font-bold text-white">{error}</span>
              </div>
              <div className="text-xl font-medium">{message}</div>
              <NavLink
                to="/admin"
                className="bg-gray-900 px-4 py-2 rounded-lg text-xl font-bold text-green-400 w-auto"
              >
                Ok
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotLogin;
