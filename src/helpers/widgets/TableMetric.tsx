import React from "react";
import { Maximize2 } from 'lucide-react';

type DataItem = {
  [key: string]: string | number;
};

type TableMetricProps = {
  totalAmount: string;
  data: DataItem[];
  columns?: Array<{ field: string; header: string }>;
  title?: string;
  className?: string;
};

const TableMetric: React.FC<TableMetricProps> = ({ 
  totalAmount, 
  data, 
  columns, 
  title = "My Top Items",
  className = ''
}) => {
  // If columns are provided, use them. Otherwise, derive from the data
  const tableColumns = columns || 
    (data.length > 0 
      ? Object.keys(data[0]).map(key => ({ 
          field: key, 
          header: key.toUpperCase().replace(/_/g, " ") 
        }))
      : []);

  // Define column widths
  const getColumnWidth = (index: number, total: number) => {
    if (total === 3) {
      if (index === 0) return 'w-[160px]'; // First column width
      if (index === 1) return 'w-[90px]';  // Second column width
      if (index === 2) return 'w-[95px]';  // Third column width
    }
    return 'flex-1'; // Default: equal width
  };

  return (
    <div className={`w-full h-full ${className}`}>
      <div className="w-full h-full rounded-xl border border-solid border-[#00214E] overflow-hidden">
        <div className="p-0 h-full">
          <div className="relative h-full rounded-xl bg-gradient-to-b from-[#00214E] to-[#0164B0]">
            {/* Card Header */}
            <div className="flex items-center justify-between px-4 sm:px-7 pt-1.5 pb-3">
              <div className="flex items-center gap-2">
                <div className="font-normal text-white text-base">
                  {title}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="font-bold text-white text-xl">
                  {totalAmount}
                </div>
                <Maximize2 className="w-[15px] h-4 text-white" />
              </div>
            </div>
            
            {/* Table */}
            <div className="px-4 sm:px-7 flex-grow overflow-auto pb-4">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      {tableColumns.map((col, index) => (
                        <th
                          key={col.field}
                          className={`${getColumnWidth(index, tableColumns.length)} 
                            text-left px-4 py-2 text-[#83bd01] font-bold text-xs`}
                        >
                          {col.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, rowIndex) => (
                      <tr 
                        key={rowIndex}
                        className="border-b border-white border-opacity-20 last:border-b-0"
                      >
                        {tableColumns.map((col, colIndex) => (
                          <td
                            key={`${rowIndex}-${colIndex}`}
                            className={`${getColumnWidth(colIndex, tableColumns.length)} 
                              px-4 py-2 text-white text-sm ${
                                colIndex === 0 ? 'font-normal' : 'font-medium text-center'
                              }`}
                          >
                            {row[col.field]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableMetric;