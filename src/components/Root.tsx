import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardCard from "./DashboardCard";
import { useLogout } from "../hooks/useLogout";

const Root = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full bg-gray-800">
      <div className="text-white h-screen bg-gray">
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="flex flex-col w-full justify-center items-center h-screen mt-56 lg:mt-24">
            <div className="font-bold text-green-400 text-2xl">
              WELCOME TO GLOBALTEK RAILS
            </div>
            <div className="flex flex-col lg:flex-row w-full h-full">
              <button
                onClick={() => {
                  navigate("/station/test/test");
                }}
                className="flex w-full lg:h-full hover:bg-gray-900 bg-gray-800 justify-center items-center hover:text-gray-300 font-bold"
              >
                <div className="text-2xl">TRY TAP IN AND TAP OUT</div>
              </button>
              <button
                onClick={() => {
                  navigate("/admin");
                }}
                className="flex w-full lg:h-full hover:bg-gray-900 bg-gray-800 justify-center items-center hover:text-gray-300 font-bold"
              >
                <div className="flex w-full lg:h-full hover:bg-gray-900 bg-gray-800 justify-center items-center hover:text-gray-300 font-bold">
                  <div className="text-2xl">MANAGE STATIONS</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="text-white h-96 bg-gray-800 lg:hidden"></div>
    </div>
  );
};

export default Root;
