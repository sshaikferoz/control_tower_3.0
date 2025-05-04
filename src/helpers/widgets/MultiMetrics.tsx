import React from 'react';

interface MultiMetricsProps {
  metric1: string;
  value1: number | string;
  metric2: string;
  value2: number | string;
  className?: string;
}

const MultiMetrics: React.FC<MultiMetricsProps> = ({
  metric1,
  value1,
  metric2,
  value2,
  className = ''
}) => {
  // Format number values
  const formatValue = (value: number | string) => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: value >= 100 ? 'currency' : 'decimal',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(value);
    }
    return value;
  };

  const formattedValue1 = formatValue(value1);
  const formattedValue2 = formatValue(value2);

  return (
    <div className={`w-full h-full ${className}`}>
      <div className="h-full bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 rounded-xl text-white">
        <div className="flex flex-row gap-3 h-full">
          <div className="flex flex-col">
            <p className="text-4xl font-bold text-center">{formattedValue1}</p>
            <p className="text-sm mt-1">{metric1}</p>
          </div>
          <div className="w-0.3 h-full border-l border-dashed border-white"></div>
          <div className="flex flex-col">
            <p className="text-4xl font-bold text-center">{formattedValue2}</p>
            <p className="text-sm mt-1">{metric2}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiMetrics;