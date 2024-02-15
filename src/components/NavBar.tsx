import React, { useState, Dispatch, SetStateAction } from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ManageFare from "./ManageFare";
import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../hooks/useAuthContext";
import MrtLogo from "./MrtLogo";
import { Modal } from "flowbite-react";
import { FaTrainSubway } from "react-icons/fa6";
import {
  FiEdit,
  FiChevronDown,
  FiTrash,
  FiShare,
  FiPlusSquare,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { IconType } from "react-icons";
import { Dropdown } from "flowbite-react";
import { Button } from "flowbite-react";
import { RxHamburgerMenu } from "react-icons/rx";
import Switch from "react-switch";

const Navbar = () => {
  const { logout } = useLogout();
  const { user } = useAuthContext();
  const { user_ } = user || {};
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isToggle, setIsToggle] = useState(false);

  const handleClickToggle = () => {};

  const handleEditModal = () => {
    isEditModalOpen ? setEditModalOpen(false) : setEditModalOpen(true);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  if (user) {
  }

  return (
    <div className="flex flex-col bg-[#0d9276] fixed w-screen h-auto z-10 shadow-md shadow-black">
      <div className=" flex flex-row items-center justify-between w-full px-4 h-20">
        <div className="flex flex-row items-center justify-start">
          <div className="text-md lg:text-5xl mx-2 text-[#dbe7c9]">
            <FaTrainSubway />
          </div>
          <NavLink to="/admin/dashboard">
            <div className="text-md lg:text-4xl mx-2 font-black w-auto text-[#dbe7c9]">
              GLOBALTEK RAILS
            </div>
          </NavLink>
        </div>
        {user && (
          <div>
            <div>
              <div className="flex w-full justify-end text-[#dbe7c9] lg:hidden text-2xl">
                <button onClick={toggleMenu}>
                  <RxHamburgerMenu />
                </button>
              </div>
            </div>
            <div className="hidden lg:block">
              {" "}
              <div className="flex flex-row w-full justify-end mr-8 space-x-20 items-center">
                <NavLink to="/admin/dashboard/card">
                  <button className="text-[#dbe7c9] font-bold hidden lg:block">
                    Card
                  </button>
                </NavLink>
                <NavLink to="/admin/dashboard/station">
                  <button className="text-[#dbe7c9] font-bold hidden lg:block">
                    Stations
                  </button>
                </NavLink>
                <button
                  className="text-[#dbe7c9] font-bold hidden lg:block"
                  onClick={handleEditModal}
                >
                  Fare
                </button>
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
                <div className="text-[#dbe7c9] font-bold">
                  <Dropdown
                    className="animate__animated right-0 bg-[#dbe7c9] animate__fadeIn w-40 h-auto"
                    label={<FaTrainSubway />}
                    dismissOnClick={true}
                    inline
                  >
                    <Dropdown.Header className="text-[#0d9276]">
                      admin@gmail.com
                    </Dropdown.Header>
                    <Dropdown.Item
                      className="text-[#0d9276]"
                      onClick={() => navigate("/admin/dashboard")}
                    >
                      Dashboard
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="text-[#0d9276]"
                      onClick={() => setOpenModal(true)}
                    >
                      Sign out
                    </Dropdown.Item>
                    {/* <label className="m-2 bg-[#dbe7c9] ">
                      <Switch
                        onChange={() => {
                          setIsToggle(!isToggle);
                        }}
                        checked={isToggle}
                      />
                    </label>
                    <span>Maintenace</span> */}
                  </Dropdown>
                </div>
                <div>
                  <Modal
                    className="opacity-1"
                    show={openModal}
                    size={"md"}
                    onClose={() => setOpenModal(false)}
                  >
                    <Modal.Body>
                      <div className="space-y-6 p-6">
                        <p className="text-md font-bold leading-relaxed text-[#0d9276] w-full">
                          Are you sure you want to logout?
                        </p>
                      </div>
                    </Modal.Body>
                    <Modal.Footer>
                      <div className="flex flex-row w-full justify-between px-2">
                        <Button
                          className="bg-[#0d9276] shadow-lg shadow-black text-[#dbe7c9]"
                          onClick={() => {
                            setOpenModal(false);
                            handleLogout();
                          }}
                        >
                          Yes
                        </Button>
                        <Button
                          className="bg-[#0d9276] shadow-lg shadow-black text-[#dbe7c9]"
                          color="#0d9276"
                          onClick={() => setOpenModal(false)}
                        >
                          No
                        </Button>
                      </div>
                    </Modal.Footer>
                  </Modal>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div
        className={`h-auto bg-[#dbe7c9] p-4 ${isMenuOpen ? "block" : "hidden"}`}
      >
        <div className="flex flex-col w-full h-full">
          <NavLink
            to="/admin/dashboard/card"
            onClick={toggleMenu}
            className={"w-full text-center"}
          >
            <button className="text-[#0d9276] font-bold">Card</button>
          </NavLink>
          <NavLink
            to="/admin/dashboard/station"
            onClick={toggleMenu}
            className={"w-full text-center"}
          >
            <button className="text-[#0d9276] font-bold">Stations</button>
          </NavLink>
          <button
            className="text-[#0d9276] font-bold"
            onClick={handleEditModal}
          >
            Fare
          </button>
          <button
            className="text-[#0d9276] font-bold"
            onClick={() => setOpenModal(true)}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
