import React from "react";
import { NavLink } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { divIcon } from "leaflet";

const MrtLogo = () => {
  const { user } = useAuthContext();
  return (
    <div>
      {user ? (
        <NavLink
          to="/admin/dashboard"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <img src="/logo.png" className="h-8 md:h-12" alt="Flowbite Logo" />
          <span className="text-lg md:text-4xl font-black text-green-500 hidden lg:block">
            MRT ADMIN
          </span>
        </NavLink>
      ) : (
        <div className="flex flex-row space-x-2">
          <img src="/logo.png" className="h-8 md:h-10" alt="Flowbite Logo" />
          <span className="text-lg md:text-2xl font-black text-green-500">
            MRT ADMIN
          </span>
        </div>
      )}
    </div>
  );
};

export default MrtLogo;
