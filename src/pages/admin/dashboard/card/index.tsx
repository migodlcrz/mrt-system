import React, { useState, useEffect, ChangeEvent } from "react";
import { useAuthContext } from "../../../../hooks/useAuthContext";
import { FaCoins, FaAddressCard, FaPlus } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { toast } from "react-toastify";
import { GrStatusGoodSmall } from "react-icons/gr";
import ProgressBar from "@ramonak/react-progress-bar";
import { popup } from "leaflet";
import e from "cors";

interface Card {
  _id: string;
  uid: string;
  balance: number;
  isTap: boolean;
  in: string;
  history: [{ in: string; out: string; date: Date }];
}

interface Fare {
  _id: string;
  minimumAmount: number;
  perKM: number;
}

interface CardLandingProps {}

const CardLanding: React.FC<CardLandingProps> = () => {
  const [cards, setCards] = useState<Card[] | null>(null);
  const [fare, setFare] = useState<Fare | null>(null);
  const [uid, setUID] = useState<string>(
    Math.floor(Math.random() * 1000000000000).toString()
  );
  const [addBalanceTerm, setAddBalanceTerm] = useState(0);
  const [balance, setBalance] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [emptyFields, setEmptyFields] = useState<string[]>([]);
  const [update, setUpdate] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isView, setisView] = useState(false);
  const [isAdd, setisAdd] = useState(false);
  const [isAddBalance, setisAddBalance] = useState(false);

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

  const scrollToTarget = (target: string) => {
    const targetElement = document.getElementById(target);

    if (targetElement) {
      if (target === "top") {
        targetElement.scrollIntoView({ behavior: "smooth" });
      } else {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const addBalance = async (
    e: React.FormEvent<HTMLFormElement>,
    balance: number
  ) => {
    e.preventDefault();

    if (fare) {
      if (balance === 0) {
        toast.error("Cannot add zero value.");
        setAddBalanceTerm(0);
        return;
      }
      if (balance < fare.minimumAmount) {
        toast.error("Cannot add balance below minimum.");
        setAddBalanceTerm(0);
        return;
      }
    }
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
        setAddBalanceTerm(0);
      }
      if (!response.ok) {
        toast.error("Cannot exceed 10000");
      }
    }
  };

  const fetchFare = async () => {
    const fareId = "65c28317dd50fe2e56d242c9";
    const getResponse = await fetch(`${api}/api/fr/${fareId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = await getResponse.json();
    if (getResponse.ok) {
      setFare(json);
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const card = { uid, balance };

    if (Number(card.balance) < 1) {
      toast.error("Input Invalid.");
      return;
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
      scrollToTarget("top");
      setEmptyFields([]);
      setError(null);
      setUID(Math.floor(Math.random() * 1000000000000).toString());
      setBalance("");
      fetchCards();
      setisAdd(false);
      toast.success("Card created successfully.");
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
      fetchFare();
      fetchCards();
      fetchFare();
    }
  }, [user, update, addBalanceTerm]);

  return (
    <div
      id="top"
      className="flex flex-col xl:flex-row xl:pb-[17px] bg-[#dbe7c9] h-auto xl:h-screen animate__animated animate__fadeIn"
    >
      <div className="w-full xl:w-2/3">
        <div className="flex flex-col xl:flex-row w-full">
          <div className="w-full xl:w-1/2">
            <div className="flex mx-3 mb-2 mt-24 p-2 bg-[#dbe7c9] shadow-lg shadow-black rounded-lg space-x-2">
              <button
                onClick={() => {
                  setisAdd(true);
                  setisAddBalance(false);
                  setCardInfo(null);
                  setisView(false);
                }}
                className="bg-[#0d9276] font-bold py-2 px-3 rounded-lg w-1/3 text-white shadow-lg hover:bg-[#0D423E] hidden xl:\block"
              >
                Generate
              </button>

              <button
                onClick={(e) => {
                  setisAdd(true);
                  setisAddBalance(false);
                  setCardInfo(null);
                  setisView(false);
                  scrollToTarget("generate");
                }}
                className="bg-[#0d9276] font-bold py-2 px-3 rounded-lg text-white shadow-lg hover:bg-[#0D423E] xl:\hidden"
              >
                <FaPlus />
              </button>
              <input
                type="number"
                className="w-full xl:\w-2/3 rounded-lg text-black shadow-inner shadow-black"
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
                onKeyPress={(e) => {
                  if (e.key === "e" || e.key === "-" || e.key === "+") {
                    e.preventDefault();
                  }
                }}
              />
            </div>

            <div className="bg-[#dbe7c9] p-2 rounded-md shadow-lg shadow-black mx-3">
              <div className="table-container min-h-[240px] bg-slate-300 shadow-inner shadow-black">
                <div
                  className="max-h-[240px] overflow-y-auto"
                  style={{
                    scrollbarColor: "#dbe7c9 #0d9276",
                    scrollbarWidth: "thin",
                  }}
                >
                  <table className="w-full">
                    <thead className="bg-[#0d9276] sticky top-0 shadow-md shadow-black w-full">
                      <tr>
                        <th className=" py-1 px-4 sticky top-0 text-[#dbe7c9]">
                          UID
                        </th>
                      </tr>
                    </thead>
                    <tbody className="">
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
                                    ? "bg-gray-400 hover:bg-gray-600 shadow-lg shadow-black"
                                    : "bg-[#dbe7c9] hover:bg-gray-600 shadow-inner shadow-black"
                                }`}
                                onClick={() => {
                                  handleClickEdit(card);
                                  setisAdd(false);
                                }}
                              >
                                <td className=" py-2 px-36 font-bold text-center text-black shadow-lg shadow-black">
                                  <div className="flex flex-row space-x-4 items-center justify-center">
                                    <div
                                      className={`${
                                        card.isTap
                                          ? "text-[#0d9276]"
                                          : "text-red-800"
                                      }`}
                                    >
                                      <GrStatusGoodSmall />
                                    </div>
                                    <div>{card.uid}</div>
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
          <div className="w-full xl:w-1/2">
            <div
              className={`flex max-w-full mx-3 xl:mr-3 mt-4 xl:mt-24 p-2 justify-center shadow-lg shadow-black ${
                cardInfo ? "bg-[#0d9276]" : "bg-[#dbe7c9]"
              } rounded-lg space-x-2`}
            >
              <div className="flex flex-col xl:flex-row bg-[#dbe7c9] shadow-inner p-4 xl:p-0 shadow-black rounded-md h-full xl:h-[305px] w-full">
                <div
                  className={`flex flex-col space-y-6 w-full xl:m-4 bg-red-[#dbe7c9] ${
                    cardInfo && "bg-[#0d9276]"
                  } items-center justify-center rounded-lg shadow-lg shadow-black`}
                >
                  <div
                    className={`flex flex-row w-full justify-end px-4 pt-2 xl:px-10 font-bold text-sm xl:text-xl ${
                      cardInfo ? "text-[#dbe7c9]" : "text-gray-400"
                    }`}
                  >
                    <button
                      onClick={() => {
                        clearSearch();
                        scrollToTarget("top");
                      }}
                      className="flex w-full justify-end text-[#dbe7c9] text-center xl:text-end xl:hidden"
                    >
                      <IoMdCloseCircle />
                    </button>
                  </div>
                  <div
                    className={`flex flex-row w-full justify-between px-4 xl:px-10 font-bold text-sm xl:text-xl ${
                      cardInfo ? "text-[#dbe7c9]" : "text-gray-400"
                    }`}
                  >
                    <label className="hidden xl:block">ID:</label>
                    <span className="text-[#dbe7c9] text-center w-full xl:text-end">
                      {cardInfo && cardInfo.uid}
                    </span>
                  </div>
                  <div
                    className={`flex flex-row space-x-2 text-sm xl:text-lg px-6 xl:px-10 w-full items-center justify-center xl:justify-between ${
                      cardInfo ? "text-[#dbe7c9]" : "text-gray-400"
                    }`}
                  >
                    <div className="flex flex-row">
                      <div className="text-sm xl:text-2xl mr-2">
                        <FaCoins />
                      </div>
                      <label className="hidden xl:block">Balance:</label>
                    </div>
                    <span className="text-white">
                      {cardInfo && <div>₱{cardInfo.balance}</div>}
                    </span>
                  </div>
                  <div
                    className={`flex flex-row space-x-2 text-sm xl:text-lg px-6 xl:px-10 w-full items-center justify-center xl:justify-between ${
                      cardInfo ? "text-[#dbe7c9]" : "text-gray-400 "
                    }`}
                  >
                    <div className="flex flex-row">
                      {" "}
                      <div className="text-sm xl:text-2xl mr-2">
                        <FaAddressCard />
                      </div>
                      <label className="hidden xl:block">Status:</label>
                    </div>
                    <span className="text-white ">
                      {cardInfo && (
                        <div>{cardInfo.isTap ? "Tapped In" : "Tapped Off"}</div>
                      )}
                    </span>
                  </div>
                  <div className="flex flex-row justify-between w-full px-3 xl:px-8 pb-1">
                    <button
                      disabled={cardInfo ? false : true}
                      onClick={() => {
                        setisAddBalance(true);
                        setisAdd(false);
                      }}
                      className="bg-[#dbe7c9] px-3  mb-4 xl:mb-0 text-sm xl:text-lg rounded-lg shadow-lg disabled:shadow-inner disabled:shadow-black font-bold shadow-black focus:shadow-none text-[#0d9276] disabled:text-gray-400"
                    >
                      Add
                    </button>
                    <button
                      disabled={cardInfo ? false : true}
                      onClick={() => {
                        scrollToTarget("transaction");
                      }}
                      className="bg-[#dbe7c9] px-3 mb-4 xl:mb-0 text-sm xl:text-lg rounded-lg shadow-lg disabled:shadow-inner disabled:shadow-black font-bold shadow-black focus:shadow-none text-[#0d9276] disabled:text-gray-400 xl:hidden"
                    >
                      See Transaction
                    </button>
                    <button
                      disabled={cardInfo ? false : true}
                      onClick={() => {
                        cardInfo && handleDelete(cardInfo._id);
                      }}
                      className="bg-[#dbe7c9] px-3 py-2 mb-4 xl:mb-0 text-sm xl:text-lg rounded-lg shadow-lg disabled:shadow-inner disabled:shadow-black font-bold shadow-black focus:shadow-none text-[#0d9276] disabled:text-gray-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col xl:flex-row w-full mt-6 space-y-5 xl:space-y-0">
          <div className="w-full xl:w-1/2">
            <div className="flex max-w-full h-auto mr-3 p-2 justify-center bg-[#dbe7c9] rounded-lg shadow-lg shadow-black space-x-2 mx-3">
              <div className="flex flex-col bg-[#dbe7c9] shadow-inner shadow-black py-3 px-6 rounded-md w-full">
                <div className="flex flex-col bg-[#dbe7c9] rounded-md w-auto">
                  <div className="flex flex-col justify-start items-center w-full py-2">
                    <div className="flex flex-row w-full items-center space-x-4 mb-4">
                      <div className="text-[#0d9276]">
                        <GrStatusGoodSmall />
                      </div>
                      <div className="text-[#0d9276] font-bold">Onboard</div>
                    </div>
                    <div className="w-full">
                      <ProgressBar
                        completed={Math.round(
                          (onboardCount / (onboardCount + offboardCount)) * 100
                        )}
                        bgColor="#0d9276"
                        baseBgColor="#b3bdb6"
                        labelColor="#dbe7c9"
                        customLabel={onboardCount.toString()}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col justify-start items-center w-full py-2">
                    <div className="flex flex-row w-full items-center space-x-4 mb-4">
                      <div className="text-red-800">
                        <GrStatusGoodSmall />
                      </div>
                      <div className="text-[#0d9276] font-bold">Offboard</div>
                    </div>
                    <div className="w-full">
                      <ProgressBar
                        completed={Math.round(
                          (offboardCount / (onboardCount + offboardCount)) * 100
                        )}
                        bgColor="#0d9276"
                        baseBgColor="#b3bdb6"
                        labelColor="#dbe7c9"
                        customLabel={offboardCount.toString()}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col justify-start items-center w-full py-2">
                    <div className="flex flex-row w-full items-center space-x-4 mb-4">
                      <div className="flex flex-row items-center text-[#0d9276] font-bold">
                        <div>
                          <FaAddressCard />
                        </div>
                        <div className="ml-3">Total Cards</div>
                      </div>
                    </div>
                    <div className="w-full">
                      <ProgressBar
                        completed={100}
                        bgColor="#0d9276"
                        baseBgColor="#b3bdb6"
                        labelColor="#dbe7c9"
                        customLabel={(onboardCount + offboardCount).toString()}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div id="generate" className="w-full xl:w-1/2">
            <div
              className={`flex max-w-full mx-3 mb-5 p-2 justify-center shadow-lg shadow-black ${
                isAdd || isAddBalance ? "bg-[#0d9276]" : "bg-[#dbe7c9]"
              } rounded-lg space-x-2 h-full`}
            >
              {isAdd && (
                <div className="flex flex-col space-y-6 bg-[#dbe7c9] py-3 px-6 rounded-md w-full">
                  <div className="flex flex-row w-full justify-between">
                    <div className="flex flex-row justify-between w-full">
                      <label className="text-green-400 font-bold text-xl">
                        Generate Card
                      </label>
                      <button
                        onClick={() => {
                          setisAdd(false);
                          scrollToTarget("top");
                        }}
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
                      className="rounded-lg text-black shadow-inner shadow-black"
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setBalance(e.target.value)
                      }
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
                      value={balance}
                    />
                    <button className="mt-6 bg-[#0d9276] text-[#dbe7c9] font-bold mx-10 rounded-lg py-2 shadow-lg shadow-black focus:shadow-inner">
                      Generate
                    </button>
                  </form>
                </div>
              )}
              {isAddBalance && (
                <div className="flex flex-col space-y-6 bg-[#dbe7c9] py-3 px-6 rounded-md w-full shadow-inner shadow-black">
                  <div className="flex flex-row items-center justify-between w-full">
                    <label className="text-[#0d9276] font-bold text-xl">
                      Quick Add Balance:
                    </label>
                    <button
                      className="text-2xl text-[#0d9276]"
                      onClick={() => {
                        setAddBalanceTerm(0);
                        setisAddBalance(false);
                        scrollToTarget("top");
                      }}
                    >
                      <IoMdCloseCircle />
                    </button>
                  </div>
                  <div className="flex flex-row w-full justify-between px-4">
                    <div className="flex flex-col">
                      <div className="text-[#0d9276]">
                        Card ID: {cardInfo && cardInfo.uid}
                      </div>
                      <div className="text-[#0d9276]">
                        Balance: ₱{cardInfo && cardInfo.balance}
                      </div>
                    </div>
                    <form
                      onSubmit={(e) => addBalance(e, addBalanceTerm)}
                      className="flex flex-col space-y-1"
                    >
                      <input
                        className="rounded-lg shadow-inner shadow-black px-2 w-20"
                        readOnly
                        value={addBalanceTerm}
                      />
                      <button className="bg-[#0d9276] text-[#dbe7c9] font-bold rounded-lg shadow-lg shadow-black">
                        Add
                      </button>
                    </form>
                  </div>
                  <div className="flex flex-col space-y-6 px-4">
                    <div className="grid grid-cols-5 space-x-2">
                      <button
                        onClick={() => {
                          setAddBalanceTerm(addBalanceTerm + 1);
                        }}
                        className="bg-[#0d9276] shadow-lg shadow-black text-center py-1 rounded-lg text-[#dbe7c9] font-bold focus:shadow-inner"
                      >
                        1
                      </button>
                      <button
                        onClick={() => {
                          setAddBalanceTerm(addBalanceTerm + 5);
                        }}
                        className="bg-[#0d9276] shadow-lg shadow-black text-center py-1 rounded-lg text-[#dbe7c9] font-bold focus:shadow-inner"
                      >
                        5
                      </button>
                      <button
                        onClick={() => {
                          setAddBalanceTerm(addBalanceTerm + 10);
                        }}
                        className="bg-[#0d9276] shadow-lg shadow-black text-center py-1 rounded-lg text-[#dbe7c9] font-bold focus:shadow-inner"
                      >
                        10
                      </button>
                      <button
                        onClick={() => {
                          setAddBalanceTerm(addBalanceTerm + 20);
                        }}
                        className="bg-[#0d9276] shadow-lg shadow-black text-center py-1 rounded-lg text-[#dbe7c9] font-bold focus:shadow-inner"
                      >
                        20
                      </button>
                      <button
                        onClick={() => {
                          setAddBalanceTerm(addBalanceTerm + 50);
                        }}
                        className="bg-[#0d9276] shadow-lg shadow-black text-center py-1 rounded-lg text-[#dbe7c9] font-bold focus:shadow-inner"
                      >
                        50
                      </button>
                    </div>
                    <div className="grid grid-cols-5 space-x-2">
                      <button
                        onClick={() => {
                          setAddBalanceTerm(addBalanceTerm + 100);
                        }}
                        className="bg-[#0d9276] shadow-lg shadow-black text-center py-1 rounded-lg text-[#dbe7c9] font-bold focus:shadow-inner"
                      >
                        100
                      </button>
                      <button
                        onClick={() => {
                          setAddBalanceTerm(addBalanceTerm + 200);
                        }}
                        className="bg-[#0d9276] shadow-lg shadow-black text-center py-1 rounded-lg text-[#dbe7c9] font-bold focus:shadow-inner"
                      >
                        200
                      </button>
                      <button
                        onClick={() => {
                          setAddBalanceTerm(addBalanceTerm + 500);
                        }}
                        className="bg-[#0d9276] shadow-lg shadow-black text-center py-1 rounded-lg text-[#dbe7c9] font-bold focus:shadow-inner"
                      >
                        500
                      </button>
                      <button
                        onClick={() => {
                          setAddBalanceTerm(addBalanceTerm + 1000);
                        }}
                        className="bg-[#0d9276] shadow-lg shadow-black text-center py-1 rounded-lg text-[#dbe7c9] font-bold focus:shadow-inner"
                      >
                        1K
                      </button>
                      <button
                        onClick={() => {
                          setAddBalanceTerm(addBalanceTerm + 2000);
                        }}
                        className="bg-[#0d9276] shadow-lg shadow-black text-center py-1 rounded-lg text-[#dbe7c9] font-bold focus:shadow-inner"
                      >
                        2K
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {!isAdd && !isAddBalance && (
                <div className="flex flex-col space-y-8 bg-[#dbe7c9] py-3 px-6 rounded-md w-full text-center shadow-inner shadow-black">
                  <label className="my-24 text-gray-400 font-bold">
                    Press an action to open this panel
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full xl:w-1/3 mt-4 xl:mt-24">
        <div
          className={`bg-gray-[#dbe7c9] ${
            cardInfo && "bg-[#0d9276]"
          } w-auto mx-4 h-auto mb-10 rounded-lg shadow-lg shadow-black`}
        >
          <div id="transaction" className="p-4 text-center h-[620px]">
            <div
              className={`flex font-bold text-xl w-full justify-between items-center mb-4 ${
                cardInfo ? "text-[#dbe7c9]" : "text-gray-400"
              }`}
            >
              <label className="">Travel History:</label>
              {isView && (
                <button
                  onClick={() => {
                    clearSearch();
                    scrollToTarget("top");
                  }}
                  className="text-2xl"
                >
                  <IoMdCloseCircle />
                </button>
              )}
            </div>
            <div className="table-container ">
              {cardInfo ? (
                <div
                  style={{
                    maxHeight: "540px",
                    overflowY: "auto",
                    scrollbarColor: "#0d9276 #dbe7c9",
                    scrollbarWidth: "thin",
                  }}
                >
                  <table className="w-full bg-gray-500">
                    <thead className="bg-[#dbe7c9] sticky top-0 shadow-md shadow-black z-50">
                      <tr className="py-2 px-4 sticky">
                        <th className=" py-1 px-4 sticky top-0 text-[#0d9276] shadow-lg">
                          From
                        </th>
                        <th className=" py-1 px-4 sticky top-0 text-[#0d9276] shadow-lg">
                          To
                        </th>
                        <th className=" py-1 px-4 sticky top-0 text-[#0d9276] shadow-lg">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="z-0">
                      {cardInfo && cardInfo.history.length > 0 ? (
                        cardInfo.history.map((transaction, index) => (
                          <tr
                            key={index}
                            className={`hover:bg-gray-500 animate__animated animate__fadeIn ${
                              index % 2 === 0
                                ? "bg-gray-400 hover:bg-gray-600 shadow-lg shadow-black "
                                : "bg-[#dbe7c9] hover:bg-gray-600 shadow-inner shadow-black"
                            }`}
                          >
                            <td className="p-2 text-black">{transaction.in}</td>
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
                          <td
                            colSpan={3}
                            className="p-2 bg-gray-400 text-[#0d9276] font-bold h-[500px]"
                          >
                            No travel history yet.
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
  );
};

export default CardLanding;
