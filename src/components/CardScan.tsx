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

const CardScan = () => {
  const [station, setStation] = useState<Station[] | null>(null);
  const [stationPage, setStationPage] = useState<Station | null>(null);
  const [enteredUID, setenteredUID] = useState("");
  const [card, setCard] = useState<Card | null>(null);
  const [isCardFound, setIsCardFound] = useState(true);
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

  const checkConnection = () => {
    if (station) {
      if (station.length > 0) {
        const matchedStation = station.find((station) => station.name === stn);
        if (matchedStation) {
          setStationPage(matchedStation);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("SUBMITTED", card?._id);
    try {
      const response = await fetch(`${api}/api/cards/in/${card?._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isTap: true, in: stationPage?._id }),
      });

      const data = await response.json();
      console.log("DATA", data);
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
  }, []);

  useEffect(() => {
    checkCardExistence();
    console.log("CARD", card);
  }, [enteredUID]);

  useEffect(() => {
    if (station) {
      checkConnection();
    } else {
      setCard(null);
      setIsCardFound(false);
    }
  }, [station]);

  console.log("ENTERED UID: ", enteredUID);

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
        <form onSubmit={handleSubmit} className="flex flex-row ml-16">
          <input
            type="text"
            id="large-input"
            className="block p-1 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 max-w-120 lg:w-80 lg:p-4"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setenteredUID(e.target.value);
            }}
          />
          <button>Click Me</button>
        </form>
        <label
          htmlFor="station-label"
          className={`block text-2xl font-bold lg:text-4xl lg:font-black text-blue-400 mt-2 lg:mr-0`}
        >
          {stationPage && <>{stationPage.name}</>}
        </label>
        <label>
          {" "}
          {isCardFound ? (
            <label>ID NUMBER: {card?.uid}</label>
          ) : (
            <label>Card not found</label>
          )}
        </label>
        <label>
          {" "}
          {isCardFound ? (
            <label>BALANCE: {card?.balance}</label>
          ) : (
            <label>Card not found</label>
          )}
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
