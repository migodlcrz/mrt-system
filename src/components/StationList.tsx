import React, { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { stat } from "fs";
import { FaSearch } from "react-icons/fa";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
} from "react-leaflet";
import { DivIcon } from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { FaTrainSubway } from "react-icons/fa6";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

interface Station {
  _id: string;
  name: string;
  long: number;
  lat: number;
  connection: [string];
}

const StationList = () => {
  const [stations, setStations] = useState<Station[] | null>(null);
  const api = process.env.REACT_APP_API_KEY;

  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const StationIcon = new DivIcon({
    className: "custom-icon",
    html: renderToStaticMarkup(<FaTrainSubway size={30} color="black" />),
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });

  const handleStationClick = (station: Station) => {
    setSearchTerm(station.name);
  };

  const fetchStations = async () => {
    const response = await fetch(`${api}/api/stations`, {});
    const json = await response.json();

    if (response.ok) {
      setStations(json);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  return (
    <div className="flex flex-row bg-[#dbe7c9] h-screen w-auto animate__animated animate__fadeIn">
      <div
        className="bg-[#dbe7c9] h-screen w-full lg:w-1/2 overflow-y-auto max-h-full"
        style={{ scrollbarColor: "#dbe7c9 #0d9276", scrollbarWidth: "thin" }}
      >
        <div className="flex flex-row h-20 w-full bg-[#0d9276] items-center rounded-b-lg shadow-lg shadow-black justify-center sticky top-0">
          <button
            className="px-4 text-[#dbe7c9] text-2xl"
            onClick={() => {
              navigate("/");
            }}
          >
            <IoMdArrowRoundBack />
          </button>
          <input
            type="text"
            className="w-full rounded-lg shadow-inner shadow-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="mx-4 px-2 rounded-lg shadow-lg shadow-black bg-[#dbe7c9]"
            onClick={() => setSearchTerm("")}
          >
            clear
          </button>
        </div>
        {stations &&
          stations
            .filter((station: Station) =>
              station.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((station: Station, index) => {
              return (
                <div
                  key={index}
                  className="flex w-full justify-center items-center flex-col py-10 px-10"
                >
                  <div className="flex flex-col bg-[#0d9276] w-full text-center h-80 rounded-lg shadow-lg shadow-black">
                    <div className="text-[#dbe7c9] font-bold w-full h-1/2 pt-20 text-4xl">
                      {station.name}
                    </div>
                    <div className="flex flex-row h-1/2 text-[#0d9276] font-bold pt-10">
                      <div className="w-1/2">
                        <button
                          className="bg-[#dbe7c9] shadow-lg shadow-black rounded-lg px-2"
                          onClick={() =>
                            window.open(`/station/${station.name}/in`)
                          }
                        >
                          Tap in
                        </button>
                      </div>
                      <div className="w-1/2">
                        <button
                          className="bg-[#dbe7c9] shadow-lg shadow-black rounded-lg px-2"
                          onClick={() =>
                            window.open(`/station/${station.name}/out`)
                          }
                        >
                          Tap Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
      <MapContainer
        className="h-1/2 w-full lg:w-1/2 lg:h-full hidden lg:block"
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
          stations.map((station: Station) => (
            <div key={station._id}>
              <Marker
                position={[station.lat, station.long]}
                icon={StationIcon}
                eventHandlers={{
                  click: () => handleStationClick(station),
                }}
              >
                <Tooltip permanent>
                  <div className="text-[#0d9276] font-bold">{station.name}</div>
                </Tooltip>
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
  );
};

export default StationList;
