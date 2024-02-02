import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import DashboardCard from "../../../components/DashboardCard";
import { useLogout } from "../../../hooks/useLogout";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { FaCreditCard } from "react-icons/fa";
import { FaTrainSubway } from "react-icons/fa6";
import { FaMoneyBill } from "react-icons/fa";
import { FaCoins } from "react-icons/fa";

interface Stations {
  _id: string;
  name: string;
  lat: number;
  long: number;
  connection: string[];
}

interface Fare {
  _id: string;
  minimumAmount: number;
  perKM: number;
}

const Dashboard = () => {
  const { user } = useAuthContext();
  const [cardCount, setCardCount] = useState(0);
  const [stations, setStations] = useState<Stations[] | null>(null);
  const [fare, setFare] = useState<Fare[] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { logout } = useLogout();
  const navigate = useNavigate();
  // const [value, setValue] = useState(0);
  const style = { "--value": 100 } as React.CSSProperties;
  const api = process.env.REACT_APP_API_KEY;

  const fetchFare = async () => {
    const getResponse = await fetch(`${api}/api/fare`, {
      headers: {
        Authorization: `Bearer ${user.jwt}`,
      },
    });
    const json = await getResponse.json();
    if (getResponse.ok) {
      setFare(json);
    }
  };

  const fetchCards = async () => {
    const getResponse = await fetch(`${api}/api/cards`, {
      headers: {
        Authorization: `Bearer ${user.jwt}`,
      },
    });
    const json = await getResponse.json();

    if (getResponse.ok) {
      setCardCount(json.length);
    }
  };

  const fetchStations = async () => {
    const getResponse = await fetch(`${api}/api/stations`, {
      headers: {
        Authorization: `Bearer ${user.jwt}`,
      },
    });
    const json = await getResponse.json();

    if (getResponse.ok) {
      setStations(json);
    }
  };

  const handleClick = () => {
    logout();
    navigate("/admin");
  };

  const valueFormatter = (value: number) => `${value} cards`;

  useEffect(() => {
    fetchCards();
    fetchStations();
    fetchFare();
  }, []);

  return (
    <div className="h-screen w-full bg-gray-800 animate__animated animate__fadeIn">
      <div className="text-white min-h-screen bg-gray-800">
        {/* upper right panel */}
        <div className="flex flex-col lg:flex-row min-h-full justify-center items-start space-y-2 lg:space-y-0 pt-28 pb-4">
          <div className="flex justify-start w-full h-full">
            <div className="flex flex-col w-full h-full space-y-4">
              <div className="flex h-full items-center justify-center bg-gray-700 mr-2 mx-2 rounded-lg animate__animated animate__backInLeft">
                <div className="text-2xl font-bold py-4">
                  Admin:<span className="text-green-400"> migo@gmail.com</span>
                </div>
              </div>
              <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0">
                <div className="flex flex-row lg:flex-col h- lg:w-1/3 items-start  bg-gray-700 mr-2 mx-2 rounded-lg p-4 lg:space-y-4 font-bold py-6 animate__animated animate__backInLeft">
                  <div className="flex items-center">
                    <div className="text-green-400 text-md lg:text-2xl bg-gray-900 h-full p-2 text-center rounded-lg ">
                      Quick Info:
                    </div>
                  </div>
                  <div className="flex flex-col lg:flex-row items-center text-green-400 justify-between w-full border-b-2 border-b-white">
                    <div className="hidden lg:block text-white">
                      Beep Cards:{" "}
                    </div>
                    <div className="lg:hidden">
                      <FaCreditCard />-{" "}
                    </div>
                    <span className="text-green-400">{cardCount}</span>
                  </div>
                  <div className="flex flex-col lg:flex-row items-center text-green-400 justify-between w-full border-b-2 border-b-white">
                    <div className="hidden lg:block text-white">Stations: </div>
                    <div className="lg:hidden">
                      <FaTrainSubway />-{" "}
                    </div>
                    <span className="text-green-400"> {stations?.length}</span>
                  </div>
                  <div className="flex flex-col lg:flex-row items-center text-green-400 justify-between w-full border-b-2 border-b-white">
                    <div className="hidden lg:block text-white">
                      Minimum Fare:{" "}
                    </div>
                    <div className="lg:hidden">
                      <FaCoins />-{" "}
                    </div>
                    <span className="text-green-400">
                      ₱{fare && fare[0].minimumAmount}
                    </span>
                  </div>
                  <div className="flex flex-col lg:flex-row items-center text-green-400 justify-between w-full border-b-2 border-b-white">
                    <div className="hidden lg:block text-white">Fare/KM: </div>
                    <div className="lg:hidden">
                      <FaMoneyBill />-{" "}
                    </div>
                    <span className="text-green-400">
                      ₱{fare && fare[0].perKM}/km
                    </span>
                  </div>
                </div>
                <div className="flex flex-col lg:flex-row h-full bg-gray-700 mx-2 rounded-lg w-auto lg:w-2/3 py-2 items-center  animate__animated animate__backInLeft">
                  <div className="flex w-full items-start justify-start lg:w-3/5 text-green-400 font-bold h-80">
                    <div className="px-2 w-full rounded-md">
                      <div className="">Search:</div>
                      <input
                        type="text"
                        className="w-full rounded-lg text-black font-normal my-2"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                        }}
                      />
                      <div className="table-container w-auto">
                        <div
                          style={{
                            maxHeight: "235px",
                            overflowY: "auto",
                            scrollbarColor: "dark",
                          }}
                        >
                          <table className=" w-full bg-gray-500">
                            <thead className="bg-gray-800 sticky top-0 w-full">
                              <tr className="w-full">
                                <th className="py-2 px-4 sticky top-0 text-green-400 w-full">
                                  Station Name
                                </th>
                              </tr>
                            </thead>
                            <tbody className="w-20">
                              {stations &&
                                stations
                                  .filter((station: Stations) =>
                                    station.name
                                      .toLowerCase()
                                      .includes(searchTerm.toLowerCase())
                                  )
                                  .map((station: Stations, index) => {
                                    return (
                                      <tr
                                        key={station._id}
                                        className={
                                          index % 2 === 0
                                            ? "bg-gray-400"
                                            : "bg-gray-300"
                                        }
                                      >
                                        <td className="font-bold text-center text-black">
                                          {station.name}
                                        </td>
                                      </tr>
                                    );
                                  })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full items-start justify-start lg:w-2/5 text-green-400 font-bold h-80">
                    <div className="px-2 w-full rounded-md">
                      <div className="my-2 lg:my-0">Cards Info:</div>
                      <div className="flex flex-row lg:flex-col w-full justify-center items-center space-x-10 lg:space-y-6 lg:space-x-0 bg-gray-800 rounded-lg mr-2 mt-2 py-4">
                        <div className="flex flex-col text-center">
                          {" "}
                          <span className="font-bold">On deck</span>
                          <div
                            className="radial-progress text-green-400"
                            style={style}
                            role="progressbar"
                          >
                            {cardCount}%
                          </div>
                        </div>
                        <div className="flex flex-col text-center">
                          <span className="font-bold">Off deck</span>
                          <div
                            className="radial-progress text-green-400"
                            style={style}
                            role="progressbar"
                          >
                            {cardCount}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* <div className="flex flex-col w-2/5 mr-2 justify-start items-start">
                    <div>Card Data:</div>
                    <div className="flex flex-row lg:flex-col w-full justify-center items-center space-x-10 lg:space-y-6 lg:space-x-0 bg-gray-800 rounded-lg mr-2 py-4">
                      <div className="flex flex-col text-center">
                        {" "}
                        <span className="font-bold">Cards In</span>
                        <div
                          className="radial-progress text-green-400"
                          style={style}
                          role="progressbar"
                        >
                          {cardCount}%
                        </div>
                      </div>
                      <div className="flex flex-col text-center">
                        <span className="font-bold">Cards Out</span>
                        <div
                          className="radial-progress text-green-400"
                          style={style}
                          role="progressbar"
                        >
                          {cardCount}%
                        </div>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full min-h-full z-0 space-y-2 lg:space-y-4">
            <div className="flex h-full items-center justify-center bg-gray-700 mr-2 mx-2 rounded-lg animate__animated animate__backInRight">
              <div className="text-2xl font-bold py-4 text-green-400">
                Station Map
              </div>
            </div>
            <div className="flex h-custom-height-dash items-center justify-center bg-gray-700 p-2 rounded-lg mx-2 animate__animated animate__backInRight">
              <MapContainer
                center={[14.65216, 121.03225]}
                zoom={12}
                zoomControl={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {stations &&
                  stations.map((station: Stations) => (
                    <div key={station._id}>
                      <Marker
                        position={[station.lat, station.long]}
                        // icon={customIcon}
                      >
                        <Popup>{station.name}</Popup>
                      </Marker>

                      {station.connection.map((connectedId: string) => {
                        const connectedStation = stations.find(
                          (s) => s._id === connectedId
                        );
                        if (connectedStation) {
                          return (
                            <Polyline
                              key={`${station._id}-${connectedId}`}
                              positions={[
                                [station.lat, station.long],
                                [connectedStation.lat, connectedStation.long],
                              ]}
                            />
                          );
                        }
                        return null;
                      })}
                    </div>
                  ))}
              </MapContainer>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center h-full justify-center space-y-2 lg:space-y-0 lg:space-x-4 overflow-y-auto py-4 px-2 border-t-8 border-gray-700">
          <div>
            <NavLink to="/admin/dashboard/card">
              <DashboardCard
                title="Manage Cards"
                description={
                  "Administrators will be able to manage the user beep cards with ease. With built in create, update, and delete functionalities."
                }
              />
            </NavLink>
          </div>
          <div>
            <NavLink to="/admin/dashboard/station">
              <DashboardCard
                title="Manage Stations"
                description={
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. "
                }
              />
            </NavLink>
          </div>
          <div>
            {" "}
            <NavLink to="/admin/dashboard/about">
              <DashboardCard
                title="About"
                description={
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. "
                }
              />
            </NavLink>
          </div>
          <div>
            {" "}
            <button onClick={handleClick}>
              <DashboardCard
                title="Logout"
                description={
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. "
                }
              ></DashboardCard>
            </button>
          </div>
        </div>
      </div>
      {/* <div className="text-white h-96 bg-gray-800 lg:hidden"></div> */}
    </div>
  );
};

export default Dashboard;
