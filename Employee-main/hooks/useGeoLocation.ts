import { useState } from 'react';
import { GeoLocation } from '../types';

interface GeoLocationState {
  loading: boolean;
  error: GeolocationPositionError | null;
  data: GeoLocation | null;
}

const captureLocation = (): Promise<GeoLocation> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation unsupported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });

const useGeoLocation = () => {
  const [state, setState] = useState<GeoLocationState>({
    loading: false,
    error: null,
    data: null,
  });

  const getLocation = async () => {
    setState({ loading: true, error: null, data: null });
    try {
      const data = await captureLocation();
      setState({ loading: false, error: null, data });
      return data;
    } catch (error) {
      const geoError = error as GeolocationPositionError;
      setState({ loading: false, error: geoError, data: null });
      throw error;
    }
  };

  return { ...state, getLocation };
};

export default useGeoLocation;

