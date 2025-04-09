interface MultiMetricProps {
    metric1: string;
    value1: string;
    metric2: string;
    value2: string;
  }

const MultiMetrics = ({ metric1, value1,metric2,value2 }:MultiMetricProps) => {
    return (
        <div className="w-full h-full">
      <div className="bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 rounded-xl text-white h-full w-full">
      <div className="flex flex-row gap-3"> 
            <div className="flex flex-col">
                        <p className="text-4xl text-bold text-center">{value1}</p>
                        <p>{metric1}</p>
            </div>
            <div className="w-0.3 h-[4rem] border-l-2 border-dashed border-white"></div>

            <div className="flex flex-col">
                        <p className="text-4xl text-bold text-center">{ value2}</p>
                        <p>{metric2}</p>
            </div>
        </div>
      </div>
    </div>
        
    )
}

export default MultiMetrics;