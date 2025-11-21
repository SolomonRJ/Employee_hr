import { backendClient } from './backendClient';
import { getDB } from './db';
import { enqueueAction, processQueue, registerQueueHandler } from './offlineQueue';
import { AttendanceDay, GeoLocation, InOutEntry, PunchRecord, PunchType } from '../types';
import { sha256 } from '../utils/hash';

const USER_ID = 'usr-1001';

registerQueueHandler<PunchRecord>('punch', async (payload) => {
  await backendClient.punch(payload);
  const db = await getDB();
  await db.put('punches', { ...payload, synced: true });
});

export const addPunch = async ({
  photo,
  location,
  type,
}: {
  photo: string;
  location: GeoLocation;
  type: PunchType;
}): Promise<void> => {
  const db = await getDB();
  const hash = await sha256(`${photo.slice(0, 64)}-${location.latitude}-${location.longitude}-${Date.now()}`);

  const newPunch: PunchRecord = {
    id: `punch_${Date.now()}`,
    userId: USER_ID,
    type,
    timestamp: Date.now(),
    location,
    photo,
    hash,
    synced: false,
  };

  await db.put('punches', newPunch);
  await enqueueAction('punch', newPunch);

  if (navigator.onLine) {
    await processQueue();
  }
};

export const getPunchHistory = async (): Promise<PunchRecord[]> => {
  const db = await getDB();
  const records = await db.getAll('punches');
  return records.sort((a, b) => b.timestamp - a.timestamp);
};

export const getAttendanceDays = async (): Promise<AttendanceDay[]> => {
  const db = await getDB();
  const days = await db.getAll('attendance');
  return days.sort((a, b) => (a.date < b.date ? 1 : -1));
};

export const getInOutTimeline = async (): Promise<InOutEntry[]> => {
  const punches = await getPunchHistory();
  return punches.map((punch) => ({
    id: punch.id,
    date: new Date(punch.timestamp).toISOString().slice(0, 10),
    type: punch.type,
    timestamp: punch.timestamp,
    location: punch.location,
  }));
};

