import Navbar from './components/Navbar';
import Header from './components/Header';
import CardStack from './components/CardStack';
import { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto p-4 pb-20 md:pb-4">
          <div className="h-full">
            {activeTab === 'home' && (
              <div className="flex flex-col items-center justify-center h-full">
                <CardStack />
              </div>
            )}
            {activeTab === 'cat' && <div>Cat Profiles</div>}
            {activeTab === 'message' && <div>Messages</div>}
            {activeTab === 'heart' && <div>Favorites</div>}
          </div>
        </div>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </>
  )
}

export default App
