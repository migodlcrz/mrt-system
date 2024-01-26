import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { FaPlus } from "react-icons/fa";

interface Card {
  _id: string;
  uid: string;
  balance: number;
}

interface ManageCardModelProps {
  card: Card;
  update: () => void;
  // fetchCards: () => Promise<void>;
}

const CardModel: React.FC<ManageCardModelProps> = ({ card, update }) => {
  const { user } = useAuthContext();

  const [formData, setFormData] = useState<Card>({
    _id: "0",
    uid: "0",
    balance: 0,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleButton = () => {
    isOpen ? setIsOpen(false) : setIsOpen(true);
    setError(null);
  };

  // const fetchCardData = async () => {
  //   try {
  //     const response = await fetch(`/api/cards/${card._id}`, {
  //       headers: {
  //         Authorization: `Bearer ${user.jwt}`,
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //     }

  //     const responseData = await response.json();

  //     console.log("BALANCE", formData.balance);

  //     setFormData({
  //       _id: responseData._id,
  //       uid: responseData.uid,
  //       balance: 0,
  //     });
  //   } catch (error) {
  //     console.error("Error fetching fare data:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchCardData();
  // }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      balance: 0,
    }));

    setFormData((prevData) => ({
      ...prevData,
      balance: parseFloat(value),
    }));

    // fetchCards();
  };

  //FIX
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (formData.balance < 1) {
      return setError("Invalid input");
    }

    try {
      const response = await fetch(`/api/cards/${card._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.jwt}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setIsOpen(false);
      // fetchCards();
      update();
    } catch (error) {
      console.error("Error updating fare:", error);
    }
  };

  return (
    <div>
      <button
        onClick={handleButton}
        className="bg-gray-800 rounded-lg text-green-400 text-sm py-1 px-2 font-semibold w-7"
      >
        <FaPlus />
      </button>
      {isOpen && (
        <div className="i want this only to open when isopen is true">
          <div className="flex flex-col">
            {/* FIX */}
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col">
                <label className="font-semibold w-full text-left text-xs md:text-lg">
                  Balance:{" "}
                  {error && (
                    <span className="text-red-800 font-bold text-sm">
                      {error}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  name="balance"
                  // value={formData.balance}
                  className="rounded-lg h-8 w-20 md:h-10 md:w-48"
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                className="bg-gray-800 w-18 rounded-lg text-green-400 text-sm py-1 px-2 font-semibold mt-2"
                type="submit"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardModel;
