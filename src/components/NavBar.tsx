import React, {
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
  ChangeEvent,
  FormEvent,
} from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ManageFare from "./ManageFare";
import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../hooks/useAuthContext";
import MrtLogo from "./MrtLogo";
import { Modal } from "flowbite-react";
import { FaTrainSubway } from "react-icons/fa6";
import { IoMdCloseCircle } from "react-icons/io";

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
import { toast } from "react-toastify";
import { error } from "console";

interface Fare {
  minimumAmount: number;
  perKM: number;
}

const Navbar = () => {
  const { logout } = useLogout();
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuthContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState<string>("station");
  const [formData, setFormData] = useState<Fare>({
    minimumAmount: 0,
    perKM: 0,
  });
  const [fare, setFare] = useState<Fare>({
    minimumAmount: 0,
    perKM: 0,
  });
  const api = process.env.REACT_APP_API_KEY;

  const fetchFareData = async () => {
    try {
      const fareId = "65c28317dd50fe2e56d242c9";
      const response = await fetch(`${api}/api/fr/${fareId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();

      console.log("MINIMUM:", responseData.minimumAmount);

      setFare({
        minimumAmount: responseData.minimumAmount,
        perKM: responseData.perKM,
      });
    } catch (error) {
      console.error("Error fetching fare data:", error);
    }
  };

  // const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [name]: parseFloat(value),
  //   }));
  // };

  // const handleSubmit = async (e: FormEvent) => {
  //   e.preventDefault();

  //   try {
  //     const fareId = "65c28317dd50fe2e56d242c9";
  //     const response = await fetch(`${api}/api/fr/${fareId}`, {
  //       method: "PATCH",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${user.jwt}`,
  //       },
  //       body: JSON.stringify(formData),
  //     });

  //     const json = await response.json();

  //     if (response.ok) {
  //       toast.success("Fare updated successfully!");
  //       console.log("DATA", json);

  //       const modal = document.getElementById(
  //         "fare"
  //       ) as HTMLDialogElement | null;
  //       modal?.close();
  //     }

  //     if (!response.ok) {
  //       toast.error("Server Error");
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //     }
  //   } catch (error) {
  //     toast.error("Error updating fare");
  //   }
  // };

  // const handleEditModal = () => {
  //   isEditModalOpen ? setEditModalOpen(false) : setEditModalOpen(true);
  // };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  useEffect(() => {
    fetchFareData();
  }, []);

  return (
    <div className="flex flex-col bg-[#0d9276] fixed w-screen h-auto z-10 shadow-md shadow-black">
      <div className=" flex flex-row items-center justify-between w-full px-4 h-20">
        <div className="flex flex-row items-center justify-start">
          <div
            className={`text-md lg:text-5xl mx-2 ${
              currentPage === "dashboard" ? "text-gray-700" : "text-[#dbe7c9]"
            }`}
          >
            <FaTrainSubway />
          </div>
          <NavLink to="/admin/dashboard">
            <button
              onClick={() => {
                setCurrentPage("dashboard");
              }}
              className={`text-md lg:text-4xl mx-2 font-black w-auto ${
                currentPage === "dashboard" ? "text-gray-700" : "text-[#dbe7c9]"
              }`}
            >
              GLOBALTEK RAILS
            </button>
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
                  <button
                    onClick={() => {
                      setCurrentPage("card");
                    }}
                    className={` font-bold hidden lg:block ${
                      currentPage === "card"
                        ? "text-gray-700"
                        : "text-[#dbe7c9]"
                    }`}
                  >
                    Card
                  </button>
                </NavLink>
                <NavLink to="/admin/dashboard/station">
                  <button
                    onClick={() => {
                      setCurrentPage("station");
                    }}
                    className={`text-[#dbe7c9] font-bold hidden lg:block ${
                      currentPage === "station"
                        ? "text-gray-700"
                        : "text-[#dbe7c9]"
                    }`}
                  >
                    Stations
                  </button>
                </NavLink>
                <button
                  className="bg-[#0d9276] text-[#dbe7c9] font-bold px-6 py-3 rounded outline-none focus:outline-none mr-1 mb-1"
                  type="button"
                  onClick={() => setShowModal(true)}
                >
                  Fare
                </button>
                {showModal ? (
                  <>
                    <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                      <div className="relative w-[500px] my-6 mx-auto max-w-3xl">
                        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-[#dbe7c9] outline-none focus:outline-none animate__animated animate__fadeInDown">
                          <div className="flex items-start justify-between p-5 border-b border-solid rounded-t ">
                            <h3 className="text-3xl font-bold text-[#0d9276]">
                              Fare
                            </h3>
                            <button
                              className="bg-transparent border-0 text-black float-right"
                              onClick={() => setShowModal(false)}
                            >
                              <span className=" opacity-7 h-6 w-6 text-2xl block py-0 rounded-full text-[#0d9276]">
                                <IoMdCloseCircle />
                              </span>
                            </button>
                          </div>
                          <div>
                            <ManageFare />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}

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
                      onClick={() => {
                        navigate("/admin/dashboard");
                        setCurrentPage("dashboard");
                      }}
                    >
                      Dashboard
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="text-[#0d9276]"
                      onClick={() => {
                        setOpenModal(true);
                      }}
                    >
                      Sign out
                    </Dropdown.Item>
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
                        <div className="text-md font-bold leading-relaxed text-[#0d9276] w-full">
                          Are you sure you want to logout?
                        </div>
                      </div>
                    </Modal.Body>
                    <Modal.Footer>
                      <div className="flex flex-row w-full justify-between px-2">
                        <Button
                          className="bg-[#0d9276] shadow-lg shadow-black text-[#dbe7c9]"
                          onClick={() => {
                            setOpenModal(false);
                            setIsMenuOpen(false);
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
            <button
              onClick={() => setCurrentPage("card")}
              className={`${
                currentPage === "card" ? "text-gray-700" : "text-[#0d9276]"
              } font-bold`}
            >
              Card
            </button>
          </NavLink>
          <NavLink
            to="/admin/dashboard/station"
            onClick={toggleMenu}
            className={"w-full text-center"}
          >
            <button
              onClick={() => setCurrentPage("station")}
              className={`${
                currentPage === "station" ? "text-gray-700" : "text-[#0d9276]"
              } font-bold`}
            >
              Stations
            </button>
          </NavLink>

          <button
            className="bg-[#dbe7c9] text-[#0d9276] font-bold px-6 rounded outline-none focus:outline-none mr-1 mb-1"
            type="button"
            onClick={() => {
              setShowModal(true);
            }}
          >
            Fare
          </button>
          {showModal ? (
            <>
              <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                <div className="relative w-[500px] my-6 mx-auto max-w-3xl">
                  <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-[#dbe7c9] outline-none focus:outline-none animate__animated animate__fadeInDown">
                    <div className="flex items-start justify-between p-5 border-b border-solid rounded-t ">
                      <h3 className="text-3xl font-bold text-[#0d9276]">
                        Fare
                      </h3>
                      <button
                        className="bg-transparent border-0 text-black float-right"
                        onClick={() => {
                          setShowModal(false);
                          setIsMenuOpen(!isMenuOpen);
                        }}
                      >
                        <span className="opacity-7 h-6 w-6  block py-0 rounded-full text-[#0d9276] text-xl">
                          <IoMdCloseCircle />
                        </span>
                      </button>
                    </div>
                    <div>
                      <ManageFare />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
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
