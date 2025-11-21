import { formatISO, subDays } from 'date-fns';
import { getDB } from './db';
import {
  AttendanceDay,
  LeaveBalance,
  LeaveRequest,
  Payslip,
  Ticket,
  TicketMessage,
} from '../types';

const SEED_KEY = 'emp-pwa-seeded-v1';
const USER_ID = 'usr-1001';

const buildAttendance = (): AttendanceDay[] => {
  return Array.from({ length: 30 }).map((_, idx) => {
    const date = formatISO(subDays(new Date(), idx), { representation: 'date' });
    if (idx === 0) {
      return {
        date,
        status: 'present',
        inTime: '09:42',
        outTime: '18:16',
      };
    }
    if (idx === 5) {
      return {
        date,
        status: 'holiday',
        notes: 'Republic Day',
      };
    }
    if (idx === 11) {
      return {
        date,
        status: 'leave',
        notes: 'Planned leave',
      };
    }
    return {
      date,
      status: 'present',
      inTime: '09:45',
      outTime: '18:20',
    };
  });
};

const leaveBalanceSeed: LeaveBalance[] = [
  { type: 'casual', available: 12, consumed: 3 },
  { type: 'sick', available: 8, consumed: 1 },
  { type: 'earned', available: 15, consumed: 5 },
  { type: 'optional', available: 2, consumed: 0 },
];

const leaveRequestsSeed: LeaveRequest[] = [
  {
    leaveId: 'lv-9001',
    userId: USER_ID,
    type: 'casual',
    startDate: formatISO(subDays(new Date(), 10), { representation: 'date' }),
    endDate: formatISO(subDays(new Date(), 9), { representation: 'date' }),
    reason: 'Family event',
    attachments: [],
    status: 'approved',
    approverId: 'manager-1',
    appliedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    synced: true,
  },
];

const payslipSeed: Payslip[] = [
  {
    id: 'ps-2025-10',
    userId: USER_ID,
    year: 2025,
    month: 10,
    earnings: [
      { label: 'Basic', amount: 82000 },
      { label: 'HRA', amount: 32000 },
      { label: 'Special Allowance', amount: 18500 },
    ],
    deductions: [
      { label: 'PF', amount: 7800 },
      { label: 'Professional Tax', amount: 200 },
      { label: 'Income Tax', amount: 16200 },
    ],
    net: 114500,
    pdfUrl: '#',
  },
];

const ticketMessages: TicketMessage[] = [
  {
    id: 'msg-1',
    ticketId: 'tkt-1200',
    senderId: USER_ID,
    body: 'Laptop battery drains quickly, please arrange replacement.',
    createdAt: Date.now() - 60 * 60 * 1000,
  },
  {
    id: 'msg-2',
    ticketId: 'tkt-1200',
    senderId: 'it-desk',
    body: 'Battery ordered. Expected delivery tomorrow.',
    createdAt: Date.now() - 20 * 60 * 1000,
  },
];

const ticketsSeed: Ticket[] = [
  {
    ticketId: 'tkt-1200',
    userId: USER_ID,
    title: 'Laptop battery replacement',
    description: 'Battery health dropped below 60%',
    attachments: [],
    status: 'in_progress',
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    messages: ticketMessages,
    synced: true,
  },
];

export const seedInitialData = async () => {
  if (typeof window === 'undefined') {
    return;
  }
  if (localStorage.getItem(SEED_KEY)) {
    return;
  }

  const db = await getDB();
  const attendance = buildAttendance();

  const attendanceTx = db.transaction('attendance', 'readwrite');
  for (const day of attendance) {
    await attendanceTx.store.put(day);
  }
  await attendanceTx.done;

  const leavesTx = db.transaction('leaves', 'readwrite');
  for (const item of leaveRequestsSeed) {
    await leavesTx.store.put(item);
  }
  await leavesTx.done;

  const payslipTx = db.transaction('payslips', 'readwrite');
  for (const slip of payslipSeed) {
    await payslipTx.store.put(slip);
  }
  await payslipTx.done;

  const ticketTx = db.transaction('tickets', 'readwrite');
  for (const ticket of ticketsSeed) {
    await ticketTx.store.put(ticket);
  }
  await ticketTx.done;

  localStorage.setItem('emp-pwa-leave-balance', JSON.stringify(leaveBalanceSeed));
  localStorage.setItem(SEED_KEY, 'true');
};

