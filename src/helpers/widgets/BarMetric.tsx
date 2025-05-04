import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from 'lucide-react';

interface BarMetricProps {
  data: {
    name: string;
    value: number;
    fill?: string;
    background?: string;
    opacity?: number;
  }[];
  title: string;
  variance?: string;
  className?: string;
}

const BarMetric: React.FC<BarMetricProps> = ({ 
  data, 
  title, 
  variance = "+0.00%",
  className = ''
}) => {
  // Ensure the domain is dynamically calculated based on the data
  const maxValue = Math.max(...data.map(item => item.value)) * 1.2;

  return (
    <div className={`w-full h-full ${className}`}>
      <div className="h-full bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 rounded-xl text-white">
        <div className="p-3">
          <div className="flex flex-col h-full items-center gap-2.5 w-full">
            {/* Header */}
            <div className="flex h-8 items-center justify-between w-full px-2">
              <h3 className="font-normal text-white text-base">
                {title}
              </h3>

              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <div className="flex items-center justify-center rounded-lg">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm leading-4">
                    <span className="text-white tracking-wide">{variance}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="flex flex-col w-full h-48 items-start">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'white', fontSize: 12 }} 
                    axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                  />
                  <YAxis 
                    tick={{ fill: 'white', fontSize: 12 }} 
                    axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                    tickFormatter={(value) => `${value}`}
                    domain={[0, maxValue]}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1E3A71',
                      border: '1px solid #00a3e0',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    formatter={(value) => [`${value}k`, 'Value']}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#83bd01cc" 
                    radius={[0, 0, 0, 0]} 
                    label={{ 
                      position: 'top', 
                      fill: 'white',
                      formatter: (value: any) => `${value}k`,
                      fontSize: 12,
                      fontWeight: 'bold'
                    }}
                    isAnimationActive={true}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarMetric;