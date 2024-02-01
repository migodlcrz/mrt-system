import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ManageFare from "./ManageFare";
import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../hooks/useAuthContext";
import MrtLogo from "./MrtLogo";
import { Modal } from "flowbite-react";

const Navbar = () => {
  const { logout } = useLogout();
  const { user } = useAuthContext();
  const { user_ } = user || {};
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const handleEditModal = () => {
    isEditModalOpen ? setEditModalOpen(false) : setEditModalOpen(true);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigate = useNavigate();

  const handleClick = () => {
    logout();
    navigate("/admin");
  };

  if (user) {
  }

  return (
    <nav className="bg-gray-900 fixed w-full h-20 z-10">
      <div className=" flex flex-wrap items-center justify-between mx-auto pt-4 px-2">
        <div>
          <MrtLogo />
        </div>
        {user && (
          <div className="flex md:order-2 space-x-3 md:space-x-3 rtl:space-x-reverse items-center">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 "
              aria-controls="navbar-sticky"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>
          </div>
        )}
        {user && (
          <div
            className={`items-center justify-between w-full lg:flex lg:w-auto lg:order-1 ${
              isMenuOpen ? "block" : "hidden"
            }`}
            id="navbar-sticky"
          >
            <div className="flex flex-col justify-end space-y-2 lg:space-y-0 p-4 lg:p-0 mt-4 font-medium rounded-lg lg:space-x-20 lg:flex-row lg:mt-0 lg:border-0 bg-gray-900">
              <NavLink
                to="/admin/dashboard/card"
                className="text-green-400 rounded  md:hover:text-green-700 w-full md:w-36"
                onClick={toggleMenu}
              >
                <div className="text-green-400 bg-gray-800 hover:bg-gray-700 focus:ring-4 font-medium rounded-lg text-sm px-4 py-2 text-center ">
                  Manage Card
                </div>
              </NavLink>

              <NavLink
                to="/admin/dashboard/station"
                className="text-green-400 rounded md:hover:text-green-700 w-full md:w-36 text-center"
                onClick={toggleMenu}
              >
                <div className="bg-gray-800 rounded-lg px-4 py-2 hover:bg-gray-700 text-sm">
                  Manage Stations
                </div>
              </NavLink>

              <div className="flex flex-row">
                <button
                  onClick={handleEditModal}
                  className="bg-gray-800 rounded-lg px-4 py-2 hover:bg-gray-700 text-green-400 w-full md:w-36 text-sm"
                >
                  Manage Fare
                </button>
              </div>
              <Modal
                show={isEditModalOpen}
                className="show:dark:bg-opacity-0 animate__animated animate__backInDown"
                onClose={() => {
                  setEditModalOpen(false);
                }}
              >
                <Modal.Header className="bg-gray-800">
                  <div className="text-green-400">Edit Fare</div>
                </Modal.Header>
                <Modal.Body className="bg-gray-800">
                  <ManageFare />
                </Modal.Body>
              </Modal>

              <div className="px-2 text-green-400 mt- pt-1 text-sm lg:text-md">
                Admin: {user_}
              </div>

              <button
                onClick={handleClick}
                type="button"
                className="text-green-400 bg-gray-800 hover:bg-gray-700 focus:ring-4 font-medium rounded-lg text-sm px-4 py-2 text-center "
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
