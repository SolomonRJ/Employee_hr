import React, { useState, useCallback } from 'react';
import CameraView from './CameraView';
import useGeoLocation from '../hooks/useGeoLocation';
import { addPunch } from '../services/attendanceService';
import { PunchType } from '../types';
import { CameraIcon, CheckCircleIcon } from './icons';

type PunchState = 'idle' | 'capturing' | 'processing' | 'success' | 'error';

const PunchCard: React.FC = () => {
  const [punchState, setPunchState] = useState<PunchState>('idle');
  const [punchType, setPunchType] = useState<PunchType>('IN');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { getLocation, loading: locationLoading } = useGeoLocation();

  const handlePunchClick = () => {
    setPunchState('capturing');
  };

  const handleCapture = useCallback(
    async (photo: string) => {
      setPunchState('processing');
      try {
        const location = await getLocation();
        if (!location) {
          throw new Error('Location unavailable');
        }
        if (location.accuracy > 150) {
          throw new Error('Location accuracy too low. Move outdoors.');
        }
        await addPunch({ photo, location, type: punchType });
        setPunchState('success');
        setTimeout(() => {
          setPunchState('idle');
          setPunchType((prev) => (prev === 'IN' ? 'OUT' : 'IN'));
        }, 2500);
      } catch (error) {
        setErrorMessage((error as Error).message);
        setPunchState('error');
      }
    },
    [getLocation, punchType]
  );

  const handleCameraClose = () => {
    setPunchState('idle');
  };

  const renderContent = () => {
    switch (punchState) {
      case 'processing':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto" />
            <p className="mt-4 text-gray-600">
              {locationLoading ? 'Locking location...' : 'Uploading securely...'}
            </p>
          </div>
        );
      case 'success':
        return (
          <div className="text-center text-black space-y-2">
            <CheckCircleIcon />
            <p className="font-bold text-lg">Punch {punchType} captured</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Synced when online</p>
          </div>
        );
      case 'error':
        return (
          <div className="text-center text-black space-y-3">
            <p className="font-bold text-lg">Unable to punch</p>
            <p className="text-gray-600 text-sm">{errorMessage}</p>
            <button
              onClick={() => setPunchState('idle')}
              className="w-full bg-black text-white px-4 py-2 rounded-md font-semibold"
            >
              Retry
            </button>
          </div>
        );
      case 'idle':
      default:
        return (
          <button
            onClick={handlePunchClick}
            className="w-full h-full flex flex-col items-center justify-center bg-black text-white rounded-lg transition-transform active:scale-95 space-y-2"
          >
            <CameraIcon />
            <span className="text-xl font-bold tracking-widest">Punch {punchType}</span>
            <span className="text-[10px] uppercase tracking-[0.2em]">Face + GPS</span>
          </button>
        );
    }
  };

  return (
    <>
      {punchState === 'capturing' && <CameraView onCapture={handleCapture} onClose={handleCameraClose} />}
      <div className="w-full max-w-sm h-56 bg-white border border-gray-200 rounded-3xl shadow-md flex items-center justify-center p-4">
        {renderContent()}
      </div>
    </>
  );
};

export default PunchCard;

