import React, { useEffect, useState } from "react";
// import Leaflet from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
interface CardScanProps {
  stationName: string;
  stationStatus: string;
  // station_id: number;
}

interface Station {
  uid: number;
  name: string;
  long: number;
  lat: number;
}

// const polylineCoordinates = [
//   [Leaflet.latLng(14.65216, 121.03225), Leaflet.latLng(14.64226, 121.03879)],
// ];

const CardScan: React.FC<CardScanProps> = ({ stationName, stationStatus }) => {
  const fontColor =
    stationStatus === "IN"
      ? "text-green-500"
      : stationStatus === "OUT"
      ? "text-red-500"
      : "text-gray-300";

  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStation = async () => {
    const response = await fetch("/api/stations/tap/65b1292412353bda9d57770f");
    const json = await response.json();

    if (response.ok) {
      setStation(json);
    }

    if (!response.ok) {
      throw new Error("Failed to load data from API");
    }
  };

  useEffect(() => {
    fetchStation();
  }, []);

  console.log("LAT", station?.lat);
  console.log("LONG", station?.long);

  return (
    <div className="h-screen flex flex-col lg:flex-row">
      {/* left half - Form */}
      <div
        className={`py-10 px-20 flex flex-col justify-center items-center lg:w-1/2 lg:h-full border border-gray-300 shadow-md text-blue-400 bg-gray-800`}
      >
        <div className="flex items-center mb-2">
          <label className="block text-1xl font-bold lg:text-3xl lg:font-bold text-gray-100">
            ENTER BEEP ID :
          </label>
          <label
            className={`block text-1xl font-bold lg:text-4xl lg:font-black ${fontColor} ml-2`}
          >
            {stationStatus}
          </label>
        </div>
        <input
          type="text"
          id="large-input"
          className="block p-1 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 max-w-120 lg:w-80 lg:p-4"
        />
        <label
          htmlFor="station-label"
          className={`block text-2xl font-bold lg:text-4xl lg:font-black text-blue-400 mt-2 lg:mr-0`}
        >
          {stationName}
        </label>
      </div>

      {/* right half - Map */}
      <MapContainer
        className="h-1/2 w-full lg:w-1/2 lg:h-full"
        // center={[14.6004, 121.0357]}
        center={[Number(station?.long), Number(station?.lat)]}
        zoom={15}
        zoomControl={false}
        dragging={false}
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
        {/* <Marker position={[14.64226, 121.03879]}>
          <Popup>QUEZON AVENUE STATION</Popup>
        </Marker> */}
        {/* <Polyline
          pathOptions={{ color: "red" }}
          positions={polylineCoordinates}
        /> */}
      </MapContainer>
    </div>
  );
};

export default CardScan;
