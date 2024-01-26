import React from "react";
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
import { BarChart } from "@mui/x-charts/BarChart";

const Dashboard = () => {
  const { logout } = useLogout();
  const navigate = useNavigate();

  // const uData = [1000, 3000];
  // const xLabels = [
  //   "Page A",
  //   "Page B",
  //   "Page C",
  //   "Page D",
  //   "Page E",
  //   "Page F",
  //   "Page G",
  // ];

  const handleClick = () => {
    logout();
    navigate("/admin");
  };

  const chartSetting = {
    xAxis: [
      {
        label: "rainfall (mm)",
      },
    ],
    width: 500,
    height: 400,
  };

  const dataset = [
    {
      london: 59,
      paris: 57,
      newYork: 86,
      seoul: 21,
      month: "Jan",
    },
    {
      london: 50,
      paris: 52,
      newYork: 78,
      seoul: 28,
      month: "Fev",
    },
    {
      london: 47,
      paris: 53,
      newYork: 106,
      seoul: 41,
      month: "Mar",
    },
    {
      london: 54,
      paris: 56,
      newYork: 92,
      seoul: 73,
      month: "Apr",
    },
    {
      london: 57,
      paris: 69,
      newYork: 92,
      seoul: 99,
      month: "May",
    },
    {
      london: 60,
      paris: 63,
      newYork: 103,
      seoul: 144,
      month: "June",
    },
    {
      london: 59,
      paris: 60,
      newYork: 105,
      seoul: 319,
      month: "July",
    },
    {
      london: 65,
      paris: 60,
      newYork: 106,
      seoul: 249,
      month: "Aug",
    },
    {
      london: 51,
      paris: 51,
      newYork: 95,
      seoul: 131,
      month: "Sept",
    },
    {
      london: 60,
      paris: 65,
      newYork: 97,
      seoul: 55,
      month: "Oct",
    },
    {
      london: 67,
      paris: 64,
      newYork: 76,
      seoul: 48,
      month: "Nov",
    },
    {
      london: 61,
      paris: 70,
      newYork: 103,
      seoul: 25,
      month: "Dec",
    },
  ];

  const valueFormatter = (value: number) => `${value}mm`;
  return (
    <div className="h-screen w-full bg-gray-800">
      <div className="text-white min-h-screen bg-gray-800">
        {/* upper right panel */}
        <div className="flex flex-col lg:flex-row items-center min-h-full justify-center space-y-2 lg:space-y-0 pt-24 pb-6">
          <div className="flex justify-center w-full h-full">
            <div className="flex flex-col w-full h-full space-y-2">
              <div className="flex h-full items-center justify-center bg-gray-700 mr-2 mx-2 rounded-lg">
                <div className="text-2xl font-bold py-4">
                  Admin:<span className="text-green-400"> migo@gmail.com</span>
                </div>
              </div>
              <div className="flex flex-row">
                <div className="flex flex-col h-full w-1/4 items-start justify-start bg-gray-700 mr-2 mx-2 rounded-lg p-4 space-y-4 font-bold pb-20">
                  <div className="">
                    Cards: <span className="text-green-400">10</span>
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
                <div className="flex flex-row h-full items-start justify-start bg-gray-700 mr-2 mx-2 rounded-lg w-full p-2">
                  {/* <div>
                    <BarChart
                      xAxis={[
                        {
                          scaleType: "band",
                          data: ["Card", "Station"],
                        },
                      ]}
                      series={[{ data: [4, 3] }]}
                      width={250}
                      height={300}
                    />
                  </div> */}
                  <div className="flex w-full justify-center items-center">
                    <BarChart
                      dataset={dataset}
                      yAxis={[{ scaleType: "band", dataKey: "month" }]}
                      series={[
                        {
                          dataKey: "seoul",
                          label: "Seoul rainfall",
                          valueFormatter,
                        },
                      ]}
                      layout="horizontal"
                      {...chartSetting}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full h-full">
            <div className="flex h-80 items-center justify-center bg-gray-700 mr-2 mx-2 p-2 rounded-lg">
              <MapContainer
                // center={[14.6004, 121.0357]}
                className="rounded-lg "
                center={[14.65216, 121.03225]}
                zoom={12}
                zoomControl={false}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[14.65216, 121.03225]}>
                  <Popup>NORTH AVENUE STATION</Popup>
                </Marker>
                <Marker position={[14.64226, 121.03879]}>
                  <Popup>QUEZON AVENUE STATION</Popup>
                </Marker>
                {/* <Polyline
                  pathOptions={{ color: "red" }}
                  positions={polylineCoordinates}
                /> */}
              </MapContainer>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center h-full justify-center space-y-2 lg:space-x-4 lg:space-y-0 overflow-y-auto py-4 px-2 border-t-8 border-gray-700">
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
