import React from "react";
import { useNavigate } from "react-router-dom";
import { useLogout } from "../hooks/useLogout";

const Root = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full bg-[#dbe7c9] animate__animated animate__fadeIn">
      <div className="text-white h-screen bg-gray">
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="flex flex-col w-full justify-start items-center h-screen mt-56 lg:mt-24">
            <div className="flex justify-center items-center text-center py-10 px-10 font-bold text-green-400 text-2xl lg:text-6xl">
              WELCOME TO GLOBALTEK RAILS
            </div>
            <div className="flex flex-col lg:flex-row w-full p-20 space-y-10 lg:space-y-0 lg:space-x-20">
              <button
                onClick={() => {
                  navigate("/station/");
                }}
                className="flex w-full py-10 rounded-lg shadow-lg shadow-black hover:shadow-inner hover:shadow-black bg-[#0d9276] justify-center items-center hover:text-gray-300 font-bold"
              >
                STATION USER END
              </button>
              <button
                onClick={() => {
                  navigate("/admin");
                }}
                className="flex w-full py-10 rounded-lg shadow-lg shadow-black hover:shadow-inner hover:shadow-black bg-[#0d9276] justify-center items-center hover:text-gray-300 font-bold"
              >
                MANAGE STATIONS
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
