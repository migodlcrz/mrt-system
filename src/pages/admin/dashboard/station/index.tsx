import { Button, Label, Modal, TextInput } from "flowbite-react";
import React, { ChangeEvent, useEffect, useState } from "react";
import StationModel from "../../../../components/StationEdit";
import { MdDelete } from "react-icons/md";
import { useAuthContext } from "../../../../hooks/useAuthContext";

interface Station {
  _id: string;
  uid: number;
  name: string;
  long: number;
  lat: number;
}

interface StationLandingProps {}

const StationLanding: React.FC<StationLandingProps> = () => {
  const [stations, setStations] = useState<Station[] | null>(null);
  const [uid, setUID] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [long, setLong] = useState<string>("");
  const [lat, setLat] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  // const [emptyFields, setEmptyFields] = useState<string[]>([]);
  const { user } = useAuthContext();

  const [openModal, setOpenModal] = useState(false);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const station = { uid, name, long, lat };

    const postResponse = await fetch(
      "https://mrt-server-shg0.onrender.com/api/stations",
      {
        method: "POST",
        body: JSON.stringify(station),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.jwt}`,
        },
      }
    );

    const json = await postResponse.json();

    if (!postResponse.ok) {
      setError(json.error);
      // setEmptyFields(json.emptyFields);
    }

    if (postResponse.ok) {
      // setEmptyFields([]);
      setError(null);
      setUID("");
      setName("");
      setLat("");
      setLong("");
      fetchStations();
      setOpenModal(false);
    }
  };

  const handleDelete = async (station: String): Promise<void> => {
    const isConfirmed = window.confirm("Are you sure you want to delete this?");

    if (isConfirmed) {
      const deleteResponse = await fetch(
        "https://mrt-server-shg0.onrender.com/api/stations/" + station,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.jwt}`,
          },
        }
      );

      if (!deleteResponse.ok) {
        setError("ERROR");
      }

      if (deleteResponse.ok) {
        // setEmptyFields([]);
        setError(null);
        setUID("");
        setName("");
        setLong("");
        setLat("");
        fetchStations();
      }
    }
  };

  const fetchStations = async () => {
    const response = await fetch(
      "https://mrt-server-shg0.onrender.com/api/stations",
      {
        headers: {
          Authorization: `Bearer ${user.jwt}`,
        },
      }
    );
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
      <div className="flex flex-col">
        <div>
          <div className="flex max-w-full mx-5 mb-5 mt-28 p-4 justify-center bg-gray-600 rounded-lg">
            <Button
              className="bg-gray-800 text-green-400 font-bold hover:text-green-500"
              onClick={() => {
                setOpenModal(true);
              }}
            >
              CREATE STATION
            </Button>
            <Modal
              show={openModal}
              onClose={() => {
                setOpenModal(false);
                setError(null);
              }}
            >
              <Modal.Header className="bg-gray-900">
                <div className="text-green-400 font-bold">CREATE STATION</div>
              </Modal.Header>
              <Modal.Body className="bg-gray-800">
                <form className="create" onSubmit={handleCreate}>
                  <Label className="text-green-400">Station ID:</Label>
                  <TextInput
                    type="number"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setUID(e.target.value)
                    }
                    value={uid}
                  />
                  <Label className="text-green-400">Station Name:</Label>
                  <TextInput
                    type="text"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setName(e.target.value)
                    }
                    value={name}
                  />
                  <Label className="text-green-400">Latitude:</Label>
                  <TextInput
                    type="text"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setLat(e.target.value)
                    }
                    value={lat}
                  />
                  <Label className="text-green-400">Longitude:</Label>
                  <TextInput
                    type="number"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setLong(e.target.value)
                    }
                    value={long}
                  />

                  <button>
                    <Button className="mt-5 bg-gray-700 hover:bg-gray-900">
                      <div className="text-green-400">Add Station</div>
                    </Button>
                  </button>
                  {error && (
                    <div className="text-red-500 font-bold m-2">{error}</div>
                  )}
                </form>
              </Modal.Body>
              <Modal.Footer className="bg-gray-900" />
            </Modal>
          </div>

          <div className="bg-gray-600 p-3 rounded-md shadow-md mx-5">
            <div className="table-container max-h-screen">
              <div
                style={{
                  maxHeight: "460px",
                  overflowY: "auto",
                  scrollbarColor: "dark",
                }}
              >
                <table className=" w-full bg-gray-500">
                  <thead className="bg-gray-800 sticky top-0">
                    <tr>
                      <th className=" px-4 sticky top-0 text-green-400">UID</th>
                      <th className="py-2 px-4 sticky top-0 text-green-400">
                        Station Name
                      </th>
                      <th className="py-2 px-4 sticky top-0 text-green-400">
                        Latitude
                      </th>
                      <th className="py-2 px-4 sticky top-0 text-green-400">
                        Longitude
                      </th>
                      <th className="py-2 px-4 sticky top-0 text-green-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stations &&
                      stations.map((station: Station, index) => {
                        return (
                          <tr
                            key={station._id}
                            className={
                              index % 2 === 0 ? "bg-gray-400" : "bg-gray-300"
                            }
                          >
                            <td className="font-bold text-center">
                              {station.uid}
                            </td>
                            <td className="font-bold text-center">
                              {station.name} Station
                            </td>
                            <td className="font-bold text-center">
                              {station.lat}
                            </td>
                            <td className="font-bold text-center w-15">
                              {station.long}
                            </td>
                            <td className="py-2 px-4 font-normal text-center w-10">
                              <div className="flex flex-row justify-center items-center space-x-2">
                                <StationModel
                                  stationID={station._id}
                                  fetchStations={fetchStations}
                                />

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
      </div>
    </div>
  );
};

export default StationLanding;
