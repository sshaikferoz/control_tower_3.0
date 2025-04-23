"use client";
import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import PSCLogo from "@/assets/PSCLogo";
const menuItems: string[] = [
    "My SCM",
    "Material Procurement",
    "Inventory",
    "Warehousing",
    "Logistics",
    "Supplier Lifecycle",
    "General Supply Chain",
    "Customers",
];
const Sidebar: React.FC = () => {
    const [search, setSearch] = useState<string>("");
    const [selectedItem, setSelectedItem] = useState("My SCM");
    return (
        <div className="w-64 h-screen bg-gradient-to-b from-[#00214E] to-[#0164B0] text-white flex flex-col p-4">
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
                    placeholder="Search Menu"
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
                            className={`px-4 py-2 rounded cursor-pointer ${selectedItem === item
                                    ? "bg-white text-black"
                                    : "hover:bg-[#ffffff30] text-white"
                                }`}
                            onClick={() => setSelectedItem(item)}
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="mt-auto flex items-center space-x-3 p-2 bg-[#ffffff20] rounded">
                <Image
                    src={`${process.env.NEXT_PUBLIC_BSP_NAME}/user.png`}
                    alt="User"
                    width={40}
                    height={40}
                    className="rounded-full"
                />
                <div>
                    <p className="text-sm font-medium">Abdulmajeed</p>
                    <p className="text-xs text-gray-300">
                        Last Login: 12/11/2024 19:23:32
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
