// import { Button, Dropdown, Label, Modal, TextInput } from "flowbite-react";
import React, { ChangeEvent, useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { useAuthContext } from "../../../../hooks/useAuthContext";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import MapComponent from "../../../../components/MapComponent";
// import { Icon, LatLng, LatLngExpression, latLng } from "leaflet";
import { FaRegEdit } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";

// import { stat } from "fs";

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
          setError(
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

          console.log("under 500", distance);
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

    // Clear input fields
    setStationName("");
    setLngClick(0);
    setLatClick(0);
    setConnections([]);

    // Fetch updated list of stations
    fetchStations();
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
    e.preventDefault(); // Prevent default form submission

    console.log("Edit STructure", editStruct);

    // Patch the station with updated information
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

    // Check if the request was successful
    if (response.ok) {
      fetchStations();
    } else {
      console.error("Failed to update station");
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
    setStationName(station.name);
    setLatClick(station.lat);
    setLngClick(station.long);
    setConnections(station.connection);
    setIsEdit(true);
    setEditStruct(station);
  };

  // const handleClickView = (station: Station) => {
  //   setStationName(station.name);
  //   setLatClick(station.lat);
  //   setLngClick(station.long);
  //   setConnections(station.connection);
  // };

  const handleDelete = async (station: String): Promise<void> => {
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
        // setError("ERROR");
      }

      if (deleteResponse.ok) {
        // setEmptyFields([]);
        // setError(null);
        // setUID("");
        // setName("");
        // setLong("");
        // setLat("");
        fetchStations();
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
    fetchStations();
  }, []);

  return (
    <div className="CardLanding bg-gray-800 h-screen">
      <div className="flex flex-col lg:flex-row h-screen">
        <div className="w-full lg:w-1/2">
          <div className="flex max-w-full mx-5 mb-5 mt-24 p-2 justify-center bg-gray-700 rounded-lg">
            <div className="flex bg-green-400 text-gray-700 font-bold rounded-l-lg w-auto h-10 px-2 items-center">
              Search
            </div>
            <input
              type=""
              className="bg-gray-200 w-full h-10 text-black"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
            />
            <button
              className="flex bg-green-400 text-gray-700 font-bold  rounded-r-lg w-auto h-10 px-2 items-center"
              onClick={clearSearch}
            >
              Clear
            </button>
          </div>

          <div className="bg-gray-700 p-2 rounded-md shadow-md mx-5">
            <div className="table-container max-h-screen">
              <div
                style={{
                  maxHeight: "502px",
                  overflowY: "auto",
                  scrollbarColor: "dark",
                }}
              >
                <table className=" w-full bg-gray-500">
                  <thead className="bg-gray-900 sticky top-0">
                    <tr>
                      <th className="py-2 px-4 sticky top-0 text-green-400">
                        Station Name
                      </th>
                      <th className="py-2 px-4 sticky top-0 text-green-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
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
                              className={
                                index % 2 === 0 ? "bg-gray-400" : "bg-gray-300"
                              }
                            >
                              <td className="font-bold text-center text-black">
                                {station.name}
                              </td>
                              <td className="py-2 px-4 font-normal text-center w-10">
                                <div className="flex flex-row justify-center items-center space-x-2">
                                  <button
                                    className="bg-gray-800 text-green-400 px-2 py-1 rounded-lg"
                                    onClick={() => handleClickEdit(station)}
                                  >
                                    <FaRegEdit />
                                  </button>
                                  {/* 
                                  <StationModel
                                    stationID={station._id}
                                    fetchStations={fetchStations}
                                  /> */}

                                  <button
                                    className="bg-gray-800 w-15 rounded-lg text-red-500 text-sm py-1 px-2 font-semibold"
                                    onClick={(e) => handleDelete(station._id)}
                                  >
                                    <MdDelete />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* FOR EDIT, ADD */}
        <div className="flex flex-col w-full lg:w-1/2 h-full z-10">
          <div className="flex h-80 items-center justify-center bg-gray-700 mx-5 my-2 lg:mr-2 p-2 rounded-lg lg:mt-24 ">
            <MapContainer
              center={[14.65216, 121.03225]}
              zoom={13}
              zoomControl={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapComponent
                setLatClicked={setLatClick}
                setLngClicked={setLngClick}
              />

              <Marker position={[latClick, lngClick]} />

              {/* Event handler */}
              {stations &&
                stations.map((station: Station) => (
                  <div key={station._id}>
                    <Marker position={[station.lat, station.long]}>
                      <Popup>{station.name}</Popup>
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
                          />
                        );
                      }
                      return null;
                    })}
                  </div>
                ))}
            </MapContainer>
          </div>
          <div className="flex justify-center items-center w-auto h-1/2 z-10 bg-gray-700 mx-5 mt-2 lg:mx-2 lg:ml-5 rounded-lg py-2 mb-2">
            <div className="flex flex-row bg-gray-900 m-2 h-full w-full rounded-lg">
              <div className="flex flex-col w-1/2 m-2">
                <div className="flex flex=row justify-between">
                  <div
                    className={`text-xl font-bold ${
                      isEdit || (latClick !== 0 && lngClick !== 0)
                        ? `text-green-400`
                        : `text-gray-500`
                    }`}
                  >
                    {latClick !== 0 && lngClick !== 0
                      ? `Station ${isEdit ? "Edit" : "Add"}`
                      : "Station"}
                  </div>
                  {!isEdit && (
                    <button
                      className="bg-green-400 text-black p-2 rounded-lg font-bold"
                      onClick={clearSearch}
                    >
                      Clear
                    </button>
                  )}
                  {isEdit && (
                    <button
                      className="bg-green-400 text-black p-2 rounded-lg font-bold"
                      onClick={(e) => {
                        clearSearch();
                        setIsEdit(false);
                      }}
                    >
                      <IoMdCloseCircle />
                    </button>
                  )}
                </div>
                <div className="">
                  <form
                    action=""
                    className="flex flex-col w-full justify-between space-y-4"
                    onSubmit={isEdit ? handleEdit : handleCreate}
                  >
                    <label>Station Name:</label>
                    <input
                      type="text"
                      className="rounded-lg text-black"
                      value={stationName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setStationName(e.target.value);
                      }}
                      readOnly={latClick === 0 && lngClick === 0}
                      required
                    />
                    <div className="flex flex-row w-auto">
                      <div className="flex flex-col w-1/2">
                        <label>Latitude:</label>
                        <input
                          type="text"
                          className="w-20 rounded-lg text-black"
                          value={latClick}
                          readOnly
                          required
                        />
                      </div>
                      <div className="flex flex-col">
                        <label>Longitude:</label>
                        <input
                          type="text"
                          className="w-20 rounded-lg text-black"
                          value={lngClick}
                          readOnly
                          required
                        />
                      </div>
                    </div>
                    <div>
                      {latClick !== 0 && lngClick !== 0 && (
                        <button className="bg-green-400 text-black p-2 rounded-lg font-bold">
                          {isEdit ? "Edit" : "Add"}
                        </button>
                      )}
                      {error && <div className="text-red-600">{error}</div>}
                    </div>
                  </form>
                </div>
              </div>
              <div className="flex flex-col justify-between w-1/2 m-2">
                <label
                  className={`mb-2 text-xl font-bold ${
                    isEdit || (latClick !== 0 && lngClick !== 0)
                      ? `text-green-400`
                      : `text-gray-500`
                  }`}
                >
                  Station Connection:
                </label>
                <div className="flex flex-row">
                  <div className="flex bg-green-400 text-gray-700 font-bold rounded-l-lg w-auto h-10 px-2 items-center">
                    Search
                  </div>
                  <input
                    type=""
                    className="bg-gray-200 w-full h-10 text-black"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchConnectedTerm(e.target.value);
                    }}
                  />
                  <button
                    className="flex bg-green-400 text-gray-700 font-bold  rounded-r-lg w-auto h-10 px-2 items-center"
                    onClick={clearSearch}
                  >
                    Clear
                  </button>
                </div>
                <div className="w-full h-56 bg-gray-800 rounded-lg">
                  {latClick !== 0 && lngClick !== 0 && (
                    <div
                      style={{
                        maxHeight: "220px",
                        overflowY: "auto",
                        scrollbarColor: "dark",
                      }}
                    >
                      <div className="m-2">
                        {stations?.map((station: Station, index) => (
                          <div key={index}>
                            {station.name !== editStruct?.name && ( // Check if it's not the current station's name
                              <button
                                onClick={() => handleConnectionClick(station)}
                                className={`px-2 py-1 my-1 font-bold w-full ${
                                  connections.includes(station._id)
                                    ? "bg-green-400 text-black"
                                    : "bg-gray-700 text-white"
                                }`}
                              >
                                {station.name}
                              </button>
                            )}
                          </div>
                        ))}
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
