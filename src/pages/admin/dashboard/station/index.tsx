import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useAuthContext } from "../../../../hooks/useAuthContext";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  Polyline,
} from "react-leaflet";

import MapComponent from "../../../../components/MapComponent";
import { IoMdCloseCircle } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import "animate.css";
import L from "leaflet";
// import L from "leaflet";

interface Station {
  _id: string;
  name: string;
  long: number;
  lat: number;
  connection: [string];
}

interface LatLng {
  lat: number;
  lng: number;
}

interface StationLandingProps {}

const StationLanding: React.FC<StationLandingProps> = () => {
  const [stations, setStations] = useState<Station[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<L.Map>(null);

  const { user } = useAuthContext();
  const api = process.env.REACT_APP_API_KEY;

  const [latClick, setLatClick] = useState<number>(0);
  const [lngClick, setLngClick] = useState<number>(0);
  const [stationName, setStationName] = useState<string>("");
  const [connections, setConnections] = useState<string[]>([]);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchConnectedTerm, setSearchConnectedTerm] = useState<string>("");
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editStruct, setEditStruct] = useState<Station | null>(null);

  // const customIcon = new L.Icon({
  //   iconUrl: require("../station/marker.png"),
  //   iconSize: [30, 30],
  //   iconAnchor: [15, 29],
  //   popupAnchor: [0, -35],
  //   className: "animate__animated animate__fadeIn",
  // });

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const station = {
      name: stationName,
      long: lngClick,
      lat: latClick,
      connection: connections,
    };

    for (const connectedStationId of connections) {
      const response = await fetch(
        `${api}/api/stations/${connectedStationId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.jwt}`,
          },
        }
      );
      if (response.ok) {
        const connectedStation = await response.json();
        const distance = calculateDistance(
          { lat: latClick, lng: lngClick },
          { lat: connectedStation.lat, lng: connectedStation.long }
        );
        if (Number(distance) < 500) {
          console.log("less than 500", distance);
          toast.error(
            "New station must be at least 500 meters away from existing station"
          );

          setTimeout(() => {
            setError(null);
          }, 3000);

          setStationName("");
          setLngClick(0);
          setLatClick(0);
          setConnections([]);
          fetchStations();

          console.log("DISTANCE", distance);
          return;
        }
      }
    }

    const postResponse = await fetch(`${api}/api/stations`, {
      method: "POST",
      body: JSON.stringify(station),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.jwt}`,
      },
    });

    if (!postResponse.ok) {
      setError("ERROR");
      console.log("ERROR", error);
      return;
    }

    toast.success("Station added successfully");
    setStationName("");
    setLngClick(0);
    setLatClick(0);
    setConnections([]);

    // Fetch updated list of stations
    fetchStations();
  };

  const handleFlyTo = (station: Station) => {
    mapRef.current!.flyTo([station.lat, station.long], 14, {
      duration: 1,
    });
  };

  // Function to calculate distance between two points (using Haversine formula)
  function calculateDistance(point1: LatLng, point2: LatLng) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (point2.lat - point1.lat) * (Math.PI / 180);
    const dLon = (point2.lng - point1.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1.lat * Math.PI) / 180) *
        Math.cos((point2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c * 1000;
    return distance.toFixed(2); // Return distance rounded to 2 decimal places
  }

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    for (const connectedStationId of connections) {
      const response = await fetch(
        `${api}/api/stations/${connectedStationId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.jwt}`,
          },
        }
      );
      if (response.ok) {
        const connectedStation = await response.json();
        const distance = calculateDistance(
          { lat: latClick, lng: lngClick },
          { lat: connectedStation.lat, lng: connectedStation.long }
        );
        if (Number(distance) < 500) {
          console.log("less than 500", distance);
          toast.error(
            "Station must be at least 500 meters away from existing station"
          );

          setTimeout(() => {
            setError(null);
          }, 3000);

          setEditStruct(null);
          setStationName("");
          setLngClick(0);
          setLatClick(0);
          setConnections([]);
          setIsEdit(false);
          fetchStations();

          return;
        }
      }
    }

    const response = await fetch(`${api}/api/stations/` + editStruct?._id, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.jwt}`,
      },
      body: JSON.stringify({
        name: stationName,
        lat: latClick,
        long: lngClick,
        connection: connections,
      }),
    });

    if (response.ok) {
      toast.success("Station updated successfully");
      fetchStations();
    } else {
      toast.error("Failed to update station");
    }

    clearSearch();
    setIsEdit(false);
    setEditStruct(null);
  };

  const handleConnectionClick = (station: Station) => {
    const index = connections.indexOf(station._id);
    if (index === -1) {
      setConnections([...connections, station._id]);
    } else {
      const newConnections = [...connections];
      newConnections.splice(index, 1);
      setConnections(newConnections);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setStationName("");
    setLngClick(0);
    setLatClick(0);
    setConnections([]);
  };

  const handleClickEdit = (station: Station) => {
    handleFlyTo(station);
    setStationName(station.name);
    setLatClick(station.lat);
    setLngClick(station.long);
    setConnections(station.connection);
    setIsEdit(true);
    setEditStruct(station);
  };

  const handleDelete = async (station: String): Promise<void> => {
    console.log("BEFORE DELETE", editStruct);
    const isConfirmed = window.confirm("Are you sure you want to delete this?");

    if (isConfirmed) {
      const deleteResponse = await fetch(`${api}/api/stations/` + station, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.jwt}`,
        },
      });

      if (!deleteResponse.ok) {
        toast.error("Failed to delete station");
      }

      if (deleteResponse.ok) {
        toast.success("Station deleted successfully");
        setSearchTerm("");
        setStationName("");
        setLngClick(0);
        setLatClick(0);
        setIsEdit(false);
        setConnections([]);
        fetchStations();
        setEditStruct(null);
      }
    }
  };

  const fetchStations = async () => {
    const response = await fetch(`${api}/api/stations`, {
      headers: {
        Authorization: `Bearer ${user.jwt}`,
      },
    });
    const json = await response.json();

    if (response.ok) {
      setStations(json);
      console.log("STATIONS", stations);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  return (
    <div className="CardLanding bg-[#dbe7c9] h-screen animate__animated animate__fadeIn">
      <div className="flex flex-col lg:flex-row h-screen">
        {/* eLEFT PANEL */}
        <div className="w-full lg:w-1/2 z-0 mt-24 lg:mt-0">
          {/* eMAP */}
          <div className="flex h-96 lg:h-custom-height items-center justify-center bg-[#dbe7c9] shadow-lg shadow-black mx-5 my-2 lg:mr-1 p-2 rounded-lg lg:mt-24">
            <MapContainer
              ref={mapRef}
              className="animate__animated animate__fadeIn shadow-inner shadow-black"
              center={[14.648028524991535, 121.05955123901369]}
              zoom={13}
              zoomControl={false}
              renderer={new L.SVG({ padding: 100 })}
              style={{ height: "100%", width: "100%" }}
            >
              <MapComponent
                setLatClicked={setLatClick}
                setLngClicked={setLngClick}
              />

              <Marker position={[latClick, lngClick]} />

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Other map elements, like connections, can remain as they are */}
              {stations &&
                stations.map((station: Station) => (
                  <div key={station._id}>
                    <Marker
                      position={[station.lat, station.long]}
                      // icon={customIcon}
                      eventHandlers={{
                        click: () => handleClickEdit(station),
                      }}
                    >
                      <Tooltip direction="top" offset={[0, -35]}>
                        <div className="font-bold text-green-400">STATION:</div>
                        <span className="text-sm fontstationld">
                          {station.name}
                        </span>
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
        </div>

        {/* eRIGHT PANEL */}
        <div className="flex flex-col w-full lg:w-1/2 h-full z-0">
          {/* eSEARCH BAR */}
          <div className="flex max-w-full mx-5 mb-5 lg:mb-2 lg:mt-24 p-2 justify-center bg-[#dbe7c9] rounded-lg shadow-lg shadow-black">
            <div className="flex bg-[#0d9276] text-gray-700 font-bold rounded-l-lg w-auto h-10 px-2 items-center">
              <div className="text-[#dbe7c9]">
                <FaSearch />
              </div>
            </div>
            <input
              type=""
              className="bg-white w-full h-10 text-black shadow-inner shadow-black px-3"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
            />
            <button
              className="flex bg-[#0d9276] text-gray-700 font-bold  rounded-r-lg w-auto h-10 px-2 items-center"
              onClick={() => setSearchTerm("")}
            >
              <div className="text-[#dbe7c9]">Clear</div>
            </button>
          </div>
          {/* eTABLE */}
          <div className="bg-[#dbe7c9] p-2 rounded-md mx-5 shadow-lg shadow-black">
            <div className="table-container h-custom-max-height">
              <div
                className="h-96 overflow-y-auto shadow-black shadow-inner"
                style={{
                  maxHeight: "190px",
                  overflowY: "auto",
                  scrollbarColor: "#dbe7c9 #0d9276",
                  scrollbarWidth: "thin",
                }}
              >
                <table className=" w-full bg-gray-500">
                  <thead className="bg-[#0d9276] sticky top-0 z-50 shadow-md shadow-black">
                    <tr className="py-2 px-4 sticky text-[#dbe7c9]">
                      <th>Station Name</th>
                    </tr>
                  </thead>
                  <tbody className="">
                    {stations &&
                      stations
                        .filter((station: Station) =>
                          station.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        )
                        .map((station: Station, index) => {
                          return (
                            <tr
                              key={station._id}
                              className={`hover:bg-gray-500 animate__animated animate__fadeIn z-0 ${
                                index % 2 === 0
                                  ? "bg-gray-400 hover:bg-gray-600 shadow-lg shadow-black"
                                  : "bg-[#dbe7c9] hover:bg-gray-600 shadow-inner shadow-black"
                              }`}
                              onClick={() => {
                                handleClickEdit(station);
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              <td className="font-bold text-center text-black">
                                {station.name}
                              </td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* eSTATION FORM */}
          <div className="flex justify-center items-center w-auto h-1/2 z-10 bg-[#dbe7c9] shadow-lg shadow-black mx-5 mt-2 lg:mr-5 rounded-lg py-2 mb-2">
            <div className="flex flex-row bg-[#dbe7c9] shadow-inner shadow-black m-2 h-full w-full rounded-lg">
              <div className="flex flex-col w-1/2 m-2">
                <div className="flex flex=row justify-between">
                  <div
                    className={`text-xl font-bold ${
                      isEdit || (latClick !== 0 && lngClick !== 0)
                        ? `text-[#0d9276]`
                        : `text-gray-400`
                    }`}
                  >
                    {latClick !== 0 && lngClick !== 0
                      ? `Station ${isEdit ? "Edit" : "Add"}`
                      : "Station"}
                  </div>
                </div>
                <div className="">
                  <form
                    className="flex flex-col w-full justify-between space-y-4"
                    onSubmit={isEdit ? handleEdit : handleCreate}
                  >
                    <div>
                      <label
                        className={`${
                          isEdit || (latClick !== 0 && lngClick !== 0)
                            ? `text-[#0d9276]`
                            : `text-gray-400`
                        }`}
                      >
                        Station Name:{" "}
                      </label>
                      <span className="text-[#0d9276] font-bold">
                        {editStruct?.name}
                      </span>
                    </div>
                    <input
                      type="text"
                      className="rounded-lg text-black disabled:opacity-80 shadow-inner shadow-black"
                      value={stationName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setStationName(e.target.value);
                      }}
                      disabled={latClick === 0 && lngClick === 0}
                      required
                    />
                    <div className="flex flex-col lg:flex-row w-auto lg:space-x-10">
                      <div className="flex flex-col w-1/2">
                        <label
                          className={`${
                            isEdit || (latClick !== 0 && lngClick !== 0)
                              ? `text-[#0d9276]`
                              : `text-gray-400`
                          }`}
                        >
                          Latitude:
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-lg text-black disabled:opacity-80 shadow-inner shadow-black"
                          value={latClick}
                          readOnly
                          disabled={latClick === 0 && lngClick === 0}
                          required
                        />
                      </div>
                      <div className="flex flex-col w-1/2">
                        <label
                          className={`${
                            isEdit || (latClick !== 0 && lngClick !== 0)
                              ? `text-[#0d9276]`
                              : `text-gray-400`
                          }`}
                        >
                          Longitude:
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-lg text-black disabled:opacity-80 shadow-inner shadow-black"
                          value={lngClick}
                          readOnly
                          disabled={latClick === 0 && lngClick === 0}
                          required
                        />
                      </div>
                    </div>
                    <div className="">
                      {latClick !== 0 && lngClick !== 0 && (
                        <button className="bg-[#0d9276] text-black p-2 rounded-lg font-bold w-16 shadow-md shadow-black">
                          {isEdit ? "Edit" : "Add"}
                        </button>
                      )}
                      {error && <div className="text-red-600">{error}</div>}
                    </div>
                  </form>
                  <div className="w-1/2">
                    {isEdit && (
                      <button
                        className="bg-red-600 text-black p-2 rounded-lg font-bold mt-2 hover"
                        onClick={() => {
                          handleDelete(String(editStruct?._id));
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between w-1/2 m-2">
                <div className="flex flex-row justify-between w-full h-10">
                  <label
                    className={`mb-2 text-xl font-bold ${
                      isEdit || (latClick !== 0 && lngClick !== 0)
                        ? `text-[#0d9276]`
                        : `text-gray-400`
                    }`}
                  >
                    Station Connection:
                  </label>
                  {!isEdit && (
                    <button
                      className={`flex ${
                        latClick === 0 && lngClick === 0
                          ? `bg-gray-400 text-black`
                          : `bg-[#0d9276] text-[#dbe7c9] shadow-lg shadow-black`
                      } text-gray-700 font-bold rounded-lg w-auto h-10 px-2 items-center`}
                      onClick={clearSearch}
                    >
                      <div
                        className={`${
                          latClick === 0 && lngClick === 0
                            ? "text-gray-700"
                            : "text-[#dbe7c9]"
                        }`}
                      >
                        Cancel
                      </div>
                    </button>
                  )}
                  {isEdit && (
                    <button
                      className="text-2xl text-[#0d9276] p-2 rounded-lg font-bold"
                      onClick={(e) => {
                        clearSearch();
                        setIsEdit(false);
                        setEditStruct(null);
                      }}
                    >
                      <IoMdCloseCircle />
                    </button>
                  )}
                </div>

                <div className="flex flex-row">
                  <div
                    className={`flex ${
                      latClick === 0 && lngClick === 0
                        ? `bg-gray-400 text-gray-700`
                        : `bg-[#0d9276] text-[#dbe7c9]`
                    }  font-bold  rounded-l-lg w-auto h-10 px-2 items-center`}
                  >
                    <FaSearch />
                  </div>
                  <input
                    type=""
                    className="bg-gray-200 w-full h-10 text-black rounded-r-lg lg:rounded-none disabled:opacity-80 shadow-inner shadow-black"
                    value={searchConnectedTerm}
                    disabled={latClick === 0 && lngClick === 0}
                    onChange={(e) => {
                      setSearchConnectedTerm(e.target.value);
                    }}
                  />
                  <button
                    className={`flex ${
                      latClick === 0 && lngClick === 0
                        ? `bg-gray-400 text-gray-700 `
                        : `bg-[#0d9276] text-[#dbe7c9] `
                    }  font-bold rounded-r-lg w-auto h-10 px-2 items-center hidden lg:block`}
                    onClick={() => setSearchConnectedTerm("")}
                  >
                    Clear
                  </button>
                </div>
                <div className="w-full h-56 bg-[#dbe7c9] rounded-lg shadow-inner shadow-black">
                  {latClick === 0 && lngClick === 0 && (
                    <div className="text-center mt-20 font-bold px-3 text-gray-500">
                      Press on map or edit station to see connections.
                    </div>
                  )}
                  {latClick !== 0 && lngClick !== 0 && (
                    <div
                      style={{
                        maxHeight: "220px",
                        overflowY: "auto",
                        scrollbarColor: "#0d9276 #dbe7c9",
                        scrollbarWidth: "thin",
                      }}
                    >
                      <div className="m-2">
                        {stations &&
                          stations
                            .filter((station: Station) =>
                              station.name
                                .toLowerCase()
                                .includes(searchConnectedTerm.toLowerCase())
                            )
                            .map((station: Station, index) => {
                              return (
                                <div key={station._id}>
                                  {station.name !== stationName && (
                                    <button
                                      onClick={() =>
                                        handleConnectionClick(station)
                                      }
                                      className={`px-2 py-1 my-1 font-bold w-full rounded-lg  ${
                                        connections.includes(station._id)
                                          ? "bg-[#0d9276] text-[#dbe7c9] shadow-inner shadow-black"
                                          : "bg-[#dbe7c9] text-[#0d9276] hover:bg-gray-900 shadow-lg shadow-black"
                                      }`}
                                    >
                                      {station.name}
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationLanding;
