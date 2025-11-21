
export type Role = 'employee' | 'manager' | 'admin';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
}

export type PunchType = 'IN' | 'OUT';

export interface PunchRecord {
  id: string;
  userId: string;
  type: PunchType;
  timestamp: number;
  location: GeoLocation;
  photo: string;
  synced: boolean;
  hash: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  phone: string;
  email: string;
  role: Role;
  employeeId: string;
  department: string;
  profilePicUrl?: string;
  jwt?: string;
}

export type MoodType = 'very_happy' | 'happy' | 'neutral' | 'sad' | 'very_sad';

export interface MoodEntry {
  id: string;
  userId: string;
  mood: MoodType;
  note?: string;
  date: string; // YYYY-MM-DD
  synced: boolean;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  leaveId: string;
  userId: string;
  type: 'casual' | 'sick' | 'earned' | 'optional';
  startDate: string;
  endDate: string;
  reason: string;
  attachments?: string[];
  status: LeaveStatus;
  approverId?: string;
  appliedAt: number;
  synced: boolean;
}

export interface LeaveBalance {
  type: LeaveRequest['type'];
  available: number;
  consumed: number;
}

export interface PayslipLineItem {
  label: string;
  amount: number;
}

export interface Payslip {
  id: string;
  userId: string;
  year: number;
  month: number;
  earnings: PayslipLineItem[];
  deductions: PayslipLineItem[];
  net: number;
  pdfUrl?: string;
}

export interface AttendanceDay {
  date: string;
  status: 'present' | 'absent' | 'half-day' | 'holiday' | 'leave' | 'pending';
  inTime?: string;
  outTime?: string;
  notes?: string;
}

export interface InOutEntry {
  id: string;
  date: string;
  type: PunchType;
  timestamp: number;
  reason?: string;
  location?: GeoLocation;
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  body: string;
  createdAt: number;
  attachments?: string[];
}

export interface Ticket {
  ticketId: string;
  userId: string;
  title: string;
  description: string;
  attachments?: string[];
  status: TicketStatus;
  createdAt: number;
  messages: TicketMessage[];
  synced: boolean;
}

export type ApprovalType = 'leave' | 'regularization' | 'shift-change';

export interface ApprovalTask {
  id: string;
  type: ApprovalType;
  referenceId: string;
  requesterName: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: number;
  meta?: Record<string, string>;
}

export type QueueItemType = 'punch' | 'leave' | 'ticket' | 'mood';

export interface QueueItem<T = unknown> {
  id: string;
  type: QueueItemType;
  payload: T;
  createdAt: number;
  attempts: number;
}
