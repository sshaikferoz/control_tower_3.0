import React from "react";

interface SimpleMetricDateProps {
  name: string;
  value: number;
  date: string;
}

const SimpleMetricDate = ({ name, value, date}: SimpleMetricDateProps) => {
  return (
    <div className="w-full h-full">
      <div className="h-full bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 rounded-xl text-white">
        <div className="flex">
        <h2 className="text-4xl font-bold">{value} 
        </h2>
        <span className="text-[13px] m-auto">{ date}</span>
        </div>
        <p>{name} </p>
      </div>
    </div>
  );
};

export default SimpleMetricDate;
