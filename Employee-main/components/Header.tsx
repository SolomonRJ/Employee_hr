
import React from 'react';
import useOnlineStatus from '../hooks/useOnlineStatus';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { user, logout } = useAuth();

  return (
    <header className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Enterprise Hub</p>
        <h1 className="text-xl font-bold text-black">EmpPWA</h1>
      </div>
      <div className="flex items-center space-x-3">
        {!isOnline && (
          <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">
            Offline queue
          </span>
        )}
        {user && (
          <button
            onClick={logout}
            className="text-xs font-semibold text-black border border-gray-300 rounded-full px-3 py-1"
          >
            {user.name.split(' ')[0]}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
