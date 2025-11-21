
import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

type Page = 'home' | 'punch' | 'history' | 'profile';

interface LayoutProps {
  children: React.ReactNode;
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, setActivePage }) => {
  return (
    <div className="h-screen w-screen bg-white flex flex-col font-sans text-black">
      <Header />
      <main className="flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
        <div className="p-4">
          {children}
        </div>
      </main>
      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
};

export default Layout;
