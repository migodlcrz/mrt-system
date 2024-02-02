import React from "react";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";

interface DashboardCardProps {
  title: String;
  description: String;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
}) => {
  return (
    <div className="bg-gray-600 p-4 lg:p-6 rounded-lg text-2xl font-medium w-full h-full hover:bg-gray-700 animate__animated animate__backInUp">
      <h1 className="text-sm lg:text-2xl mt-2 mb-4">{title}</h1>
      <h3 className="text-sm text-gray-300 font-normal pr-2 text-justify">
        {description}
      </h3>
      <div className="flex justify-end">
        <MdKeyboardDoubleArrowRight />
      </div>
    </div>
  );
};

export default DashboardCard;
