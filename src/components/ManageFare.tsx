import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { FaCheck } from "react-icons/fa";
import { useAuthContext } from "../hooks/useAuthContext";
import { toast } from "react-toastify";

interface Fare {
  minimumAmount: number;
  perKM: number;
}

interface Status {
  isDeployed: boolean;
}

interface ManageFareProps {}

const ManageFare: React.FC<ManageFareProps> = () => {
  const [formData, setFormData] = useState<Fare>({
    minimumAmount: 0,
    perKM: 0,
  });

  const [isEdit, setIsEdit] = useState(false);
  const [isDeployed, setisDeployed] = useState(false);

  const { user } = useAuthContext();
  const api = process.env.REACT_APP_API_KEY;

  useEffect(() => {
    fetchFareData();
    fetchStatus();
  }, []);

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

      if (response.ok) {
        toast.success("Fare successfully updated.");
        setIsEdit(false);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating fare:", error);
    }
  };

  return (
    <div className="flex flex-col w-auto h-full bg-[#0d9276]">
      <div className="flex flex-col lg:flex-row">
        <div className="w-auto lg:w-full justify-center bg-[#dbe7c9] shadow-inner shadow-black m-5 rounded-lg text-center p-4">
          <div>Starting Fare:</div>
          {formData.minimumAmount && !isNaN(formData.minimumAmount) ? (
            <div className="text-[#0d9276] font-bold text-4xl">
              ₱{formData.minimumAmount.toFixed(2)}
            </div>
          ) : null}
        </div>

        <div className="w-auto lg:w-full justify-center bg-[#dbe7c9] shadow-inner shadow-black m-5 rounded-lg text-center p-4">
          <div>Fare per/KM:</div>
          <div className="text-[#0d9276] font-bold text-4xl">
            {formData.perKM && !isNaN(formData.perKM) ? (
              <div className="text-[#0d9276] font-bold text-4xl">
                ₱{formData.perKM.toFixed(2)}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex justify-center my-4">
        <button
          className=" shadow-lg shadow-black bg-[#dbe7c9] focus:shadow-inner focus:shadow-black px-2 rounded-lg font-bold text-[#0d9276]"
          onClick={() => {
            setIsEdit(!isEdit);
          }}
        >
          {!isDeployed && "Edit"}
        </button>
      </div>
      {isEdit && (
        <div className="flex w-full justify-center">
          <form method="dialog" className="w-full" onSubmit={handleSubmit}>
            <div className="flex flex-col w-full items-center justify-center px-20">
              <div className="flex flex-row w-full justify-between space-x-10">
                <div className="flex flex-col">
                  <label htmlFor=""></label>
                  <input
                    type="number"
                    min={1}
                    name="minimumAmount"
                    value={formData.minimumAmount}
                    onChange={handleChange}
                    required
                    onKeyPress={(e) => {
                      if (e.key === "e" || e.key === "-" || e.key === "+") {
                        e.preventDefault();
                      } else if (
                        (e.target as HTMLInputElement).value.length >= 5 &&
                        e.key !== "Backspace"
                      ) {
                        e.preventDefault();
                      }
                    }}
                    className="h-6 w-full rounded-lg px-2 py-4 text-black shadow-inner shadow-black"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <input
                    type="number"
                    min={1}
                    name="perKM"
                    value={formData.perKM}
                    onChange={handleChange}
                    required
                    onKeyPress={(e) => {
                      if (e.key === "e" || e.key === "-" || e.key === "+") {
                        e.preventDefault();
                      } else if (
                        (e.target as HTMLInputElement).value.length >= 5 &&
                        e.key !== "Backspace"
                      ) {
                        e.preventDefault();
                      }
                    }}
                    className="h-6 w-full rounded-lg px-2 py-4 text-black shadow-inner shadow-black"
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="bg-[#dbe7c9] text-[#0d9276] px-2 rounded-lg shadow-lg shadow-black my-4"
                >
                  Update
                </button>
                {/* <button
                  type="submit"
                  className="btn text-[#0d9276] bg-[#dbe7c9] shadow-lg shadow-black rounded-lg px-2 h-6"
                >
                  Update
                </button> */}
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageFare;
