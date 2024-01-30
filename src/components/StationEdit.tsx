import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { FaRegEdit } from "react-icons/fa";
import { useAuthContext } from "../hooks/useAuthContext";

interface Station {
  _id: string;
  uid: string;
  name: string;
  long: number;
  lat: number;
}

interface ManageStationModelProps {
  stationID: string;
  fetchStations: () => Promise<void>;
}

const StationModel: React.FC<ManageStationModelProps> = ({
  stationID,
  fetchStations,
}) => {
  const [formData, setFormData] = useState<Station>({
    _id: "0",
    uid: "0",
    name: "",
    long: 0,
    lat: 0,
  });

  const [isOpen, setIsOpen] = useState(false);

  const { user } = useAuthContext();
  const api = process.env.REACT_APP_API_KEY;

  const handleButton = () => {
    isOpen ? setIsOpen(false) : setIsOpen(true);
  };

  useEffect(() => {
    const fetchStationData = async () => {
      try {
        const response = await fetch(`${api}/api/stations/${stationID}`, {
          headers: {
            Authorization: `Bearer ${user.jwt}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        setFormData({
          _id: responseData._id,
          uid: responseData.uid,
          name: responseData.name,
          long: parseFloat(responseData.long),
          lat: parseFloat(responseData.lat),
        });
      } catch (error) {
        console.error("Error fetching fare data:", error);
      }
    };

    fetchStationData();
    console.log(formData);
  }, [stationID]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "lat" ? parseFloat(value) : value,
    }));
    fetchStations();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `https://mrt-server-shg0.onrender.com/api/stations/${stationID}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.jwt}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log(responseData);
      setIsOpen(false);
      fetchStations();
    } catch (error) {
      console.error("Error updating station:", error);
    }
  };

  return (
    <div>
      <button
        onClick={handleButton}
        className="bg-gray-800 w-7 rounded-lg text-green-400 text-sm py-1 px-2 font-semibold"
      >
        <FaRegEdit />
      </button>
      {isOpen && (
        <div className="i want this only to open when isopen is true">
          <div className="flex flex-col">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col"></div>
              <div className="flex flex-col">
                <label className="font-semibold w-full text-left text-xs md:text-lg">
                  Station Name:
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  className="rounded-lg h-8 w-20 md:h-10 md:w-48"
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold w-full text-left text-xs md:text-lg">
                  Latitude:
                </label>
                <input
                  type="number"
                  name="lat"
                  value={formData.lat}
                  className="rounded-lg h-8 w-20 md:h-10 md:w-48"
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold w-full text-left text-xs md:text-lg">
                  Longitude:
                </label>
                <input
                  type="number"
                  name="long"
                  value={formData.long}
                  className="rounded-lg h-8 w-20 md:h-10 md:w-48"
                  onChange={handleChange}
                />
              </div>
              <button
                className="bg-gray-800 w-18 rounded-lg text-green-400 text-sm py-1 px-2 font-semibold mt-2"
                type="submit"
              >
                Update
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationModel;
