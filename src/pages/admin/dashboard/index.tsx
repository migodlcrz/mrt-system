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
import { FaCoins, FaAddressCard, FaPlus } from "react-icons/fa";
import { DivIcon } from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { GrStatusGoodSmall } from "react-icons/gr";
import ProgressBar from "@ramonak/react-progress-bar";
import Avatar from "react-avatar";

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
  const { user_, jwt } = user;
  const [cardCount, setCardCount] = useState(0);
  const [stations, setStations] = useState<Stations[] | null>(null);
  const [fare, setFare] = useState<Fare | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [onboardCount, setOnboardCount] = useState(0);
  const [offboardCount, setOffboardCount] = useState(0);
  const { logout } = useLogout();
  const navigate = useNavigate();
  const style = { "--value": 100 } as React.CSSProperties;
  const api = process.env.REACT_APP_API_KEY;

  const StationIcon = new DivIcon({
    className: "custom-icon",
    html: renderToStaticMarkup(<FaTrainSubway size={30} color="black" />),
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });

  const fetchFare = async () => {
    const fareId = "65c28317dd50fe2e56d242c9";
    const getResponse = await fetch(`${api}/api/fr/${fareId}`, {
      headers: {
        "Content-Type": "application/json",
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
      const onboardCount = json.filter(
        (card: { isTap: any }) => card.isTap
      ).length;
      const offboardCount = json.length - onboardCount;

      setOnboardCount(onboardCount);
      setOffboardCount(offboardCount);
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

  useEffect(() => {
    console.log("EMAIL", user);
    fetchCards();
    fetchStations();
    fetchFare();
  }, []);

  return (
    <div className="h-screen w-full bg-[#dbe7c9] animate__animated animate__fadeIn">
      <div className="text-white min-h-screen bg-[#dbe7c9]">
        {/* upper right panel */}
        <div className="flex flex-col lg:flex-row h-screen justify-center items-start space-y-2 lg:space-y-0 pt-[390px] lg:pt-24 pb-4 ">
          <div className="flex justify-start w-full h-full">
            <div className="flex flex-col w-full h-full space-y-4">
              <div className="flex h-full items-center justify-center bg-[#dbe7c9] shadow-lg shadow-black mr-2 mx-2 rounded-lg">
                <div className="flex flex-row w-full text-2xl text-[#0d9276] font-bold py-4">
                  <div className="px-4 w-full text-center">
                    <div>Welcome</div>
                    <div>
                      <span className="text-[#0d9276]">{user_}</span>
                    </div>
                    <div className="py-10">
                      <Avatar
                        googleId="118096717852922241760"
                        size="100"
                        round={true}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col bg-[#dbe7c9] px-4 rounded-md w-full">
                    <div className="flex flex-col justify-start items-center w-full py-2">
                      <label>Card</label>
                      <div className="flex flex-row w-full items-center space-x-4 mb-4">
                        <div className="text-[#0d9276]">
                          <GrStatusGoodSmall />
                        </div>
                        <div className="text-[#0d9276] text-xl font-bold">
                          Onboard
                        </div>
                      </div>
                      <div className="w-full">
                        <ProgressBar
                          completed={Math.round(
                            (onboardCount / (onboardCount + offboardCount)) *
                              100
                          )}
                          bgColor="#0d9276"
                          baseBgColor="#b3bdb6"
                          labelColor="#dbe7c9"
                          customLabel={onboardCount.toString()}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col justify-start items-center w-full py-2">
                      <div className="flex flex-row w-full items-center space-x-4 mb-4">
                        <div className="text-red-800">
                          <GrStatusGoodSmall />
                        </div>
                        <div className="text-[#0d9276] text-xl font-bold">
                          Offboard
                        </div>
                      </div>
                      <div className="w-full">
                        <ProgressBar
                          completed={Math.round(
                            (offboardCount / (onboardCount + offboardCount)) *
                              100
                          )}
                          bgColor="#0d9276"
                          baseBgColor="#b3bdb6"
                          labelColor="#dbe7c9"
                          customLabel={offboardCount.toString()}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col justify-start items-center w-full py-2">
                      <div className="flex flex-row w-full items-center space-x-4 mb-4">
                        <div className="flex flex-row items-center text-[#0d9276] font-bold">
                          <div>
                            <FaAddressCard />
                          </div>
                          <div className="ml-3 text-xl ">Total Cards</div>
                        </div>
                      </div>
                      <div className="w-full">
                        <ProgressBar
                          completed={100}
                          bgColor="#0d9276"
                          baseBgColor="#b3bdb6"
                          labelColor="#dbe7c9"
                          customLabel={(
                            onboardCount + offboardCount
                          ).toString()}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0">
                {/* QUICK INFO */}
                <div className="flex flex-col lg:w-1/3 items-start h-[305px] bg-[#dbe7c9] shadow-lg shadow-black mr-2 mx-2 rounded-lg p-4 lg:space-y-4 font-bold py-6">
                  <div className="flex items-center">
                    <div className="text-[#0d9276] text-xl">Summary:</div>
                  </div>
                  <div className="flex flex-col space-y-10 w-full">
                    <div className="flex flex-col lg:flex-row items-center text-green-400 justify-between w-full border-b-2 border-b-[#0d9276]">
                      <div className="hidden lg:block text-[#0d9276]">
                        Beep Cards:{" "}
                      </div>
                      <div className="lg:hidden">
                        <FaCreditCard />-{" "}
                      </div>
                      <span className="text-[#0d9276]">{cardCount}</span>
                    </div>
                    <div className="flex flex-col lg:flex-row items-center text-green-400 justify-between w-full border-b-2 border-b-[#0d9276]">
                      <div className="hidden lg:block text-[#0d9276]">
                        Stations:{" "}
                      </div>
                      <div className="lg:hidden">
                        <FaTrainSubway />-{" "}
                      </div>
                      <span className="text-[#0d9276]">
                        {" "}
                        {stations?.length}
                      </span>
                    </div>
                    <div className="flex flex-col lg:flex-row items-center text-green-400 justify-between w-full border-b-2 border-b-[#0d9276]">
                      <div className="hidden lg:block text-[#0d9276]">
                        Start Fare:
                      </div>
                      <div className="lg:hidden">
                        <FaCoins />-{" "}
                      </div>
                      <span className="text-[#0d9276]">
                        ₱{fare && fare.minimumAmount}
                      </span>
                    </div>
                    <div className="flex flex-col lg:flex-row items-center text-green-400 justify-between w-full border-b-2 border-b-[#0d9276]">
                      <div className="hidden lg:block text-[#0d9276]">
                        Fare/KM:{" "}
                      </div>
                      <div className="lg:hidden">
                        <FaMoneyBill />-{" "}
                      </div>
                      <span className="text-[#0d9276]">
                        ₱{fare && fare.perKM}
                      </span>
                    </div>
                  </div>
                </div>
                {/* STATION LIST */}
                <div className="flex flex-col lg:flex-row  bg-[#dbe7c9] shadow-lg h-[305px] shadow-black p-2 mx-2 rounded-lg w-auto lg:w-2/3 py-2 items-start">
                  <div className="flex items-start justify-start w-full text-[#0d9276] font-bold ">
                    <div className="px-2 w-full rounded-md">
                      <div className="text-[#0d9276] w-full text-center">
                        Stations
                      </div>
                      <input
                        type="text"
                        className="w-full rounded-lg text-black font-normal my-2 shadow-inner shadow-black"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                        }}
                      />
                      <div className="table-container w-auto shadow-lg shadow-black">
                        <div
                          style={{
                            maxHeight: "200px",
                            overflowY: "auto",
                            scrollbarColor: "#0d9276 #dbe7c9",
                            scrollbarWidth: "thin",
                          }}
                        >
                          <table className=" w-full bg-gray-500">
                            <thead className="bg-[#dbe7c9] sticky top-0 w-full shadow-md shadow-black">
                              <tr className="w-full">
                                <th className="py-2 px-4 sticky top-0 text-[#0d9276] w-full">
                                  Station Name
                                </th>
                              </tr>
                            </thead>
                            <tbody className="w-20 ">
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
                                            ? "bg-gray-400 shadow-inner shadow-black"
                                            : "bg-gray-300 shadow-lg shadow-black"
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

                  {/* <div className="flex w-full items-start justify-start lg:w-2/5 text-green-400 font-bold h-auto lg:h-80">
                    <div className="px-2 w-full rounded-md">
                      <div className="my-2 lg:my-0 text-[#0d9276]">
                        Cards Info:
                      </div>
                      <div className="flex flex-row lg:flex-col w-full justify-center items-center space-x-10 lg:space-y-6 lg:space-x-0 bg-[#dbe7c9] shadow-inner shadow-black rounded-lg mr-2 mt-2 py-4">
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
                  </div> */}

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
            <div className="flex items-center justify-center bg-[#dbe7c9] shadow-lg shadow-black mr-2 mx-2 rounded-lg">
              <div className="text-2xl font-bold py-4 text-[#0d9276]">
                Station Map
              </div>
            </div>
            <div className="flex h-custom-height-dash items-center justify-center bg-[#dbe7c9] shadow-lg shadow-black p-2 rounded-lg mx-2">
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
                        icon={StationIcon}
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
                              color="#0d9276"
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
      </div>
    </div>
  );
};

export default Dashboard;
