
import React, { useState } from 'react';
import VideoGenerator from './components/VideoGenerator';
import LocalSearch from './components/LocalSearch';
import Header from './components/Header';
import Tabs from './components/Tabs';

type Tab = 'video' | 'maps';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('video');

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <Header />
      <div className="w-full max-w-4xl mx-auto">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="mt-6">
          {activeTab === 'video' && <VideoGenerator />}
          {activeTab === 'maps' && <LocalSearch />}
        </main>
      </div>
    </div>
  );
};

export default App;
