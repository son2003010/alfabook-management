// tabs.js
import React, { createContext, useContext, useState } from 'react';

// Tạo context để share state giữa các components
const TabsContext = createContext({
  activeTab: '',
  setActiveTab: () => {},
});

export const Tabs = ({ defaultValue, children, className }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children }) => (
  <div className="flex space-x-4">
    {children}
  </div>
);

export const TabsTrigger = ({ value, children }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  
  return (
    <button
      className={`px-4 py-2 border rounded-lg transition-colors
        ${activeTab === value 
          ? 'border-red-500 text-red-500 bg-red-50' 
          : 'border-transparent hover:bg-gray-100'
        }`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children }) => {
  const { activeTab } = useContext(TabsContext);
  
  return activeTab === value ? <div>{children}</div> : null;
};