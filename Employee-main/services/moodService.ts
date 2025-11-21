import { backendClient } from './backendClient';
import { getDB } from './db';
import { enqueueAction, registerQueueHandler } from './offlineQueue';
import { MoodEntry, MoodType } from '../types';

const USER_ID = 'usr-1001';

registerQueueHandler<MoodEntry>('mood', async (payload) => {
  await backendClient.mood(payload);
  const db = await getDB();
  await db.put('moods', { ...payload, synced: true });
});

export const getMoodForDate = async (date: string): Promise<MoodEntry | undefined> => {
  const db = await getDB();
  const all = await db.getAll('moods');
  return all.find((entry) => entry.date === date && entry.userId === USER_ID);
};

export const saveMood = async (mood: MoodType, note?: string): Promise<MoodEntry> => {
  const db = await getDB();
  const entry: MoodEntry = {
    id: `mood_${Date.now()}`,
    userId: USER_ID,
    mood,
    note,
    date: new Date().toISOString().slice(0, 10),
    synced: false,
  };
  await db.put('moods', entry);
  await enqueueAction('mood', entry);
  return entry;
};

