import Header from '../components/Header';

export default function HomePageLayout({ children }) {
  return (
    <div className="min-h-screen bg-oxford-900 flex flex-col hide-scrollbar overflow-x-hidden">
      <Header showAuthButtons={true} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
