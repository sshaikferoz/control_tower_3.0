"use client";
import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import PSCLogo from "@/assets/PSCLogo";
import Image from "next/image";

const menuItems = [
  { name: "one-metric", imageURL: "" },
  { name: "one-metric-date", imageURL: "" },
  { name: "two-metrics-linechart", imageURL: "" },
  { name: "two-metrics", imageURL: "" },
  { name: "two-metrics-piechart", imageURL: "" },
  { name: "one-metric-table", imageURL: "" },
  // New components
  { name: "bar-chart", imageURL: "" },
  { name: "stacked-bar-chart", imageURL: "" },
  { name: "orders-line-chart", imageURL: "" },
  { name: "dual-line-chart", imageURL: "" },
  { name: "pie-chart-total", imageURL: "" },
    { name: "quadrant-metrics", imageURL: "" },
    { name: "loans-app-tray", imageURL: "" },
];

interface SidebarMappingProps {
  onItemClick: (name: string) => void;
}

const SidebarMapping: React.FC<SidebarMappingProps> = ({ onItemClick }) => {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState("My SCM");

  // Filter menu items based on search
  const filteredMenuItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-[#00214E] to-[#0164B0] text-white flex flex-col p-4 overflow-auto">
      <div className="flex flex-row items-center space-x-2">
        <PSCLogo />
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold">P&SC</h1>
          <h1 className="text-lg font-semibold">Intelligent Centre</h1>
        </div>
      </div>
      <div className="relative mt-4">
        <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-300" />
        <input
          type="text"
          placeholder="Search Widget"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 pl-10 bg-[#ffffff20] text-white rounded-md outline-none placeholder-gray-300"
        />
      </div>
      <nav className="mt-6 flex-grow">
        <ul className="space-y-2 max-h-[calc(100vh-10rem)] overflow-y-auto">
          {filteredMenuItems.map((item, index) => (
            <li
              key={index}
              className={`px-4 py-2 rounded cursor-pointer ${
                selectedItem === item.name
                  ? "bg-white text-black"
                  : "hover:bg-[#ffffff30] text-white"
              }`}
              onClick={() => {
                setSelectedItem(item.name);
                onItemClick(item.name);
              }}
            >
              <div className="flex flex-col items-center">
                {/* Use default placeholder if image doesn't exist */}

                      <Image   src={`${process.env.NEXT_PUBLIC_BSP_NAME}/ui-components/${item.name}.svg`}
                          alt={item.name}
                          width={100}
                          height={100}
                    className="w-full h-16 object-contain mb-2"/>

                <div className="text-sm text-center mt-1 capitalize">
                  {item.name.replace(/-/g, ' ')}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SidebarMapping;