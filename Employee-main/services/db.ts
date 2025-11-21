
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import {
  AttendanceDay,
  LeaveRequest,
  MoodEntry,
  Payslip,
  PunchRecord,
  QueueItem,
  Ticket,
} from '../types';

export interface EmpPWADb extends DBSchema {
  punches: {
    key: string;
    value: PunchRecord;
  };
  queue: {
    key: string;
    value: QueueItem;
  };
  leaves: {
    key: string;
    value: LeaveRequest;
  };
  moods: {
    key: string;
    value: MoodEntry;
  };
  tickets: {
    key: string;
    value: Ticket;
  };
  attendance: {
    key: string;
    value: AttendanceDay;
  };
  payslips: {
    key: string;
    value: Payslip;
  };
}

let dbPromise: Promise<IDBPDatabase<EmpPWADb>> | null = null;

type EmpStoreName = 'punches' | 'queue' | 'leaves' | 'moods' | 'tickets' | 'attendance' | 'payslips';

export const getDB = async (): Promise<IDBPDatabase<EmpPWADb>> => {
  if (!dbPromise) {
    dbPromise = openDB<EmpPWADb>('employee-pwa-db', 2, {
      upgrade(database, oldVersion) {
        if (oldVersion < 1) {
          database.createObjectStore('punches', { keyPath: 'id' });
          database.createObjectStore('queue', { keyPath: 'id' });
        }
        if (oldVersion < 2) {
          database.createObjectStore('leaves', { keyPath: 'leaveId' });
          database.createObjectStore('moods', { keyPath: 'id' });
          database.createObjectStore('tickets', { keyPath: 'ticketId' });
          database.createObjectStore('attendance', { keyPath: 'date' });
          database.createObjectStore('payslips', { keyPath: 'id' });
        }
      },
    });
  }

  return dbPromise;
};

export const resetStore = async (storeName: EmpStoreName) => {
  const db = await getDB();
  const tx = db.transaction(storeName, 'readwrite');
  await tx.store.clear();
  await tx.done;
};
