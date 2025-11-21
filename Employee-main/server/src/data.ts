import { randomUUID } from 'crypto';

export const user = {
  userId: 'usr-1001',
  name: 'Anika Sharma',
  phone: '+91 98765 12345',
  role: 'manager',
  email: 'anika.sharma@empco.com',
  profilePicUrl: '/icons/icon-192.png',
};

export const punches = [
  {
    attendanceId: randomUUID(),
    userId: user.userId,
    type: 'in',
    timestamp: Date.now() - 60 * 60 * 1000,
    location: {
      latitude: 12.9352,
      longitude: 77.6245,
    },
    photoUrl: '',
    status: 'synced',
  },
];

export const leaves = [
  {
    leaveId: 'lv-9001',
    userId: user.userId,
    type: 'casual',
    startDate: '2025-02-10',
    endDate: '2025-02-11',
    reason: 'Family ceremony',
    attachments: [],
    status: 'approved',
  },
];

export const tickets = [
  {
    ticketId: 'tkt-1200',
    userId: user.userId,
    title: 'Laptop battery replacement',
    desc: 'Battery health below 60%',
    attachments: [],
    status: 'in_progress',
  },
];

export const leaveBalance = [
  { type: 'casual', available: 12, consumed: 3 },
  { type: 'sick', available: 8, consumed: 1 },
  { type: 'earned', available: 15, consumed: 5 },
  { type: 'optional', available: 2, consumed: 0 },
];

export const approvals = [
  {
    id: 'ap-1001',
    requesterName: 'Rohan Patel',
    type: 'leave',
    referenceId: 'lv-9001',
    status: 'pending',
    submittedAt: Date.now() - 60 * 60 * 1000,
    meta: {
      range: 'Feb 10-11',
    },
  },
];

export const payslips = [
  {
    id: 'ps-2025-10',
    userId: user.userId,
    year: 2025,
    month: 10,
    earnings: [
      { label: 'Basic', amount: 82000 },
      { label: 'HRA', amount: 32000 },
    ],
    deductions: [
      { label: 'PF', amount: 7800 },
      { label: 'Professional Tax', amount: 200 },
    ],
    net: 114500,
  },
];

