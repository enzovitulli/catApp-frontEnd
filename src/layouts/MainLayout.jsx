import AppHeader from '../components/AppHeader';
import Navbar from '../components/Navbar';

export default function MainLayout({ children, activeTab, setActiveTab }) {
  return (
    <div className="min-h-screen bg-oxford-900 flex flex-col hide-scrollbar overflow-x-hidden">
      <AppHeader />
      <div className="flex-1 container mx-auto p-4 pb-20 md:pb-4 pt-20">
        <div className="h-full">
          {children}
        </div>
      </div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
