"use client";
import { Search } from "lucide-react";
import SCMLogo from "@/assets/SCMLogo";
import { Button } from "primereact/button";
import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";

import { Checkbox } from "primereact/checkbox"; // Import Checkbox from PrimeReact

const Header = () => {
  const [visible, setVisible] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded

  const handleCreateSection = () => {
    const randomId = Math.random().toString(36).substring(2, 10); // Generate random ID
    const encodedSectionName = encodeURIComponent(sectionName.trim());
    // Include the expanded state in the URL parameters
      window.window.location.href = `/mapping?sectionName=${encodedSectionName}&expanded=${isExpanded}`;
      
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
        <div className="flex flex-col gap-4">
          <div className="field">
            <label htmlFor="section-name" className="block mb-2">Section Name</label>
            <InputText 
              id="section-name" 
              aria-describedby="section-name-help" 
              className="w-full"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
            />
            <small id="section-name-help" className="block mt-1 text-gray-500">Enter the section name</small>
          </div>
          
          <div className="field-checkbox flex items-center gap-2">
            <Checkbox 
              inputId="expanded" 
              checked={isExpanded} 
              onChange={(e:any) => setIsExpanded(e.checked)}
            />
            <label htmlFor="expanded">Expanded by default</label>
          </div>
          
                  <div className="mt-4">
                    
            <Button 
              label="Create Section" 
              icon="pi pi-external-link" 
              className="w-full"
              onClick={handleCreateSection} 
            />
          </div>
        </div>
      </Dialog>
    </nav>
  );
};

export default Header;