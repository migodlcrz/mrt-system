import { stat } from "fs";
import React, { useEffect, useState } from "react";
// import Leaflet from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
} from "react-leaflet";
import { useNavigate, useParams } from "react-router-dom";
import MapComponent from "./MapComponent";

interface Station {
  _id: string;
  name: string;
  lat: number;
  long: number;
  connection: string[];
}

const CardScan = () => {
  const [station, setStation] = useState<Station[] | null>(null);
  const [stationPage, setStationPage] = useState<Station | null>(null);
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
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
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

    return null;
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
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    if (response.ok) {
      setStation(data);
    } else {
      throw new Error("Failed to fetch data");
    }
  };

  const checkConnection = () => {
    if (station) {
      if (station.length > 0) {
        const matchedStation = station.find((station) => station.name === stn);
        if (matchedStation) {
          setStationPage(matchedStation);
        } else {
          console.log("Station not found");
        }
      }
    }
  };

  // FOR USEPARAMS

  if (station) {
    const startStation = station[0];
    const endStation = station[1];

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
    status === "in"
      ? "text-green-500"
      : status === "out"
      ? "text-red-500"
      : "text-gray-300";

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (station) {
      checkConnection();
    }
  }, [station]);

  console.log("STATION PAGE", stationPage?.name);

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
            {status?.toUpperCase()}
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
          {stationPage && <>{stationPage.name}</>}
        </label>
      </div>

      {/* right half - Map */}
      {stationPage && (
        <MapContainer
          className="h-1/2 w-full lg:w-1/2 lg:h-full"
          center={[stationPage.lat, stationPage.long]}
          zoom={20}
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <div>
            <label className="z-40"></label>
            <h3 className="z-40">hello</h3>
          </div>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {station &&
            station.map((stations: Station) => (
              <div key={stations._id}>
                <Marker
                  position={[stations.lat, stations.long]}
                  // icon={customIcon}
                >
                  <Tooltip direction="top" offset={[0, -35]} permanent>
                    <div className="font-bold text-green-400">STATION:</div>
                    <span className="text-sm font-bold">{stations.name}</span>
                  </Tooltip>
                </Marker>

                {stations.connection.map((connectedId: string) => {
                  const connectedStation = station.find(
                    (s) => s._id === connectedId
                  );
                  if (connectedStation) {
                    return (
                      <Polyline
                        key={`${stations._id}-${connectedId}`}
                        className=""
                        positions={[
                          [stations.lat, stations.long],
                          [connectedStation.lat, connectedStation.long],
                        ]}
                        color="green"
                      />
                    );
                  }
                  return null;
                })}
              </div>
            ))}
        </MapContainer>
      )}
    </div>
  );
};

export default CardScan;
