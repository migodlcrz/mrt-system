import { Button, Label, Modal, TextInput } from "flowbite-react";
import React, { useState, useEffect, ChangeEvent } from "react";
import CardEdit from "../../../../components/CardEdit";
import { MdDelete } from "react-icons/md";
import { useAuthContext } from "../../../../hooks/useAuthContext";

interface Card {
  _id: string;
  uid: string;
  balance: number;
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

  const [openModal, setOpenModal] = useState(false);

  const { user } = useAuthContext();

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const card = { uid, balance };

    if (Number(card.balance) < 1) {
      return setError("Input cannot be negative.");
    }

    const postResponse = await fetch(
      "https://mrt-server-shg0.onrender.com/api/cards",
      {
        method: "POST",
        body: JSON.stringify(card),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.jwt}`,
        },
      }
    );

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
    }
  };

  const handleDelete = async (card_id: String): Promise<void> => {
    if (user) {
      const isConfirmed = window.confirm(
        "Are you sure you want to delete this?"
      );

      if (isConfirmed) {
        const deleteResponse = await fetch(
          "https://mrt-server-shg0.onrender.com/api/cards/" + card_id,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.jwt}`,
            },
          }
        );

        if (!deleteResponse.ok) {
          setError("Error!");
        }

        if (deleteResponse.ok) {
          setEmptyFields([]);
          setError(null);
          setUID(Math.floor(Math.random() * 1000000000000).toString());
          setBalance("");
          fetchCards();
        }
      }
    }
  };

  const fetchCards = async () => {
    const response = await fetch(
      "https://mrt-server-shg0.onrender.com/api/cards",
      {
        headers: {
          Authorization: `Bearer ${user.jwt}`,
        },
      }
    );
    const json = await response.json();

    if (response.ok) {
      setCards(json);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCards();
    }
  }, [user, update]);

  if (cards) {
    console.log("CARDS", cards[1]._id);
  }

  return (
    <div className="CardLanding bg-gray-800 h-screen">
      <div className="flex flex-col">
        <div>
          <div className="flex max-w-full mx-5 mb-5 mt-28 p-4 justify-center bg-gray-600 rounded-lg space-x-2">
            <Button
              className="bg-gray-800 text-green-400 font-bold hover:text-green-500"
              onClick={() => {
                setOpenModal(true);
              }}
            >
              GENERATE CARD
            </Button>
            <Modal
              show={openModal}
              onClose={() => {
                setOpenModal(false);
                setError(null);
              }}
            >
              <Modal.Header className="bg-gray-900">
                <div className="text-green-400 font-bold">GENERATE CARD</div>
              </Modal.Header>
              <Modal.Body className="bg-gray-800">
                <form className="create" onSubmit={handleCreate}>
                  <Label className="text-green-400">Card ID:</Label>
                  <TextInput
                    type="number"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setUID(e.target.value)
                    }
                    value={uid}
                    readOnly
                  />
                  <Label className="text-green-400">Balance:</Label>
                  <TextInput
                    type="number"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setBalance(e.target.value)
                    }
                    value={balance}
                  />

                  <button className="mt-5 bg-gray-700 hover:bg-gray-900 px-2 py-1 rounded-lg">
                    <div className="text-green-400">Add Card</div>
                  </button>
                  {error && (
                    <div className="text-red-500 font-bold m-2">{error}</div>
                  )}
                </form>
              </Modal.Body>
              <Modal.Footer className="bg-gray-900 text-red-800"></Modal.Footer>
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
                      <th className=" px-4 sticky top-0 text-green-400 w-auto">
                        UID
                      </th>
                      <th className="py-2 px-4 sticky top-0 text-green-400 w-auto">
                        Balance
                      </th>
                      <th className="py-2 px-4 sticky top-0 text-green-400 w-10 lg:w-80">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cards &&
                      cards.map((card: Card, index) => {
                        return (
                          <tr
                            key={card._id}
                            className={
                              index % 2 === 0 ? "bg-gray-400" : "bg-gray-300"
                            }
                          >
                            <td className="py-2 px-4 font-bold text-center text-black">
                              {card.uid}
                            </td>
                            <td className="py-2 px-4 font-bold text-center text-black">
                              {card.balance}
                            </td>
                            <td className="py-2 px-4 font-normal text-center">
                              <div className="flex flex-row justify-center items-center space-x-2">
                                <CardEdit
                                  card={card}
                                  update={() => {
                                    setUpdate(!update);
                                  }}
                                  // fetchCards={fetchCards}
                                ></CardEdit>
                                <button
                                  className="bg-gray-800 w-15 rounded-lg text-red-500 text-sm py-1 px-2 font-semibold"
                                  onClick={(e) => handleDelete(card._id)}
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

export default CardLanding;
