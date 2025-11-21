
import React from 'react';
import { HomeIcon, FingerprintIcon, HistoryIcon, UserIcon } from './icons';

type Page = 'home' | 'punch' | 'history' | 'profile';

interface BottomNavProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
      isActive ? 'text-black' : 'text-gray-400'
    }`}
  >
    {icon}
    <span className={`text-xs mt-1 ${isActive ? 'font-bold' : 'font-normal'}`}>
      {label}
    </span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activePage, setActivePage }) => {
  return (
    <footer className="flex-shrink-0 bg-white border-t border-gray-200 flex justify-around">
      <NavItem
        icon={<HomeIcon />}
        label="Home"
        isActive={activePage === 'home'}
        onClick={() => setActivePage('home')}
      />
      <NavItem
        icon={<FingerprintIcon />}
        label="Punch"
        isActive={activePage === 'punch'}
        onClick={() => setActivePage('punch')}
      />
      <NavItem
        icon={<HistoryIcon />}
        label="History"
        isActive={activePage === 'history'}
        onClick={() => setActivePage('history')}
      />
      <NavItem
        icon={<UserIcon />}
        label="Profile"
        isActive={activePage === 'profile'}
        onClick={() => setActivePage('profile')}
      />
    </footer>
  );
};

export default BottomNav;
