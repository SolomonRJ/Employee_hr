
import React, { useState, useEffect } from 'react';
import PunchCard from '../components/PunchCard';

const PunchPage: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const formattedDate = time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-black tracking-tighter">{formattedTime}</h1>
        <p className="text-lg text-gray-500">{formattedDate}</p>
      </div>
      <PunchCard />
    </div>
  );
};

export default PunchPage;
