
import React, { useState, useCallback, useEffect } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PunchPage from './pages/PunchPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import useOnlineStatus from './hooks/useOnlineStatus';
import { processQueue } from './services/offlineQueue';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import { seedInitialData } from './services/seedData';

type Page = 'home' | 'punch' | 'history' | 'profile';

const pages: Record<Page, React.FC> = {
  home: HomePage,
  punch: PunchPage,
  history: HistoryPage,
  profile: ProfilePage,
};

const AppShell: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('home');
  const isOnline = useOnlineStatus();
  const { user, loading } = useAuth();

  useEffect(() => {
    seedInitialData();
  }, []);

  useEffect(() => {
    if (isOnline) {
      processQueue();
    }
  }, [isOnline]);

  const renderPage = useCallback(() => {
    const Component = pages[activePage];
    return <Component />;
  }, [activePage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        Initializing workspace...
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {renderPage()}
    </Layout>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppShell />
  </AuthProvider>
);

export default App;
