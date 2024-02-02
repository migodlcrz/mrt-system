import React, { useEffect, useState } from "react";
// import Leaflet from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useNavigate, useParams } from "react-router-dom";
import NotLogin from "./NotLogin";

interface Station {
  _id: string;
  name: string;
  lat: number;
  long: number;
  connection: string[];
}

const CardScan = () => {
  const [station, setStation] = useState<Station[] | null>(null);
  const { stn, status } = useParams();
  const api = process.env.REACT_APP_API_KEY;

  // function addConnection(station: Station, connectedStationId: string): void {
  //   station.connection.push(connectedStationId);
  // }

  function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  function findPath(
    start: Station,
    end: Station,
    stations: Station[]
  ): { stations: Station[]; distance: number } | null {
    const visited: Set<string> = new Set();
    const queue: { station: Station; path: Station[] }[] = [
      { station: start, path: [] },
    ];

    while (queue.length > 0) {
      const { station, path } = queue.shift()!;
      visited.add(station._id);

      if (station._id === end._id) {
        return {
          stations: path.concat(station),
          distance: calculatePathDistance(path.concat(station)),
        };
      }

      for (const connectionId of station.connection) {
        const connection = stations.find((s) => s._id === connectionId);
        if (connection && !visited.has(connection._id)) {
          queue.push({ station: connection, path: path.concat(station) });
        }
      }
    }

    return null; // No path found
  }

  function calculatePathDistance(path: Station[]): number {
    let totalDistance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const { lat: lat1, long: lon1 } = path[i];
      const { lat: lat2, long: lon2 } = path[i + 1];
      totalDistance += calculateDistance(lat1, lon1, lat2, lon2);
    }
    return totalDistance;
  }

  const fetchData = async () => {
    const response = await fetch(`${api}/api/stations`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      const data = await response.json();
      setStation(data);
    } else {
      throw new Error("Failed to fetch data");
    }
  };

  const fetchOneStation = async () => {};

  useEffect(() => {
    fetchData();
  }, []);

  const navigate = useNavigate();

  if (station) {
    for (let i = 0; i < station.length; i++) {
      if (stn === station[i].name) {
        console.log("Station found", station[i]);
      } else {
        console.log("Station not found");
      }
    }
    for (let i = 0; i < station.length; i++) {
      console.log(station[i]);
    }
    const startStation = station[1];
    const endStation = station[6];

    const result = findPath(startStation, endStation, station);
    if (result) {
      console.log("Path found:");
      result.stations.forEach((station) => console.log(station.name));
      console.log("Total distance:", result.distance.toFixed(2), "meters");
    } else {
      console.log("No path found between the stations.");
    }
  }

  const fontColor =
    status === "IN"
      ? "text-green-500"
      : status === "OUT"
      ? "text-red-500"
      : "text-gray-300";

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
            {status}
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
          {stn}
        </label>
      </div>

      {/* right half - Map */}
      <MapContainer
        className="h-1/2 w-full lg:w-1/2 lg:h-full"
        center={[14.6004, 121.0357]}
        // center={[Number(station?.long), Number(station?.lat)]}
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
      </MapContainer>
    </div>
  );
};

export default CardScan;
