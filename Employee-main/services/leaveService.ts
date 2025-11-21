import { differenceInCalendarDays } from 'date-fns';
import { backendClient } from './backendClient';
import { getDB } from './db';
import { enqueueAction, processQueue, registerQueueHandler } from './offlineQueue';
import { LeaveBalance, LeaveRequest } from '../types';

const LEAVE_BALANCE_KEY = 'emp-pwa-leave-balance';
const USER_ID = 'usr-1001';

registerQueueHandler<LeaveRequest>('leave', async (payload) => {
  await backendClient.leave(payload);
  const db = await getDB();
  await db.put('leaves', { ...payload, synced: true, status: 'pending' });
});

export const getLeaveBalance = (): LeaveBalance[] => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(LEAVE_BALANCE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as LeaveBalance[];
  } catch {
    return [];
  }
};

export const updateLeaveBalance = (balances: LeaveBalance[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LEAVE_BALANCE_KEY, JSON.stringify(balances));
};

export const listLeaves = async (): Promise<LeaveRequest[]> => {
  const db = await getDB();
  const leaves = await db.getAll('leaves');
  return leaves.sort((a, b) => b.appliedAt - a.appliedAt);
};

export const applyLeave = async (payload: {
  type: LeaveRequest['type'];
  startDate: string;
  endDate: string;
  reason: string;
}): Promise<LeaveRequest> => {
  const db = await getDB();
  const leave: LeaveRequest = {
    leaveId: `leave_${Date.now()}`,
    userId: USER_ID,
    type: payload.type,
    startDate: payload.startDate,
    endDate: payload.endDate,
    reason: payload.reason,
    status: 'pending',
    appliedAt: Date.now(),
    attachments: [],
    synced: false,
  };

  await db.put('leaves', leave);
  await enqueueAction('leave', leave);
  const daysRequested = differenceInCalendarDays(new Date(payload.endDate), new Date(payload.startDate)) + 1;
  const balances = getLeaveBalance();
  const balanceIndex = balances.findIndex((balance) => balance.type === payload.type);
  if (balanceIndex >= 0) {
    balances[balanceIndex] = {
      ...balances[balanceIndex],
      consumed: balances[balanceIndex].consumed + daysRequested,
    };
    updateLeaveBalance(balances);
  }

  if (navigator.onLine) {
    processQueue();
  }

  return leave;
};

