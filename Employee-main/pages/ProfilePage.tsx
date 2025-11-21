
import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center space-y-2">
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          <img src={user.profilePicUrl || '/icons/icon-192.png'} alt="Profile" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-2xl font-bold text-black">{user.name}</h2>
        <p className="text-gray-600">{user.employeeId}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <ul className="divide-y divide-gray-200">
          <li className="p-4 flex justify-between items-center">
            <span className="font-semibold text-black">Email</span>
            <span className="text-gray-600">{user.email}</span>
          </li>
          <li className="p-4 flex justify-between items-center">
            <span className="font-semibold text-black">Phone</span>
            <span className="text-gray-600">{user.phone}</span>
          </li>
          <li className="p-4 flex justify-between items-center">
            <span className="font-semibold text-black">Role</span>
            <span className="text-gray-600 text-right">{user.role.toUpperCase()}</span>
          </li>
          <li className="p-4 flex justify-between items-center">
            <span className="font-semibold text-black">Department</span>
            <span className="text-gray-600 text-right">{user.department}</span>
          </li>
        </ul>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <button
          onClick={logout}
          className="w-full text-left text-black font-semibold px-4 py-4 border-b border-gray-200 last:border-b-0"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
