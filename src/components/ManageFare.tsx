import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { FaCheck } from "react-icons/fa";
import { useAuthContext } from "../hooks/useAuthContext";

interface Fare {
  minimumAmount: number;
  perKM: number;
}

interface ManageFareProps {}

const ManageFare: React.FC<ManageFareProps> = () => {
  const [formData, setFormData] = useState<Fare>({
    minimumAmount: 0,
    perKM: 0,
  });

  const [message, setMessage] = useState<String | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuthContext();
  const api = process.env.REACT_APP_API_KEY;

  const handleFareSubmit = () => {
    console.log(user);
    if (!user) {
      setMessage(error);
    } else {
      setMessage("Updated");
    }
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  useEffect(() => {
    const fetchFareData = async () => {
      try {
        const fareId = "65c28317dd50fe2e56d242c9";
        const response = await fetch(`${api}/api/fr/${fareId}`, {
          headers: {
            Authorization: `Bearer ${user.jwt}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();

        setFormData({
          minimumAmount: responseData.minimumAmount,
          perKM: responseData.perKM,
        });
      } catch (error) {
        console.error("Error fetching fare data:", error);
      }
    };

    fetchFareData();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: parseFloat(value),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const fareId = "65c28317dd50fe2e56d242c9";
      const response = await fetch(`${api}/api/fr/${fareId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.jwt}`,
        },
        body: JSON.stringify(formData),
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating fare:", error);
    }
  };

  return (
    <div className="">
      <div className="modal-overlay">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-row space-x-2 mx-2 w-full items-center justify-center">
              <div className="flex flex-row w-1/2 justify-between">
                <div className="flex flex-col space-y-2">
                  <label className="text-green-400 font-bold">
                    Starting Fare:
                  </label>
                  <input
                    type="number"
                    name="minimumAmount"
                    value={formData.minimumAmount}
                    onChange={handleChange}
                    className="h-6 w-16 rounded-lg p-1 ml-3 text-black"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-green-400 font-bold">
                    Rate per/KM:
                  </label>
                  <input
                    type="number"
                    name="perKM"
                    value={formData.perKM}
                    onChange={handleChange}
                    className="h-6 w-16 rounded-lg p-1 ml-3 text-black"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="text-green-400 bg-gray-700 rounded-lg px-2 h-6 mt-3"
                onClick={() => {
                  handleFareSubmit();
                }}
              >
                <FaCheck />
              </button>
              <div className="text-green-400 mt-3">{message}</div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageFare;
