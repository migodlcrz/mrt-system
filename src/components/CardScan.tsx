import React, {
  ChangeEvent,
  useEffect,
  useState,
  useRef,
  startTransition,
} from "react";
// import Leaflet from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
} from "react-leaflet";
import { useNavigate, useParams } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DivIcon } from "leaflet";
import { FaTrainSubway } from "react-icons/fa6";
import { renderToStaticMarkup } from "react-dom/server";

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

interface Status {
  isDeployed: boolean;
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
  const [isDeployed, setIsDeployed] = useState<boolean>(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [fare, setFare] = useState<Fare | null>(null);
  const [totalFare, setTotalFare] = useState(0);
  const [enteredUID, setenteredUID] = useState("");
  const [cardBalance, setCardBalance] = useState(0);
  const [card, setCard] = useState<Card | null>(null);
  const [isCardFound, setIsCardFound] = useState(true);
  const [isOut, setIsOut] = useState(false);
  const mapRef = useRef<L.Map>(null);
  const { stn, status } = useParams();
  const api = process.env.REACT_APP_API_KEY;
  const navigate = useNavigate();

  const CustomIcon = new DivIcon({
    className: "custom-icon",
    html: renderToStaticMarkup(
      <FaTrainSubway className={`text-green-400`} size={30} />
    ),
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });

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

  const fetchStatus = async () => {
    const status_id = "65cb78bfe51a352d5ae51dd1";
    const response = await fetch(`${api}/api/status/${status_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${user.jwt}`,
      },
    });

    const json: Status = await response.json();

    if (response.ok) {
      setIsDeployed(json.isDeployed);
    }

    if (!response.ok) {
      toast.error("Cannot retrieve data");
    }
  };

  const fetchFare = async () => {
    const fareId = "65c28317dd50fe2e56d242c9";
    const getResponse = await fetch(`${api}/api/fr/${fareId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = await getResponse.json();
    if (getResponse.ok) {
      console.log("JSON", json);
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
      } else {
        navigate("/");
      }
    }
  };

  const handleFlyTo = (lat: number, long: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, long], 15);
    }
  };

  const handleStartEndPan = (start: Station, end: Station) => {
    if (mapRef.current) {
      mapRef.current.flyToBounds(
        [
          [start.lat, start.long],
          [end.lat, end.long],
        ],
        { padding: [50, 50] }
      );
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
    if (card && fare) {
      setenteredUID("");
      console.log("PASOK CARD FARE");
      if (card?.balance < fare?.minimumAmount) {
        toast.error("Balance is less than minimum fare.");
        return;
      }
    }
    try {
      const getResponse = await fetch(`${api}/api/cards/one/${card?._id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const getCard: Card = await getResponse.json();

      if (getCard.isTap === true) {
        toast.error("Already Tapped In!");
        setenteredUID("");
        return;
      }

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
        toast.success("Tapped In!");
      }
      if (!response.ok) {
        setenteredUID("");
        setCard(null);
        setIsCardFound(false);
        toast.error("Incorrect UID!");
      }
    } catch (error) {
      toast.error("Server Error!");
    }
  };

  const handleTapOut = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const getResponse = await fetch(`${api}/api/cards/one/${card?._id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const getCard: Card = await getResponse.json();

      if (getCard.isTap === false) {
        toast.error("Not Tapped In!");
        setenteredUID("");
        return;
      }

      setCardBalance(getCard.balance);

      const response = await fetch(`${api}/api/cards/in/${card?._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isTap: false, in: null }),
      });

      console.log("TAPOUT");

      if (response.ok) {
        getStartStation();
        // setenteredUID("");

        setTimeout(() => {
          setPath([]);
          setenteredUID("");
          setStationStart(null);
          setCard(null);
          setIsCardFound(false);
          setDistance(null);
        }, 20000);
      }
      if (!response.ok) {
        setenteredUID("");
        setCard(null);
        setIsCardFound(false);
        toast.error("Incorrect UID!");
      }
    } catch (error) {
      toast.error("Server Error!");
    }
  };

  const handleBalance = async () => {
    if (stationStart && stationEnd) {
      if (stationStart.name === stationEnd?.name) {
        console.log("START == END");
        if (fare) {
          console.log("FARE EXIST");
          const response = await fetch(`${api}/api/cards/out/${card?._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              balance: cardBalance - fare?.minimumAmount,
              history: {
                in: stationStart?.name,
                out: stationEnd?.name,
                fare: fare.minimumAmount,
              },
            }),
          });

          if (response.ok) {
            toast.success("Tapped Out!");
          } else {
            toast.error("Server Error!");
          }
        }
      }
    }
    if (distance && fare) {
      console.log("PUMASOK SA DISTANCE TSAKA FARE");
      if (
        cardBalance < Math.round(distance * fare?.perKM + fare?.minimumAmount)
      ) {
        toast.error("Insufficient Balance");
        return;
      }

      console.log("BALANCE", cardBalance);
      const response = await fetch(`${api}/api/cards/out/${card?._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          balance:
            cardBalance -
            Math.round(distance * fare?.perKM + fare?.minimumAmount),
          history: {
            in: stationStart?.name,
            out: stationEnd?.name,
            fare: Math.round(distance * fare?.perKM + fare?.minimumAmount),
          },
        }),
      });

      if (response.ok) {
        toast.success("Tapped Out!");
      } else {
        toast.error("Server Error!");
      }
    }
  };

  useEffect(() => {
    fetchData();
    fetchFare();
    fetchStatus();
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
    if (stationStart && stationEnd) {
      handleStartEndPan(stationStart, stationEnd);
    }
  }, [stationStart]);

  useEffect(() => {
    handleFlyTo(stationPage?.lat ?? 0, stationPage?.long ?? 0);
  }, [stationPage]);

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
        const stationNames = result.stations.map((station) => station.name);
        setPath(stationNames);

        setDistance(Number((result.distance / 1000).toFixed()));
        // setDistance(result.distance / 1000);
      } else {
        toast.error("No path found!");
      }
    }
    handleBalance();
    // }, [station, stationStart, stationEnd, isOut, distance]);
  }, [station, stationStart, stationEnd, isOut, distance]);
  // }

  return (
    <div className="h-screen flex flex-col xl:flex-row">
      {/* left half - Form */}
      <div
        className={
          "flex flex-col items-center xl:w-1/2 xl:h-full border border-gray-300 bg-[#0d9276] shadow-inner shadow-black"
        }
      >
        <div className="flex flex-col w-full p-8">
          <div className="text-md xl:text-2xl font-bold border-b-2 border-[#dbe7c9] text-[#dbe7c9]">
            <div className="mb-2 text-center w-full">
              {stationPage && (
                <div>
                  {stationPage.name} -{" "}
                  <label className="text-[#dbe7c9]">
                    {status?.toUpperCase()}
                  </label>
                </div>
              )}
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
                readOnly={!isDeployed}
                className="p-1 text-gray-900 rounded-lg shadow-inner shadow-black m-6"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setenteredUID(e.target.value);
                }}
              />

              <button className="bg-[#dbe7c9] p-2 rounded-lg shadow-lg shadow-black text-[#0d9276] hover:bg-gray-900 my-6">
                <FaCheck />
              </button>
            </form>
          </div>
          {/* CARD INFO */}
          <div className="w-full">
            <div className="bg-[#0d9276] shadow-lg shadow-black m-2 p-2 rounded-lg">
              <div className="bg-[#dbe7c9] shadow-inner shadow-black px-2 rounded-lg">
                <div className=" font-bold text-[#0d9276]">Card Info:</div>
                <div className="flex flex-row space-x-3">
                  <div className="flex flex-row space-x-2 w-1/2">
                    <div className="text-[#0d9276]">Card ID:</div>
                    <label>
                      {isCardFound && (
                        <label className="text-[#0d9276]"> {card?.uid}</label>
                      )}
                    </label>
                  </div>
                  <div className="flex flex-row space-x-2 w-1/2">
                    <div className="text-[#0d9276]">Balance:</div>
                    <label>
                      {isCardFound && (
                        <label className="text-[#0d9276] z-50">
                          ₱{card?.balance}
                        </label>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {isOut && (
            <div>
              {" "}
              <div className="w-full">
                <div className="bg-[#0d9276] shadow-lg shadow-black m-2 p-2 rounded-lg">
                  <div className="bg-[#dbe7c9] shadow-inner shadow-black px-2 rounded-lg">
                    <div>
                      <div className="text-[#0d9276] font-bold">
                        Fare Summary:
                      </div>
                    </div>
                    <div className="flex flex-row w-full">
                      <div className="flex flex-row space-x-2 text-[#0d9276] w-1/2">
                        <div className="text-[#0d9276]">Minimum:</div>
                        <label className="text-[#0d9276]">
                          ₱{fare && fare.minimumAmount}
                        </label>
                      </div>
                      <div className="flex flex-row space-x-2 text-white w-1/2">
                        <div className="text-[#0d9276]">Per KM:</div>
                        <label className="text-[#0d9276]">
                          {fare && <div>₱{fare.perKM}</div>}
                        </label>
                      </div>
                    </div>
                    <div className="flex flex-row w-full">
                      <div className="flex flex-row space-x-2 text-[#0d9276] w-1/2">
                        <div className="text-[#0d9276]">Total Fare:</div>
                        <label className="text-[#0d9276]">
                          {stationStart?.name !== stationEnd?.name &&
                            fare &&
                            distance && (
                              <div>
                                ₱
                                {Math.round(
                                  fare.minimumAmount + fare.perKM * distance
                                )}
                              </div>
                            )}
                          {stationStart?.name === stationEnd?.name && fare && (
                            <div>₱{Math.round(fare.minimumAmount)}</div>
                          )}
                        </label>
                      </div>
                      <div className="flex flex-row space-x-2 text-white w-1/2">
                        <div className="text-[#0d9276]">New Balance:</div>
                        <label className="text-[#0d9276]">
                          {stationStart?.name !== stationEnd?.name &&
                            fare &&
                            distance &&
                            card && (
                              <div>
                                ₱
                                {card?.balance -
                                  Math.round(
                                    fare.minimumAmount + fare.perKM * distance
                                  )}
                              </div>
                            )}
                          {stationStart?.name === stationEnd?.name &&
                            fare &&
                            card && (
                              <div>
                                ₱
                                {card?.balance - Math.round(fare.minimumAmount)}
                              </div>
                            )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full">
                <div className="bg-[#0d9276] shadow-lg shadow-black mt-3 m-2 p-2 rounded-lg">
                  <div className="bg-[#dbe7c9] shadow-inner shadow-black px-2 rounded-lg">
                    <div>
                      <div className="flex flex-row space-x-3 text-[#0d9276] font-bold">
                        Travel Summary:
                      </div>
                    </div>
                    <div className="flex flex-row w-full">
                      <div className="flex flex-row space-x-2 w-1/2">
                        <div className="text-[#0d9276]">Start:</div>

                        {stationStart && (
                          <label className="text-[#0d9276]">
                            {stationStart.name}
                          </label>
                        )}
                      </div>
                      <div className="flex flex-row space-x-2 w-1/2">
                        <div className="text-[#0d9276]">End:</div>{" "}
                        <label className="text-[#0d9276]">
                          {stationEnd && stationEnd.name}
                        </label>
                      </div>
                    </div>
                    <div className="flex flex-row space-x-2 text-white w-full">
                      <div className="text-[#0d9276]">Distance:</div>
                      <span className="text-[#0d9276] font-normal">
                        {distance && <div className="">{distance} km</div>}
                      </span>
                    </div>

                    <div className="w-full h-auto xl:h-custom-height-travel-summary">
                      <div className="bg-[#dbe7c9] shadow-lg shadow-black rounded-lg py-1">
                        <div className="bg-[#0d9276] shadow-inner shadow-black m-2 rounded-lg p-1">
                          <div
                            className={`max-h-[75px] overflow-y-auto`}
                            style={{
                              // maxHeight: "225px",
                              // overflowY: "auto",
                              scrollbarColor: "dark",
                            }}
                          >
                            <table className="w-full">
                              <thead className="sticky top-0 z-40">
                                <tr>
                                  <th className="text-[#dbe7c9] bg-[#dbe7c9] rounded-lg">
                                    <div className="text-[#0d9276]">
                                      Travel Path:
                                    </div>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {path.map((station, index) => (
                                  <tr
                                    key={index}
                                    className={`hover:bg-gray-500 animate__animated animate__fadeIn z-0 ${
                                      index % 2 === 0
                                        ? "bg-gray-400"
                                        : "bg-gray-300"
                                    }`}
                                  >
                                    <td className="text-black font-bold">
                                      {station}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
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
          ref={mapRef}
          className="h-1/2 w-full xl:w-1/2 xl:h-full"
          center={[stationStart.lat - 0.2, stationStart.long - 0.2]}
          zoom={10}
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
                  icon={CustomIcon}
                  eventHandlers={{
                    click: () => handleFlyTo(stations.lat, stations.long),
                  }}
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
                        color="#0d9276"
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
          ref={mapRef}
          className="h-1/2 w-full xl:w-1/2 xl:h-full"
          center={[stationEnd.lat - 0.2, stationEnd.long - 0.2]}
          zoom={10}
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
                  icon={CustomIcon}
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
                        color="#0d9276"
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
