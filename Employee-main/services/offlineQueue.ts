import { getDB } from './db';
import { QueueItem, QueueItemType } from '../types';

type QueueHandler<T = unknown> = (payload: T) => Promise<void>;

const handlers = new Map<QueueItemType, QueueHandler>();

export const registerQueueHandler = <T>(type: QueueItemType, handler: QueueHandler<T>) => {
  handlers.set(type, handler as QueueHandler);
};

export const enqueueAction = async <T>(type: QueueItemType, payload: T) => {
  const db = await getDB();
  const item: QueueItem<T> = {
    id: `${type}_${Date.now()}`,
    type,
    payload,
    createdAt: Date.now(),
    attempts: 0,
  };
  await db.put('queue', item);
};

export const processQueue = async () => {
  const db = await getDB();
  const items = await db.getAll('queue');
  if (!items.length) {
    return;
  }

  for (const item of items) {
    const handler = handlers.get(item.type);
    if (!handler) {
      continue;
    }

    try {
      await handler(item.payload);
      await db.delete('queue', item.id);
    } catch (error) {
      console.warn(`Queue item ${item.id} failed`, error);
      await db.put('queue', { ...item, attempts: item.attempts + 1 });
    }
  }
};

