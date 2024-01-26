import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import DashboardCard from "./DashboardCard";
import { useLogout } from "../hooks/useLogout";

const Root = () => {
  return (
    <div className="h-screen w-full bg-gray-800">
      <div className="text-white h-screen bg-gray">
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="flex flex-col justify-center items-center h-screen mt-56 lg:mt-24">
            <div className="text-xl md:text-4xl font-black text-green-400 m-2">
              WELCOME TO DASHBOARD
            </div>
            <div className="flex h-full flex-col lg:flex-row space-y-5 lg:space-y-0 lg:space-x-20 m-2">
              <div className="flex flex-col space-y-5 w-max">
                <NavLink to="/admin">
                  <DashboardCard
                    title="Manage Database as Admin"
                    description={
                      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. "
                    }
                  />
                </NavLink>
              </div>
              <div className="flex flex-col space-y-5 w-max">
                <NavLink to="/station/northave/in">
                  <DashboardCard
                    title="Try out Stations"
                    description={
                      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. "
                    }
                  />
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="text-white h-96 bg-gray-800 lg:hidden"></div>
    </div>
  );
};

export default Root;
