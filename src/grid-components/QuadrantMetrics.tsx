import React from "react";

interface QuadrantMetricsProps {
  metrics: {
    title: string;
    value: string;
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  }[];
}

const QuadrantMetrics = ({ metrics }: QuadrantMetricsProps) => {
  // Make sure we have exactly 4 metrics for the quadrants
  const validMetrics = metrics.slice(0, 4);
  while (validMetrics.length < 4) {
    validMetrics.push({
      title: "Metric",
      value: "0",
      position: ["top-left", "top-right", "bottom-left", "bottom-right"][validMetrics.length] as any
    });
  }

  return (
    <div className="w-full h-full">
      <div className="h-full bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 rounded-xl text-white relative">
        {validMetrics.map((metric, index) => (
          <div
            key={index}
            className={`flex flex-col items-start gap-4 absolute
              ${metric.position === "top-left" ? "top-[41px] left-14" : ""}
              ${metric.position === "top-right" ? "top-[41px] right-14" : ""}
              ${metric.position === "bottom-left" ? "bottom-[41px] left-14" : ""}
              ${metric.position === "bottom-right" ? "bottom-[41px] right-14" : ""}
            `}
          >
            <h3 className="w-[169px] [font-family:'Ghawar-Hefty',Helvetica] font-normal text-[17px] text-white">
              {metric.title}
            </h3>
            <span className="[font-family:'Ghawar-SmeiBold',Helvetica] font-bold text-[#83bd01] text-[28px] leading-8 whitespace-nowrap">
              {metric.value}
            </span>
          </div>
        ))}

        {/* Divider lines */}
        <div className="absolute w-px h-5/6 top-[7%] left-1/2 bg-white opacity-30"></div>
        <div className="absolute w-5/6 h-px top-1/2 left-[7%] bg-white opacity-30"></div>

        {/* Center circle */}
        <div className="absolute w-10 h-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative w-full h-full rounded-full bg-[#1E3A71] border border-white opacity-70"></div>
        </div>
      </div>
    </div>
  );
};

export default QuadrantMetrics;