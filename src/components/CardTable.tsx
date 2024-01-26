import React, { FC } from "react";

interface AllCardDetailsProps {
  card: {
    _id: string;
    uid: string;
    balance: number;
  };
}

const CardTable: FC<AllCardDetailsProps> = ({ card }) => {
  return (
    <div className="card">
      <div className="card-details">
        <div className="flex space-x-10">
          <div className="">{card.uid}</div>
          <div className="">{card.balance}</div>
        </div>
      </div>
    </div>
  );
};

export default CardTable;
