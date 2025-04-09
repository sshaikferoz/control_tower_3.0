"use client";
import { Search } from "lucide-react";
import SCMLogo from "@/assets/SCMLogo";
import { Button } from "primereact/button";
import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { redirect } from "next/navigation"; // Use Next.js navigation


const Header = () => {
  const [visible, setVisible] = useState(false);
  const [sectionName, setSectionName] = useState("");


  const handleCreateSection = () => {
    const randomId = Math.random().toString(36).substring(2, 10); // Generate random ID
    const encodedSectionName = encodeURIComponent(sectionName.trim());
    redirect(`/mapping/${randomId}?sectionName=${encodedSectionName}`) // Navigate to the new post page
  };

  return (
    <nav className="flex items-center justify-between m-4 p-4 w-[calc(100%-2rem)] h-[73px] bg-gradient-to-r from-[#00214E] to-[#0164B0] rounded-lg">
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 relative">
          <SCMLogo />
        </div>
        <span className="text-white font-semibold text-xl">My SCM</span>
    </div>
      <div className="relative w-[546px]">
        <input
          type="text"
          placeholder="Search My Contract, Spend, Notification, Localization, KPI"
          className="w-full h-[41px] px-4 pl-12 bg-white/20 border border-white rounded-xl text-white placeholder-white focus:outline-none"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white w-4 h-4" />
      </div>
      <div>
        <Button label="Create Section" icon="pi pi-external-link" onClick={() => setVisible(true)} />
      </div>
      <Dialog
        header="Create Section"
        visible={visible}
        style={{ width: "30vw" }}
        onHide={() => setVisible(false)}
      >
        <div className="flex flex-col">
          <label htmlFor="section-name">Section Name</label>
          <InputText id="section-name" aria-describedby="section-name-help"  onChange={(e) => setSectionName(e.target.value)}/>
          <small id="section-name-help">Enter the section name</small>
          <Button label="Create Section" icon="pi pi-external-link" onClick={handleCreateSection} />
        </div>
      </Dialog>
    </nav>
  );
};

export default Header;
