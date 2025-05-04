import React from 'react';

interface SimpleMetricProps {
  name: string;
  value: number | string;
  className?: string;
}

const SimpleMetric: React.FC<SimpleMetricProps> = ({ 
  name, 
  value, 
  className = ''
}) => {
  // Format number values
  const formattedValue = typeof value === 'number' 
    ? new Intl.NumberFormat('en-US', {
        style: value >= 100 ? 'currency' : 'decimal',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(value)
    : value;

  return (
    <div className={`w-full h-full ${className}`}>
      <div className="h-full bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 rounded-xl text-white">
        <h2 className="text-4xl font-bold">{formattedValue}</h2>
        <p className="mt-1 text-sm">{name}</p>
      </div>
    </div>
  );
};

export default SimpleMetric;