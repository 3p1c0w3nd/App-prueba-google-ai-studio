
import React from 'react';

interface TabsProps {
  activeTab: 'video' | 'maps';
  setActiveTab: (tab: 'video' | 'maps') => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'video', label: 'Veo Video Generator' },
    { id: 'maps', label: 'Maps Local Search' },
  ] as const;

  return (
    <div className="flex justify-center bg-gray-800/50 rounded-lg p-1 space-x-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg
            focus:outline-none focus:ring-2 ring-offset-2 ring-offset-gray-900 ring-white ring-opacity-60
            transition-colors duration-200
            ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-300 hover:bg-white/[0.12] hover:text-white'
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
