import React, { ChangeEvent, useEffect, useState } from "react";
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
import { useAuthContext } from "../hooks/useAuthContext";
import MapComponent from "./MapComponent";
import { FaCheck } from "react-icons/fa";

interface Station {
  _id: string;
  name: string;
  lat: number;
  long: number;
  connection: string[];
}

interface Card {
  _id: string;
  uid: number;
  balance: number;
  isTap: boolean;
  in: string;
  out: string;
}

interface Fare {
  minimumAmount: number;
  perKM: number;
}

const CardScan = () => {
  const [station, setStation] = useState<Station[] | null>(null);
  const [stationPage, setStationPage] = useState<Station | null>(null);
  const [stationStart, setStationStart] = useState<Station | null>(null);
  const [stationEnd, setStationEnd] = useState<Station | null>(null);
  const [path, setPath] = useState<string[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [fare, setFare] = useState<Fare | null>(null);
  const [enteredUID, setenteredUID] = useState("");
  const [card, setCard] = useState<Card | null>(null);
  const [isCardFound, setIsCardFound] = useState(true);
  const [isOut, setIsOut] = useState(false);
  const { stn, status } = useParams();
  const api = process.env.REACT_APP_API_KEY;
  const navigate = useNavigate();

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

  const fetchFare = async () => {
    const response = await fetch(`${api}/api/fare/65a146cff1b7fd49a47868c4`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = await response.json();

    if (response.ok) {
      setFare(json);
    }
  };

  const checkConnection = () => {
    if (station) {
      if (station.length > 0) {
        const matchedStation = station.find((station) => station.name === stn);
        if (matchedStation) {
          if (!isOut) {
            setStationPage(matchedStation);
            setStationStart(matchedStation);
          } else {
            setStationPage(matchedStation);
            setStationEnd(matchedStation);
          }
        } else {
          navigate("/");
        }
      }
    }
  };

  const checkCardExistence = async () => {
    try {
      const getAll = await fetch(`${api}/api/cards`, {
        headers: { "Content-Type": "application/json" },
      });

      const allCards = await getAll.json();

      const matchingCard = allCards.find(
        (card: Card) => card.uid === Number(enteredUID)
      );

      if (matchingCard) {
        console.log("MATCHING CARD", matchingCard);
        setCard(matchingCard);
        setIsCardFound(true);
      } else {
        setCard(null);
        setIsCardFound(false);
      }
    } catch (error) {
      console.error("Error checking card existence:", error);
    }
  };

  const handleTapIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`${api}/api/cards/in/${card?._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isTap: true, in: stationStart?._id }),
      });
      if (response.ok) {
        setenteredUID("");
        setCard(null);
        setIsCardFound(false);
      }
    } catch (error) {
      console.error("Error checking card existence:", error);
    }
  };

  const handleTapOut = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`${api}/api/cards/in/${card?._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isTap: false, in: null }),
      });

      if (response.ok) {
        getStartStation();
        setTimeout(() => {
          setPath([]);
          setenteredUID("");
          setStationStart(null);
          setCard(null);
          setIsCardFound(false);
          setDistance(null);
        }, 10000);
      }
    } catch (error) {
      console.error("Error checking card existence:", error);
    }
  };

  const fontColor =
    status === "in"
      ? "text-green-500"
      : status === "out"
      ? "text-red-500"
      : "text-gray-300";

  useEffect(() => {
    fetchData();
    fetchFare();
  }, []);

  useEffect(() => {
    if (status === "out") {
      setIsOut(true);
    } else {
      setIsOut(false);
    }
    fetchData();
  }, [isOut]);

  useEffect(() => {
    checkCardExistence();
  }, [enteredUID]);

  useEffect(() => {
    if (station) {
      checkConnection();
    } else {
      setCard(null);
      setIsCardFound(false);
    }
  }, [station]);

  //===================================================
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

  const getStartStation = async () => {
    const response = await fetch(`${api}/api/stations/${card?.in}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (response.ok) {
      setStationStart(data);
    }
  };

  useEffect(() => {
    if (station && stationStart && stationEnd && isOut) {
      const startStation = stationStart;
      const endStation = stationEnd;

      const result = findPath(startStation, endStation, station);
      if (result) {
        console.log("Path found:");

        const stationNames = result.stations.map((station) => station.name);
        setPath(stationNames);

        // stationNames.forEach((station) => console.log(station));
        // console.log("Total distance:", result.distance.toFixed(2), "meters");

        setDistance(Number(result.distance.toFixed(2)));
      } else {
        console.log("No path found between the stations.");
      }
    }
  }, [station, stationStart, stationEnd, isOut]);
  // }

  return (
    <div className="h-screen flex flex-col lg:flex-row">
      {/* left half - Form */}
      <div
        className={
          "flex flex-col items-center lg:w-1/2 lg:h-full border border-gray-300 shadow-md text-blue-400 bg-gray-800"
        }
      >
        <div className="flex flex-row lg:flex-col w-full p-8">
          <div className="text-2xl font-bold border-b-2 border-gray-400 text-green-400">
            <div className="mb-2 text-center w-full">
              {stationPage && <>{stationPage.name}</>}
            </div>
          </div>
          <div className="flex w-full text-center justify-center">
            <form
              onSubmit={isOut ? handleTapOut : handleTapIn}
              className="flex flex-row"
            >
              <input
                type="text"
                id="large-input"
                value={enteredUID}
                className="p-1 text-gray-900 rounded-lg m-6"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setenteredUID(e.target.value);
                }}
              />
              <button className="bg-gray-700 p-2 rounded-lg text-green-400 hover:bg-gray-900 my-6">
                <FaCheck />
              </button>
            </form>
          </div>
          <div className="w-full">
            <div className="bg-gray-700 m-2 rounded-lg py-1">
              <div className="bg-gray-900 m-2 rounded-lg p-1">
                <div className=" font-bold text-green-400">Card Info:</div>
                <div className="flex flex-row space-x-3">
                  <div className="w-full">
                    <div className="flex flex-row space-x-2">
                      <div className="text-white">Card ID:</div>
                      <label>
                        {isCardFound ? (
                          <label className="text-green-400"> {card?.uid}</label>
                        ) : (
                          ""
                        )}
                      </label>
                    </div>
                    <div className="flex flex-row space-x-2">
                      <div className="text-white">Balance:</div>{" "}
                      <label>
                        {" "}
                        {isCardFound ? (
                          <label className="text-green-400">
                            {card?.balance}
                          </label>
                        ) : (
                          <label className="text-gray-400">N/A</label>
                        )}
                      </label>
                    </div>
                  </div>

                  {isOut && (
                    <div className="w-full">
                      <div className="flex flex-row space-x-2">
                        <div className="text-white">Start:</div>
                        <label>
                          {stationStart ? stationStart.name : "N/A"}
                        </label>
                      </div>
                      <div className="flex flex-row space-x-2">
                        <div className="text-white">End:</div>{" "}
                        <label>{stationEnd ? stationEnd.name : "N/A"}</label>
                      </div>
                      <div>
                        <span className="text-white font-normal">
                          {fare && (
                            <div className="">{fare.minimumAmount} meters</div>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-white font-normal">
                          {distance && (
                            <div className="">{distance} meters</div>
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex flex-row space-x-3 text-green-400 font-bold">
                    Fare:{" "}
                  </div>
                </div>
                <div>
                  <div className="flex flex-row space-x-3 text-green-400 font-bold">
                    Distance Travelled:{" "}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {isOut && (
            <div className="w-full">
              <div className="bg-gray-700 m-2 rounded-lg py-1">
                <div className="bg-gray-900 m-2 rounded-lg p-1">
                  <div
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                      scrollbarColor: "dark",
                    }}
                  >
                    <table className="w-full">
                      <thead className="bg-gray-900 sticky top-0 z-40">
                        <tr>
                          <th className="text-green-400 bg-gray-900">
                            Travel Path:
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {path.map((station, index) => (
                          <tr
                            key={index}
                            className={`hover:bg-gray-500 animate__animated animate__fadeIn z-0 ${
                              index % 2 === 0 ? "bg-gray-400" : "bg-gray-300"
                            }`}
                          >
                            <td className="text-black font-bold">{station}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* right half - Map */}
      {stationStart && !isOut && (
        <MapContainer
          className="h-1/2 w-full lg:w-1/2 lg:h-full"
          center={[stationStart.lat, stationStart.long]}
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
                  <Tooltip direction="top" offset={[0, -35]}>
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
      {stationEnd && (
        <MapContainer
          className="h-1/2 w-full lg:w-1/2 lg:h-full"
          center={[stationEnd.lat, stationEnd.long]}
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
                  <Tooltip direction="top" offset={[0, -35]}>
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
