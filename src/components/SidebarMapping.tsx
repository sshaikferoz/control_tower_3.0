"use client";
import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import PSCLogo from "@/assets/PSCLogo";

const menuItems = [
  { name: "one-metric", imageURL: "" },
  { name: "one-metric-date", imageURL: "" },
  { name: "two-metrics-linechart", imageURL: "" },
  { name: "two-metrics", imageURL: "" },
  { name: "two-metrics-piechart", imageURL: "" },
  { name: "one-metric-table", imageURL: "" },
];

interface SidebarMappingProps {
  onItemClick: (name: string) => void;
}

const SidebarMapping: React.FC<SidebarMappingProps> = ({ onItemClick }) => {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState("My SCM");

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
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`px-4 py-2 rounded cursor-pointer ${
                selectedItem === item.name
                  ? "bg-white text-black"
                  : "hover:bg-[#ffffff30] text-white"
              }`}
              onClick={() => {
                setSelectedItem(item.name);
                console.log("item.name", item.name)
                onItemClick(item.name);
              }}
            >
              <img
                src={`/ui-components/${item.name}.svg`}
                alt={item.name}
                className="w-full h-20 mr-2"
              />
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SidebarMapping;
