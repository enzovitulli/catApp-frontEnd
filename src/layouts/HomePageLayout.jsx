import { useLocation } from 'react-router';
import Header from '../components/Header';

export default function HomePageLayout({ children }) {
  const location = useLocation();
  const isHelpPage = location.pathname === '/help';
  
  return (
    <div className="min-h-screen bg-oxford-900 flex flex-col hide-scrollbar overflow-x-hidden">
      <Header showAuthButtons={true} />
      <main 
        className="flex-1"
        style={{
          // Add extra top padding for help page to account for expanded header
          paddingTop: isHelpPage ? '0' : '0'
        }}
      >
        {children}
      </main>
    </div>
  );
}
