import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPunchHistory } from '../services/attendanceService';
import { processQueue } from '../services/offlineQueue';

const HistoryPage: React.FC = () => {
  const [syncing, setSyncing] = useState(false);
  const { data: punches = [], refetch, isFetching } = useQuery({
    queryKey: ['punch-history'],
    queryFn: () => getPunchHistory(),
    refetchInterval: 15000,
  });

  const handleSync = async () => {
    setSyncing(true);
    await processQueue();
    await refetch();
    setSyncing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-black">Punch History</h1>
          <p className="text-xs text-gray-500">{punches.length} records · {isFetching ? 'updating' : 'live'}</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:bg-gray-400"
        >
          {syncing ? 'Syncing...' : 'Force sync'}
        </button>
      </div>
      {punches.length === 0 ? (
        <p className="text-gray-600 text-center py-10">No punch history found.</p>
      ) : (
        <ul className="space-y-3">
          {punches.map((punch) => (
            <li
              key={punch.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-bold text-black">Punch {punch.type}</p>
                <p className="text-sm text-gray-500">{new Date(punch.timestamp).toLocaleString()}</p>
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${
                  punch.synced ? 'bg-gray-200 text-gray-800' : 'bg-gray-800 text-white'
                }`}
              >
                {punch.synced ? 'Synced' : 'Pending'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryPage;

