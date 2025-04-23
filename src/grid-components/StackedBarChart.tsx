import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent } from '@/components/ui/card';

interface StackedBarChartProps {
  data: {
    name: string;
    [key: string]: string | number;
  }[];
  title: string;
  totalValue?: string;
  series: {
    name: string;
    dataKey: string;
    color: string;
  }[];
}

const StackedBarChart = ({ data = [], title = "Chart", totalValue = "", series = [] }: StackedBarChartProps) => {
  // Add default values to prevent null/undefined errors
  const safeData = data || [];
  const safeSeries = series || [];
  
    return (
       <Card className={`flex flex-col h-[254px] w-full md:w-[711px] items-start rounded-xl border border-solid border-[#00a3e0] shadow-[3px_8px_30px_1px_#a8afb84c]`}
            style={{ 
              background: 'linear-gradient(180deg, rgba(30,58,113,1) 25%, rgba(0,128,189,1) 100%), linear-gradient(0deg, rgba(13,54,111,1) 0%, rgba(13,54,111,1) 100%)'
            }}
          >
            <CardContent className="flex flex-col w-full h-full p-3.5">
            <div className="w-full h-full">
    
        <div className="flex justify-between">
          <div className="flex gap-[5px] flex-col items-start">
            <h3 className="[font-family:'Ghawar-Hefty',Helvetica] font-normal text-base text-white">
              {title}
            </h3>
          </div>

          {totalValue && (
            <div className="flex flex-col items-center">
              <span className="[font-family:'Ghawar-SmeiBold',Helvetica] font-bold text-white text-xl whitespace-nowrap">
                {totalValue}
              </span>
              <span className="[font-family:'Ghawar-Regular',Helvetica] font-normal text-white text-sm">
                Total Value
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 mt-2">
          {safeSeries.map((item, index) => (
            <div key={index} className="flex items-center gap-[5px]">
              <div 
                className="w-[9px] h-[9px] rounded-[4.5px] shadow-[0px_5px_12px_#9c88fb29]"
                style={{ backgroundColor: item.color }}
              />
              <div className="[font-family:'Ghawar-Regular',Helvetica] font-normal text-[#ffffff] text-sm">
                {item.name}
              </div>
            </div>
          ))}
        </div>

        <div className="w-full h-[180px] mt-4">
          {safeSeries.length > 0 && safeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={safeData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 0,
                  bottom: 5,
                }}
                barSize={24}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff30" />
                <XAxis 
                  dataKey="name"
                  axisLine={{ stroke: '#ffffff50' }}
                  tick={{ fill: '#ffffff' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#ffffff' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E3A71",
                    border: "1px solid #00a3e0",
                    borderRadius: "8px",
                    color: "#ffffff"
                  }}
                />
                {safeSeries.map((item, index) => (
                  <Bar
                    key={index}
                    dataKey={item.dataKey}
                    stackId="a"
                    fill={item.color}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-white opacity-70">No data available</p>
            </div>
          )}
        </div>
    
    </div>
            </CardContent>
            </Card>
        
   
  );
};

export default StackedBarChart;