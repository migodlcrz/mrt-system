import React from "react";
import { NavLink } from "react-router-dom";

interface NotLoginProps {
  error: string;
  message: string;
}

const NotLogin: React.FC<NotLoginProps> = ({ error, message }) => {
  return (
    <div className="h-screen w-full bg-[#dbe7c9]">
      <div className="text-white">
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="flex flex-col justify-center items-center h-screen">
            <div className="flex flex-col text-center items-center space-y-2">
              <div className="text-2xl font-bold text-[#0d9276]">
                Error:{" "}
                <span className="text-2xl font-bold text-white">{error}</span>
              </div>
              <div className="text-xl font-medium">{message}</div>
              <NavLink
                to="/admin"
                className="bg-[#0d9276] px-4 py-2 rounded-lg text-xl font-bold text-[#dbe7c9] shadow-lg shadow-black w-auto"
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
