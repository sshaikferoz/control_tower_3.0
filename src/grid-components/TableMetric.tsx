import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

type Supplier = {
  [key: string]: string | number;
};

type SupplierTableProps = {
  totalAmount: string;
  data: Supplier[];
};

const TableMetric = ({ totalAmount, data }: SupplierTableProps) => {
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 rounded-xl text-white">
      {/* Header Section */}
      <div className="flex justify-between items-center pb-3">
        <h2 className="text-lg font-semibold">My Top Suppliers</h2>
        <span className="text-2xl font-bold">{totalAmount}</span>
      </div>

      {/* Table with only horizontal borders */}
      <div className="border border-white rounded-md overflow-hidden">
        <DataTable value={data} className="border-collapse w-full">
          {columns.map((col, index) => (
            <Column
              key={col}
              field={col}
              header={col.toUpperCase().replace(/_/g, " ")}
              headerClassName="text-[#83BD01] text-sm font-semibold border-b border-white p-2 text-left"
              bodyClassName={`text-black border-b text-sm border-white p-2 text-left ${
                index === 0 ? "pl-4" : ""
              }`}
            />
          ))}
        </DataTable>
      </div>
    </div>
  )
}


export default TableMetric;