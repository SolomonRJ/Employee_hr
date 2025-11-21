import { ApprovalTask } from '../types';

const APPROVAL_KEY = 'emp-pwa-approvals';

const seedApprovals: ApprovalTask[] = [
  {
    id: 'ap-1001',
    type: 'leave',
    referenceId: 'lv-9001',
    requesterName: 'Rohan Patel',
    status: 'pending',
    submittedAt: Date.now() - 2 * 60 * 60 * 1000,
    meta: {
      range: 'Feb 10 - Feb 11',
      type: 'Casual Leave',
    },
  },
  {
    id: 'ap-1002',
    type: 'regularization',
    referenceId: 'rg-120',
    requesterName: 'Sara Louis',
    status: 'pending',
    submittedAt: Date.now() - 6 * 60 * 60 * 1000,
    meta: {
      date: 'Feb 07',
      remark: 'Missed punch-out',
    },
  },
];

const ensureSeeded = () => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(APPROVAL_KEY)) {
    localStorage.setItem(APPROVAL_KEY, JSON.stringify(seedApprovals));
  }
};

export const listApprovals = (): ApprovalTask[] => {
  if (typeof window === 'undefined') return [];
  ensureSeeded();
  const raw = localStorage.getItem(APPROVAL_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ApprovalTask[];
  } catch {
    return [];
  }
};

export const actOnApproval = (id: string, action: 'approved' | 'rejected'): ApprovalTask[] => {
  if (typeof window === 'undefined') return [];
  const approvals = listApprovals();
  const updated = approvals.map((approval) =>
    approval.id === id ? { ...approval, status: action } : approval
  );
  localStorage.setItem(APPROVAL_KEY, JSON.stringify(updated));
  return updated;
};

