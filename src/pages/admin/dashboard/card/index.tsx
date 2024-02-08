import { Button, Label, Modal, TextInput } from "flowbite-react";
import React, { useState, useEffect, ChangeEvent } from "react";
import CardEdit from "../../../../components/CardEdit";
import { MdDelete } from "react-icons/md";
import { useAuthContext } from "../../../../hooks/useAuthContext";
import { FaCoins } from "react-icons/fa";
import { FaAddressCard } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { divIcon } from "leaflet";
import { toast } from "react-toastify";
import { clear } from "console";

interface Card {
  _id: string;
  uid: string;
  balance: number;
  isTap: boolean;
  in: string;
  history: [{ in: string; out: string; date: Date }];
}

interface CardLandingProps {}

const CardLanding: React.FC<CardLandingProps> = () => {
  const [cards, setCards] = useState<Card[] | null>(null);
  const [uid, setUID] = useState<string>(
    Math.floor(Math.random() * 1000000000000).toString()
  );
  const [balance, setBalance] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [emptyFields, setEmptyFields] = useState<string[]>([]);
  const [update, setUpdate] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isView, setisView] = useState(false);
  const [isAdd, setisAdd] = useState(false);
  const [isAddBalance, setisAddBalance] = useState(false);

  const [openModal, setOpenModal] = useState(false);

  const [onboardCount, setOnboardCount] = useState(0);
  const [offboardCount, setOffboardCount] = useState(0);

  const [cardInfo, setCardInfo] = useState<Card | null>(null);

  const { user } = useAuthContext();

  const api = process.env.REACT_APP_API_KEY;

  const clearSearch = () => {
    setCardInfo(null);
    setisView(false);
    setisAdd(false);
    setisAddBalance(false);
  };

  const addBalance = async (balance: number) => {
    if (cardInfo) {
      const response = await fetch(`${api}/api/cards/add/${cardInfo?._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.jwt}`,
        },
        body: JSON.stringify({ balance: balance }),
      });

      const json = await response.json();

      if (response.ok) {
        toast.success("Balance added successfully");
        setUpdate(!update);
        setCardInfo(json);
      }
      if (!response.ok) {
        toast.error("Cannot exceed 10000");
      }
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const card = { uid, balance };

    if (Number(card.balance) < 1) {
      return setError("Input cannot be negative.");
    }

    const postResponse = await fetch(`${api}/api/cards`, {
      method: "POST",
      body: JSON.stringify(card),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.jwt}`,
      },
    });

    const json = await postResponse.json();

    if (!postResponse.ok) {
      setError(json.error);
      setEmptyFields(json.emptyFields);
    }
    if (postResponse.ok) {
      setEmptyFields([]);
      setError(null);
      setUID(Math.floor(Math.random() * 1000000000000).toString());
      setBalance("");
      fetchCards();
      setOpenModal(false);
      setisAdd(false);
    }
  };

  const handleClickEdit = (card: Card) => {
    setCardInfo(card);
    setisView(true);
  };

  const handleDelete = async (card_id: String): Promise<void> => {
    if (user) {
      const isConfirmed = window.confirm(
        "Are you sure you want to delete this?"
      );

      if (isConfirmed) {
        const deleteResponse = await fetch(`${api}/api/cards/` + card_id, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.jwt}`,
          },
        });

        if (!deleteResponse.ok) {
          setError("Error!");
        }

        if (deleteResponse.ok) {
          toast.success("Card deleted successfully");
          setEmptyFields([]);
          setError(null);
          setUID(Math.floor(Math.random() * 1000000000000).toString());
          setBalance("");
          fetchCards();
          setCardInfo(null);
        }
      }
    }
  };

  const fetchCards = async () => {
    const response = await fetch(`${api}/api/cards`, {
      headers: {
        Authorization: `Bearer ${user.jwt}`,
      },
    });

    if (response.ok) {
      const json = await response.json();
      const onboardCount = json.filter(
        (card: { isTap: any }) => card.isTap
      ).length;
      const offboardCount = json.length - onboardCount;

      setOnboardCount(onboardCount);
      setOffboardCount(offboardCount);
      setCards(json);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCards();
    }
  }, [user, update]);

  return (
    <div className="bg-gray-800 h-screen animate__animated animate__fadeIn">
      <div className="flex flex-col lg:flex-row w-full">
        <div className="w-full lg:w-1/3">
          <div className="flex mx-3 mb-2 mt-24 p-2 bg-gray-600 rounded-lg space-x-2">
            <button
              onClick={(e) => {
                setisAdd(true);
                setisAddBalance(false);
                setCardInfo(null);
                setisView(false);
              }}
              className="bg-gray-900 font-bold py-2 px-3 rounded-lg w-1/3 text-white"
            >
              Generate Card
            </button>
            <input
              type="text"
              className="w-2/3 rounded-lg"
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
          </div>

          <div className="bg-gray-600 p-2 rounded-md shadow-md mx-3">
            <div className="table-container max-h-screen">
              <div
                style={{
                  maxHeight: "255px",
                  overflowY: "auto",
                  scrollbarColor: "dark",
                }}
              >
                <table className=" w-full bg-gray-500">
                  <thead className="bg-gray-800 sticky top-0">
                    <tr>
                      <th className=" px-4 sticky top-0 text-green-400 w-auto">
                        UID
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cards &&
                      cards
                        .filter((card: Card) =>
                          card.uid.toString().includes(searchTerm)
                        )
                        .map((card: Card, index: number) => {
                          return (
                            <tr
                              key={card._id}
                              className={`${
                                index % 2 === 0
                                  ? "bg-gray-400 hover:bg-gray-600"
                                  : "bg-gray-300 hover:bg-gray-500"
                              }`}
                              onClick={() => {
                                handleClickEdit(card);
                                setisAdd(false);
                              }}
                            >
                              <td className="py-2 px-4 font-bold text-center text-black">
                                {card.uid}
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
        <div className="w-full lg:w-2/3">
          <div
            className={`flex max-w-full mr-3 mb-5 mt-24 p-2 justify-center bg-gray-600 ${
              cardInfo && "bg-green-400"
            } rounded-lg space-x-2`}
          >
            <div className="flex flex-row bg-gray-800 p-3 rounded-md w-full">
              <div className="flex flex-col space-y-6 w-1/2 m-4 bg-gray-600 items-center justify-center rounded-lg p-4">
                <div
                  className={`text-gray-400 font-bold text-2xl ${
                    cardInfo && "text-green-400"
                  }`}
                >
                  CARD ID:{" "}
                  <span className="text-white">{cardInfo && cardInfo.uid}</span>
                </div>
                <div
                  className={`flex flex-row space-x-2 text-lg text-gray-400 w-full items-center justify-center ${
                    cardInfo && "text-green-400"
                  }`}
                >
                  <div className="text-2xl mr-2">
                    <FaCoins />
                  </div>
                  Balance:{" "}
                  <span className="text-white">
                    {cardInfo && <div>₱{cardInfo.balance}</div>}
                  </span>
                </div>
                <div
                  className={`flex flex-row space-x-2 text-lg text-gray-400 w-full items-center justify-center ${
                    cardInfo && "text-green-400"
                  }`}
                >
                  <div className="text-2xl mr-2">
                    <FaAddressCard />
                  </div>
                  Status:{" "}
                  <span className="text-white">
                    {cardInfo && (
                      <div>{cardInfo.isTap ? "Tapped In" : "Tapped Off"}</div>
                    )}
                  </span>
                </div>
                <div className="flex flex-row justify-between w-full px-8">
                  <button
                    disabled={cardInfo ? false : true}
                    onClick={() => {
                      setisAddBalance(true);
                      setisAdd(false);
                    }}
                    className="bg-gray-800 px-3 py-1 rounded-lg shadow-lg font-bold hover:shadow-green-400 text-green-400 disabled:text-gray-400"
                  >
                    Add
                  </button>
                  {/* <button
                    disabled={cardInfo ? false : true}
                    className="bg-gray-800 px-3 py-1 rounded-lg shadow-lg font-bold hover:shadow-green-400 text-green-400 disabled:text-gray-400"
                  >
                    Edit
                  </button> */}

                  <button
                    disabled={cardInfo ? false : true}
                    onClick={() => {
                      cardInfo && handleDelete(cardInfo._id);
                    }}
                    className="bg-gray-800 px-3 py-1 rounded-lg shadow-lg font-bold hover:shadow-green-400 text-green-400 disabled:text-gray-400"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="bg-gray-600 w-1/2 m-4 rounded-lg">
                <div className="p-4 text-center">
                  <div
                    className={`flex text-gray-400 font-bold text-xl w-full justify-between items-center mb-4 ${
                      cardInfo && "text-green-400"
                    }`}
                  >
                    <label htmlFor="">Travel History:</label>
                    {isView && (
                      <button onClick={clearSearch} className="text-2xl">
                        <IoMdCloseCircle />
                      </button>
                    )}
                  </div>
                  <div className="table-container h-custom-max-height">
                    {cardInfo ? (
                      <div
                        style={{
                          maxHeight: "185px",
                          overflowY: "auto",
                          scrollbarColor: "dark",
                        }}
                      >
                        <table className="w-full bg-gray-500">
                          <thead className="bg-gray-900 sticky z-50 top-0">
                            <tr className="py-2 px-4 sticky text-green-400">
                              <th className="p-2">From</th>
                              <th className="p-2">To</th>
                              <th className="p-2">Date</th>
                            </tr>
                          </thead>
                          <tbody className="z-0">
                            {cardInfo && cardInfo.history.length > 0 ? (
                              cardInfo.history.map((transaction, index) => (
                                <tr
                                  key={index}
                                  className={`hover:bg-gray-500 animate__animated animate__fadeIn ${
                                    index % 2 === 0
                                      ? "bg-gray-400"
                                      : "bg-gray-300"
                                  }`}
                                >
                                  <td className="p-2 text-black">
                                    {transaction.in}
                                  </td>
                                  <td className="p-2 text-black">
                                    {transaction.out}
                                  </td>
                                  <td className="p-2 text-black">
                                    {transaction.date.toString().split("T")[0]}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={3} className="p-2 text-black">
                                  No travel history available.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center">
                        Press a card to see travel history.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row w-full">
        <div className="w-1/3">
          <div className="flex max-w-full mr-3 mb-5 p-2 justify-center bg-gray-600 rounded-lg space-x-2 h-full mx-3">
            <div className="flex flex-row bg-gray-800 py-3 px-6 rounded-md w-full">
              <div className="flex flex-col justify-start items-center w-1/2 border-r-2 border-gray-700">
                <div className="text-white">onboard</div>
                <div className="text-green-400 font-bold text-6xl my-16">
                  {onboardCount}
                </div>
              </div>
              <div className="flex flex-col justify-start items-center w-1/2">
                <div className="text-white">offboard</div>
                <div className="text-green-400 font-bold text-6xl my-16">
                  {offboardCount}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/3">
          <div
            className={`flex max-w-full mr-3 mb-5 p-2 justify-center bg-gray-600 ${
              (isAdd || isAddBalance) && "bg-green-400"
            } rounded-lg space-x-2 h-full`}
          >
            {isAdd && (
              <div className="flex flex-col space-y-6 bg-gray-800 py-3 px-6 rounded-md w-full">
                <div className="flex flex-row w-full justify-between">
                  <div className="flex flex-row justify-between w-full">
                    <label className="text-green-400 font-bold text-xl">
                      Generate Card
                    </label>
                    <button
                      onClick={() => setisAdd(false)}
                      className="text-green-400 text-2xl"
                    >
                      <IoMdCloseCircle />
                    </button>
                  </div>
                </div>
                <form onSubmit={handleCreate} className="flex flex-col">
                  {" "}
                  <label className="text-green-400 font-bold">
                    Random generated UID:{" "}
                    <span className="text-gray-400">{uid}</span>
                  </label>
                  <label className="font-bold">Balance:</label>
                  <input
                    type="number"
                    className="rounded-lg text-black"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setBalance(e.target.value)
                    }
                    value={balance}
                  />
                  <button className="mt-6 bg-gray-600 text-green-400 font-bold mx-10 rounded-lg py-2">
                    generate
                  </button>
                </form>
              </div>
            )}
            {isAddBalance && (
              <div className="flex flex-col space-y-6 bg-gray-800 py-3 px-6 rounded-md w-full">
                <label className="text-green-400 font-bold text-xl">
                  Quick Add Balance:
                </label>
                <div className="flex flex-col w-full justify-center">
                  <div>Card ID: {cardInfo && cardInfo.uid}</div>
                  <div>Balance: ₱{cardInfo && cardInfo.balance}</div>
                </div>
                <div className="flex flex-col space-y-6 px-4">
                  <div className="grid grid-cols-5 space-x-2">
                    <button
                      onClick={() => {
                        addBalance(1);
                      }}
                      className="bg-gray-600 px-4 py-1 rounded-lg shadow-lg hover:shadow-green-400 text-green-400 font-bold"
                    >
                      1
                    </button>
                    <button
                      onClick={() => {
                        addBalance(5);
                      }}
                      className="bg-gray-600 px-4 py-1 rounded-lg shadow-lg hover:shadow-green-400 text-green-400 font-bold"
                    >
                      5
                    </button>
                    <button
                      onClick={() => {
                        addBalance(10);
                      }}
                      className="bg-gray-600 px-4 py-1 rounded-lg shadow-lg hover:shadow-green-400 text-green-400 font-bold"
                    >
                      10
                    </button>
                    <button
                      onClick={() => {
                        addBalance(20);
                      }}
                      className="bg-gray-600 px-4 py-1 rounded-lg shadow-lg hover:shadow-green-400 text-green-400 font-bold"
                    >
                      20
                    </button>
                    <button
                      onClick={() => {
                        addBalance(50);
                      }}
                      className="bg-gray-600 px-4 py-1 rounded-lg shadow-lg hover:shadow-green-400 text-green-400 font-bold"
                    >
                      50
                    </button>
                  </div>
                  <div className="grid grid-cols-5 space-x-2">
                    <button
                      onClick={() => {
                        addBalance(100);
                      }}
                      className="bg-gray-600 px-4 py-1 rounded-lg shadow-lg hover:shadow-green-400 text-green-400 font-bold"
                    >
                      100
                    </button>
                    <button
                      onClick={() => {
                        addBalance(200);
                      }}
                      className="bg-gray-600 px-4 py-1 rounded-lg shadow-lg hover:shadow-green-400 text-green-400 font-bold"
                    >
                      200
                    </button>
                    <button
                      onClick={() => {
                        addBalance(500);
                      }}
                      className="bg-gray-600 px-4 py-1 rounded-lg shadow-lg hover:shadow-green-400 text-green-400 font-bold"
                    >
                      500
                    </button>
                    <button
                      onClick={() => {
                        addBalance(1000);
                      }}
                      className="bg-gray-600 px-4 py-1 rounded-lg shadow-lg hover:shadow-green-400 text-green-400 font-bold"
                    >
                      1000
                    </button>
                    <button
                      onClick={() => {
                        addBalance(2000);
                      }}
                      className="bg-gray-600 px-4 py-1 rounded-lg shadow-lg hover:shadow-green-400 text-green-400 font-bold"
                    >
                      2000
                    </button>
                  </div>
                </div>
              </div>
            )}
            {!isAdd && !isAddBalance && (
              <div className="flex flex-col space-y-8 bg-gray-800 py-3 px-6 rounded-md w-full text-center">
                <label className="my-24">
                  Press an Action to open this panel
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardLanding;
