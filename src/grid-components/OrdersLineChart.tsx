    import React from "react";
    import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    } from "recharts";

    interface OrdersLineChartProps {
    data: {
        name: string;
        value: number;
    }[];
    title: string;
    totalValue: string;
    }

    const OrdersLineChart = ({ data, title, totalValue }: OrdersLineChartProps) => {
    return (
        <div className="w-full h-full">
        <div className="h-full bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 rounded-xl text-white">
            <div className="flex justify-between items-start w-full">
            <div className="flex gap-[5px] flex-col items-start">
                <h3 className="[font-family:'Ghawar-Hefty',Helvetica] font-normal text-base text-white">
                {title}
                </h3>
            </div>

            <div className="flex flex-col items-center">
                <span className="[font-family:'Ghawar-SmeiBold',Helvetica] font-bold text-white text-xl whitespace-nowrap">
                {totalValue}
                </span>
                <span className="[font-family:'Ghawar-Regular',Helvetica] font-normal text-white text-sm">
                Total Order Value
                </span>
            </div>
            </div>

            <div className="h-[180px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 0,
                    bottom: 5,
                }}
                >
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
                <XAxis 
                    dataKey="name" 
                    tick={{ fill: "#ffffff" }}
                    axisLine={{ stroke: "#ffffff50" }}
                />
                <YAxis 
                    tick={{ fill: "#ffffff" }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip
                    contentStyle={{
                    backgroundColor: "#1E3A71",
                    border: "1px solid #00a3e0",
                    borderRadius: "8px",
                    color: "#ffffff"
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#5899DA"
                    strokeWidth={2}
                    dot={{
                    r: 4,
                    fill: "#5899DA",
                    stroke: "#ffffff",
                    strokeWidth: 2,
                    }}
                    activeDot={{
                    r: 6,
                    fill: "#5899DA",
                    stroke: "#ffffff",
                    strokeWidth: 2,
                    }}
                />
                </LineChart>
            </ResponsiveContainer>
            </div>
        </div>
        </div>
    );
    };

    export default OrdersLineChart;