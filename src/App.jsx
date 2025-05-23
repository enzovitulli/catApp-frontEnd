import Navbar from './components/Navbar';
import Header from './components/Header';
import CardStack from './components/CardStack';
import CommentSection from './components/CommentSection';
import { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  // Add state to track which card has comments open
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [activeCardId, setActiveCardId] = useState(null);

  // Function to handle opening comments for a specific card
  const openComments = (cardId) => {
    setActiveCardId(cardId);
    setCommentsOpen(true);
  };

  // Function to handle closing comments
  const closeComments = () => {
    setCommentsOpen(false);
  };

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto p-4 pb-20 md:pb-4">
          <div className="h-full">
            {activeTab === 'home' && (
              <div className="flex flex-col items-center justify-center h-full">
                <CardStack openComments={openComments} />
              </div>
            )}
            {activeTab === 'cat' && <div>Cat Profiles</div>}
            {activeTab === 'message' && <div>Messages</div>}
            {activeTab === 'heart' && <div>Favorites</div>}
          </div>
        </div>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Render CommentSection at the root level */}
        <CommentSection 
          isOpen={commentsOpen} 
          onClose={closeComments} 
          catId={activeCardId} 
        />
      </div>
    </>
  )
}

export default App
