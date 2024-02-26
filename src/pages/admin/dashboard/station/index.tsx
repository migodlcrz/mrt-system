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
import L, { DivIcon } from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { FaTrainSubway } from "react-icons/fa6";
import { FaMapMarkerAlt } from "react-icons/fa";
import Switch from "react-switch";

interface Station {
  _id: string;
  name: string;
  long: number;
  lat: number;
  connection: [string];
}

interface Status {
  isDeployed: boolean;
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
  const [isDelete, setIsDelete] = useState<boolean>(false);
  const [isDeployed, setisDeployed] = useState<boolean>(false);

  const StationIcon = new DivIcon({
    className: "custom-icon",
    html: renderToStaticMarkup(<FaTrainSubway size={30} color="black" />),
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });

  const PinIcon = new DivIcon({
    className: "custom-icon",
    html: renderToStaticMarkup(<FaMapMarkerAlt size={30} color="#0d9276" />),
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -15],
  });

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
      setisDeployed(json.isDeployed);
    }

    if (!response.ok) {
      toast.error("Cannot retrieve data");
    }
  };

  const handleMaintenance = async () => {
    const status_id = "65cb78bfe51a352d5ae51dd1";
    const response = await fetch(`${api}/api/status/${status_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.jwt}`,
      },
      body: JSON.stringify({ isDeployed: isDeployed }),
    });

    const json = await response.json();

    if (response.ok) {
      console.log("Changed");
    }

    if (!response.ok) {
      console.log("NOT CHANGED");
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isDeployed) {
      toast.error("Server deployed. Cannot create station.");
      clearSearch();
      return;
    }

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
          setSearchConnectedTerm("");
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

    if (isDeployed) {
      toast.error("Server deployed. Cannot edit station.");
      setIsEdit(false);
      clearSearch();
      return;
    }

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
      if (!isDelete) {
        toast.error("Failed to update station");
      } else {
        return;
      }
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
    setSearchConnectedTerm("");
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
    if (isDeployed) {
      toast.error("Server deployed. Cannot delete station.");
      setIsDelete(false);
      clearSearch();

      return;
    }
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
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    fetchStations();
  }, []);

  useEffect(() => {
    handleMaintenance();
  }, [isDeployed]);

  return (
    <div className="CardLanding bg-[#dbe7c9] h-auto px-2 lg:px-0 xl:h-screen animate__animated animate__fadeIn">
      <div className="flex flex-col xl:flex-row">
        {/* eLEFT PANEL */}
        <div className="w-full xl:w-1/2 z-0">
          <div className="mt-24">
            <div className="flex items-center justify-center bg-[#dbe7c9] shadow-lg shadow-black mx-5 my-2 xl:mr-1 p-2 rounded-lg xl:mt-24">
              <label className="text-[#0d9276] my-2 font-bold">
                Station Management
              </label>
            </div>
          </div>
          {/* eMAP */}
          <div className="flex h-96 xl:h-custom-height items-center justify-center bg-[#dbe7c9] shadow-lg shadow-black mx-5 my-2 xl:mr-1 p-2 rounded-lg">
            <MapContainer
              ref={mapRef}
              className="animate__animated animate__fadeIn shadow-inner shadow-black"
              center={[14.648028524991535, 121.05955123901369]}
              zoom={13}
              zoomControl={false}
              renderer={new L.SVG({ padding: 100 })}
              style={{ height: "100%", width: "100%" }}
            >
              {!isDeployed && (
                <MapComponent
                  setLatClicked={setLatClick}
                  setLngClicked={setLngClick}
                />
              )}

              <Marker position={[latClick, lngClick]} icon={PinIcon} />

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
                      icon={PinIcon}
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
        <div className="flex flex-col w-full xl:w-1/2 h-full z-0">
          {/* eSEARCH BAR */}
          <div className="flex max-w-full mx-5 mb-5 xl:mb-2 xl:mt-24 p-2 justify-center bg-[#dbe7c9] rounded-lg shadow-lg shadow-black">
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
            <div className="table-container xl:h-[190px]">
              <div
                className="h-[185px] overflow-y-auto shadow-black shadow-inner"
                style={{
                  // maxHeight: "190px",
                  // overflowY: "auto",
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
          <div className="flex justify-center items-center w-auto h-[370px] z-10 bg-[#dbe7c9] shadow-lg shadow-black mx-5 mt-2 xl:mr-5 rounded-lg py-2 mb-2">
            <div className="flex flex-row bg-[#dbe7c9] shadow-inner shadow-black m-2 h-full w-full rounded-lg">
              <div className="flex flex-col w-1/2 m-2">
                <div className="flex flex=row justify-between">
                  <div
                    className={`text-sm xl:text-xl font-bold ${
                      isEdit || (latClick !== 0 && lngClick !== 0)
                        ? `text-[#0d9276]`
                        : `text-gray-400`
                    }`}
                  >
                    {latClick !== 0 && lngClick !== 0
                      ? `Station ${isEdit ? "Edit" : "Add"}`
                      : "Station"}
                  </div>
                  <div className="flex flex-row justify-between items-center space-x-2 w-auto bg-[#0d9276] pt-1 px-2 rounded-2xl shadow-md shadow-black">
                    <label
                      className={`font-bold text-center text-sm hidden xl:block ${
                        isDeployed ? "text-[#dbe7c9]" : "text-gray-400"
                      }`}
                    >
                      {isDeployed ? "DEPLOYED" : "MAINTENACE"}
                    </label>
                    <div>
                      <Switch
                        onChange={() => {
                          setisDeployed(!isDeployed);
                          clearSearch();
                          setIsEdit(false);
                          setIsDelete(false);
                        }}
                        checked={isDeployed}
                        handleDiameter={15}
                        height={20}
                      />
                    </div>
                  </div>
                </div>
                <div className="">
                  <form
                    className="flex flex-col w-full justify-between"
                    onSubmit={isEdit ? handleEdit : handleCreate}
                  >
                    <div>
                      <label
                        className={`text-sm xl:text-md ${
                          isEdit || (latClick !== 0 && lngClick !== 0)
                            ? `text-[#0d9276]`
                            : `text-gray-400`
                        }`}
                      >
                        Station Name:
                      </label>
                    </div>
                    <input
                      type="text"
                      className="rounded-lg text-black disabled:opacity-80 shadow-inner shadow-black"
                      value={stationName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setStationName(e.target.value);
                      }}
                      disabled={
                        (latClick === 0 && lngClick === 0) || isDeployed
                      }
                      required
                    />
                    <div className="flex space-x-2 flex-row w-auto xl:space-x-10 my-2">
                      <div className="flex flex-col w-1/2">
                        <label
                          className={`text-sm xl:text-md ${
                            isEdit || (latClick !== 0 && lngClick !== 0)
                              ? `text-[#0d9276]`
                              : `text-gray-400`
                          }`}
                        >
                          Latitude:
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-lg h-auto text-black disabled:opacity-80 shadow-inner shadow-black"
                          value={latClick}
                          readOnly
                          disabled={
                            (latClick === 0 && lngClick === 0) || isDeployed
                          }
                          required
                        />
                      </div>
                      <div className="flex flex-col w-1/2">
                        <label
                          className={`text-sm xl:text-md ${
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
                          disabled={
                            (latClick === 0 && lngClick === 0) || isDeployed
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="flex flex-row justify-between items-center w-full ">
                      <div className="">
                        {latClick !== 0 && lngClick !== 0 && !isDeployed && (
                          <button className="bg-[#0d9276] text-black text-sm xl:text-md py-1 xl:p-2 rounded-lg font-bold w-16 shadow-md shadow-black">
                            {isEdit ? "Edit" : "Add"}
                          </button>
                        )}
                      </div>
                      <div className="w-1/2">
                        {isEdit && !isDeployed && (
                          <button
                            className="bg-red-600 text-black text-sm xl:text-md py-1 xl:p-2 rounded-lg mt-1 font-bold w-16 shadow-md shadow-black"
                            onClick={() => {
                              handleDelete(String(editStruct?._id));
                              setIsDelete(true);
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <div className="flex flex-col justify-between w-1/2 m-2">
                <div className="flex flex-row justify-between w-full h-10">
                  <label
                    className={`mb-2 text-sm xl:text-xl font-bold ${
                      isEdit || (latClick !== 0 && lngClick !== 0)
                        ? `text-[#0d9276]`
                        : `text-gray-400`
                    }`}
                  >
                    Station Connection:
                  </label>

                  {!isEdit && (
                    <button
                      className={`text-2xl ${
                        latClick === 0 && lngClick === 0
                          ? "text-gray-400"
                          : "text-[#0d9276]"
                      } p-2 rounded-lg font-bold`}
                      disabled={latClick === 0 && lngClick === 0}
                      onClick={() => {
                        clearSearch();
                      }}
                    >
                      <IoMdCloseCircle />
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

                <div className="flex flex-row my-1">
                  <div
                    className={`flex text-sm ${
                      latClick === 0 && lngClick === 0
                        ? `bg-gray-400 text-gray-700`
                        : `bg-[#0d9276] text-[#dbe7c9]`
                    }  font-bold  rounded-l-lg w-auto h-auto xl:h-10 px-2 items-center`}
                  >
                    <FaSearch />
                  </div>
                  <input
                    className="bg-gray-200 y-1 w-full h-auto xl:h-10 text-black rounded-r-lg xl:rounded-none disabled:opacity-80 shadow-inner shadow-black"
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
                    }  font-bold rounded-r-lg w-auto h-10 px-2 items-center hidden xl:block`}
                    disabled={latClick === 0 && lngClick === 0}
                    onClick={() => setSearchConnectedTerm("")}
                  >
                    Clear
                  </button>
                </div>
                <div className="w-full h-40 xl:h-56 bg-[#dbe7c9] rounded-lg shadow-inner shadow-black">
                  {latClick === 0 && lngClick === 0 && (
                    <div className="text-sm xl:text-md text-center mt-10 xl:mt-20 font-bold px-3 text-gray-500">
                      {!isDeployed && (
                        <div>
                          Press on map or edit station to see connections.
                        </div>
                      )}
                      {isDeployed && (
                        <div className="text-sm xl:text-md text-center mt-10 xl:mt-20 font-bold px-3 text-gray-500">
                          Set the stations under maintentance to see
                          connections.
                        </div>
                      )}
                    </div>
                  )}

                  {latClick !== 0 && lngClick !== 0 && (
                    <div
                      className="max-h-40 xl:max-h-56"
                      style={{
                        // maxHeight: "220px",
                        overflowY: "auto",
                        scrollbarColor: "#0d9276 #dbe7c9",
                        scrollbarWidth: "thin",
                      }}
                    >
                      <div className="m-2">
                        {stations &&
                          !isDeployed &&
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
                                      className={`px-2 py-1 text-sm xl:text-md my-1 font-bold w-full rounded-lg  ${
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
