import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface PieChartWithTotalProps {
  data: {
    name: string;
    value: number;
    fill: string;
  }[];
  title: string;
  totalValue: string;
  subValue: string;
  variance: string;
}

const PieChartWithTotal = ({ data, title, totalValue, subValue, variance }: PieChartWithTotalProps) => {
  return (
    <div className="w-full h-full">
      <div className="h-full bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 rounded-xl text-white">
        <div className="flex items-center gap-2.5 w-full">
          <h3 className="[font-family:'Ghawar-Hefty',Helvetica] font-normal text-base text-center text-white whitespace-nowrap">
            {title}
          </h3>

          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <div className="flex justify-center items-center rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-white"
                >
                  <path d="M7 17l9-9" />
                  <path d="M17 17V8" />
                  <path d="M7 8h9" />
                </svg>
              </div>
              <div className="[font-family:'Ghawar-Regular',Helvetica] font-normal text-sm leading-4 whitespace-nowrap">
                <span className="text-white tracking-[0.04px]">{variance}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center w-full h-[180px] mt-4">
          <div className="relative flex flex-col items-center">
            <div className="h-[120px] w-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={55}
                    paddingAngle={1}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="absolute top-[40px] w-full text-center">
              <div className="[font-family:'Ghawar-SmeiBold',Helvetica] font-bold text-white text-xl tracking-[-0.75px] whitespace-nowrap">
                {totalValue}
              </div>
            </div>
            
            <div className="flex items-center gap-2.5 mt-2">
              <div className="[font-family:'Ghawar-Hefty',Helvetica] font-normal text-white text-lg text-center">
                {subValue}
              </div>
              <div className="flex flex-wrap items-center gap-[4px] rounded-lg">
                <div className="flex flex-col items-start justify-center rounded-lg">
                  <div className="[font-family:'Inter',Helvetica] font-normal text-white text-xs leading-4">
                    {variance}
                  </div>
                </div>
                <div className="flex justify-center items-center rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 text-white"
                  >
                    <path d="M7 17l9-9" />
                    <path d="M17 17V8" />
                    <path d="M7 8h9" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PieChartWithTotal;