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
import { get } from "http";
import QRCode from "react-qr-code";

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

interface QR {
  name: string;
  method: string;
}

const CardScan = () => {
  const [station, setStation] = useState<Station[] | null>(null);
  const [stationPage, setStationPage] = useState<Station | null>(null);
  const [stationStart, setStationStart] = useState<Station | null>(null);
  const [stationEnd, setStationEnd] = useState<Station | null>(null);
  const [path, setPath] = useState<string[]>();
  const [isDeployed, setIsDeployed] = useState<boolean>(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [fare, setFare] = useState<Fare | null>(null);
  const [enteredUID, setenteredUID] = useState("");
  const [newBalance, setNewBalance] = useState<number | null>(0);
  const [card, setCard] = useState<Card | null>(null);
  const [isCardFound, setIsCardFound] = useState(true);
  const [isOut, setIsOut] = useState(false);
  const [start, setStart] = useState<string | null>(null);
  const [totalFare, setTotalFare] = useState<number | null>(null);

  const { stn, status } = useParams();

  const tapQRIn: QR = {
    name: stn || "",
    method: "in",
  };

  const tapQROut: QR = {
    name: stn || "",
    method: "out",
  };

  const mapRef = useRef<L.Map>(null);
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

  // const handleStartEndPan = (start: Station, end: Station) => {
  //   if (mapRef.current) {
  //     mapRef.current.flyToBounds(
  //       [
  //         [start.lat, start.long],
  //         [end.lat, end.long],
  //       ],
  //       { padding: [50, 50] }
  //     );
  //   }
  // };

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
    console.log("START", stationStart?.name);
    e.preventDefault();
    try {
      const response = await fetch(`${api}/api/cards/in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enteredUID: enteredUID,
          stationStart: stationStart?.name,
        }),
      });
      const message = await response.json();
      if (response.ok) {
        toast.success("Tapped in");
        setenteredUID("");
      }

      if (!response.ok) {
        toast.error(message.error);
      }
    } catch (error) {
      console.log("ERROR: ", error);
    }
  };

  const handleTapOut = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // console.log("START STATION: ", stationStart);
    // console.log("STATION END: ", stationEnd);
    try {
      const response = await fetch(`${api}/api/cards/out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enteredUID: enteredUID,
          stationEnd: stationEnd?.name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStationStart(data.start);
        setDistance(data.distance);
        setTotalFare(data.totalFare);
        setNewBalance(data.newBalance);
        setStart(data.start);
        setPath(data.path);
        console.log("START", stationStart);
        console.log("END", stationEnd);
        // if (stationStart && stationEnd) {
        //   console.log("PUMASOK SA PANNING");
        //   handleStartEndPan(stationStart, stationEnd);
        // }
        toast.success("Tapped out");
        setTimeout(() => {
          setenteredUID("");
          setDistance(null);
          setTotalFare(null);
          setNewBalance(null);
          setStart(null);
          setPath([]);
        }, 10000);
      }

      if (!response.ok) {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Internal error");
    }
  };

  useEffect(() => {
    console.log("STATION: ", stn);

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

  // useEffect(() => {
  //   if (stationStart && stationEnd) {
  //     handleStartEndPan(stationStart, stationEnd);
  //   }
  // }, [stationStart]);

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
          <div
            className="rounded-xl"
            style={{
              backgroundColor: "white",
              height: "auto",
              margin: "0 auto",
              maxWidth: 100,
              width: "100%",
              padding: "10px",
            }}
          >
            {isOut ? (
              <QRCode
                size={256}
                style={{
                  height: "auto",
                  maxWidth: "100%",
                  width: "100%",
                }}
                value={JSON.stringify(tapQROut)}
                viewBox={`0 0 256 256`}
              />
            ) : (
              <QRCode
                size={256}
                style={{
                  height: "auto",
                  maxWidth: "100%",
                  width: "100%",
                }}
                // value={String(cardInfo?.uid)}
                value={JSON.stringify(tapQRIn)}
                viewBox={`0 0 256 256`}
              />
            )}
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
                          {totalFare && <div>₱{totalFare}</div>}
                          {stationStart?.name === stationEnd?.name && fare && (
                            <div>₱{Math.round(fare.minimumAmount)}</div>
                          )}
                        </label>
                      </div>
                      <div className="flex flex-row space-x-2 text-white w-1/2">
                        <div className="text-[#0d9276]">New Balance:</div>
                        <label className="text-[#0d9276]">
                          {newBalance && <div>₱{newBalance}</div>}
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

                        <label className="text-[#0d9276]"> {start}</label>
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
                        {distance && <div>{distance} KM</div>}
                      </span>
                    </div>

                    <div className="w-full h-auto xl:h-[160px]">
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
                                {path &&
                                  path.map((station, index) => (
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
