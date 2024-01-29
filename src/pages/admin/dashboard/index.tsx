import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import DashboardCard from "../../../components/DashboardCard";
import { useLogout } from "../../../hooks/useLogout";
import { useNavigate } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { BarChart } from "@mui/x-charts/BarChart";
import { useAuthContext } from "../../../hooks/useAuthContext";

interface Stations {
  _id: string;
  uid: number;
  name: string;
  lat: number;
  long: number;
}

const Dashboard = () => {
  const { user } = useAuthContext();
  const [cardCount, setCardCount] = useState(0);
  const [stations, setStations] = useState<Stations[] | null>(null);
  const { logout } = useLogout();
  const navigate = useNavigate();

  const fetchCards = async () => {
    const getResponse = await fetch(
      "https://mrt-server-shg0.onrender.com/api/cards",
      {
        headers: {
          Authorization: `Bearer ${user.jwt}`,
        },
      }
    );
    const json = await getResponse.json();
    setCardCount(json.length);
  };

  const fetchStations = async () => {
    const getResponse = await fetch(
      "https://mrt-server-shg0.onrender.com/api/stations",
      {
        headers: {
          Authorization: `Bearer ${user.jwt}`,
        },
      }
    );
    const json = await getResponse.json();

    if (getResponse.ok) {
      setStations(json);
    }
  };

  console.log("STATION", stations);

  const handleClick = () => {
    logout();
    navigate("/admin");
  };

  const chartSetting = {
    xAxis: [
      {
        label: "Cards",
      },
    ],
    width: 350,
    height: 150,
  };

  const cardDataset = [
    {
      cards: cardCount,
      count: "Cards",
    },
  ];

  const valueFormatter = (value: number) => `${value} cards`;

  useEffect(() => {
    fetchCards();
    fetchStations();
  }, []);

  // if (stations) {
  //   console.log(stations[1].lat);
  // }

  return (
    <div className="h-screen w-full bg-gray-800">
      <div className="text-white min-h-screen bg-gray-800">
        {/* upper right panel */}
        <div className="flex flex-col lg:flex-row items-center min-h-full justify-center space-y-2 lg:space-y-0 pt-28 pb-6">
          <div className="flex justify-center w-full h-full">
            <div className="flex flex-col w-full h-full space-y-2">
              <div className="flex h-full items-center justify-center bg-gray-700 mr-2 mx-2 rounded-lg">
                <div className="text-2xl font-bold py-4">
                  Admin:<span className="text-green-400"> migo@gmail.com</span>
                </div>
              </div>
              <div className="flex flex-col lg:flex-row space-y-2">
                <div className="flex flex-row lg:flex-col h-full lg:w-1/4 items-start justify-between bg-gray-700 mr-2 mx-2 rounded-lg p-4 space-y-4 font-bold pb-20">
                  <div>
                    <div className="text-green-400 text-2xl">Quick Info</div>
                  </div>
                  <div className="">
                    Cards: <span className="text-green-400">{cardCount}</span>
                  </div>
                  <div className="">
                    Stations: <span className="text-green-400">10</span>
                  </div>
                  <div className="">
                    Fare: <span className="text-green-400">10</span>
                  </div>
                  <div className="">
                    Minimum: <span className="text-green-400">10</span>
                  </div>
                </div>
                <div className="flex flex-row h-full bg-gray-700 mx-2 rounded-lg w-auto lg:w-full py-2">
                  <div className="flex flex-row w-1/2 justify-center items-center">
                    <BarChart
                      dataset={cardDataset}
                      yAxis={[{ scaleType: "band", dataKey: "count" }]}
                      series={[
                        {
                          dataKey: "cards",
                          label: "Cards",
                          valueFormatter,
                        },
                      ]}
                      layout="horizontal"
                      {...chartSetting}
                    />
                  </div>
                  <div className="flex w-1/2 text-green-400 font-bold">
                    STATION LIST
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full h-full">
            <div className="flex h-96 items-center justify-center bg-gray-700 mr-2 p-2 rounded-lg">
              <div className=""></div>
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
                  stations.map((station: Stations) => {
                    return (
                      <Marker
                        key={station._id}
                        position={[station.lat, station.long]}
                      >
                        <Popup>{station.name}</Popup>
                      </Marker>
                    );
                  })}
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
