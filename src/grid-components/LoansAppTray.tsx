import React, { JSX } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface LoansAppTrayProps {
  menuItems?: {
    id: number;
    icon: string;
    label: string;
    count: number;
  }[];
  chartData?: {
    name: string;
    value: number;
    color: string;
  }[];
}

const LoansAppTray = ({ 
  menuItems = [
    {
      id: 1,
      icon: `${process.env.NEXT_PUBLIC_BSP_NAME}/vector.svg`,
      label: "Open PR",
      count: 13,
    },
    {
      id: 2,
      icon: `${process.env.NEXT_PUBLIC_BSP_NAME}/group-1000003443.png`,
      label: "Contract Expiring",
      count: 85,
    },
    {
      id: 3,
      icon: `${process.env.NEXT_PUBLIC_BSP_NAME}/group-1000003444.png`,
      label: "Pending SES",
      count: 32,
    },
    {
      id: 4,
      icon: `${process.env.NEXT_PUBLIC_BSP_NAME}/vector-1.svg`,
      label: "Contract with 80%\nConsumed Values",
      count: 24,
    },
  ],
  chartData = [
    { name: 'PR', value: 86, color: '#449ca4' },
    { name: 'CE', value: 156, color: '#5899da' },
    { name: 'SES', value: 114, color: '#ffaa04' },
    { name: 'CV', value: 126, color: '#ff0000' }
  ]
}: LoansAppTrayProps): JSX.Element => {
  return (
    <div className="w-full h-full">
      <div className="h-full bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 rounded-xl text-white">
        <div className="flex items-start gap-5 h-full">
          {/* Menu Section */}
          <div className="flex flex-col items-start gap-[5px] w-[350px]">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="flex w-full h-[51px] items-center gap-3 px-4 py-2 relative border-b [border-bottom-style:solid] border-[#ffffff20]"
              >
                <img
                  className="relative w-[21.67px] h-[21.67px]"
                  alt={`Icon for ${item.label}`}
                  src={item.icon}
                />

                <div className="flex flex-col items-start gap-0.5 relative flex-1 grow">
                  <div className="flex items-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
                    <div className="relative flex-1 mt-[-1.00px] [font-family:'Ghawar-Hefty',Helvetica] font-normal text-white text-base tracking-[0] leading-5 whitespace-pre-line">
                      {item.label}
                    </div>
                  </div>
                </div>

                <div className="flex w-7 h-7 items-center justify-center gap-2.5 p-1 relative bg-[#1E3A71] rounded-2xl">
                  <span className="relative w-fit [font-family:'Roboto',Helvetica] font-semibold text-white text-sm tracking-[0] leading-[18px] whitespace-nowrap">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart Section */}
          <div className="relative flex-1 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#ffffff" />
                <YAxis stroke="#ffffff" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E3A71',
                    border: '1px solid #00a3e0',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[20, 20, 0, 0]}
                  barSize={30}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoansAppTray;