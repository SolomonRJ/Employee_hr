import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { randomUUID } from 'crypto';
import { approvals, leaveBalance, leaves, payslips, punches, tickets, user } from './data';

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

app.post('/api/auth/login', (req, res) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ message: 'identifier required' });
  }
  return res.json({
    token: `jwt-${Date.now()}`,
    refreshToken: `refresh-${Date.now()}`,
    user,
  });
});

app.get('/api/auth/me', (_req, res) => {
  res.json(user);
});

app.post('/api/auth/refresh', (req, res) => {
  if (!req.body?.refreshToken) {
    return res.status(400).json({ message: 'refreshToken missing' });
  }
  res.json({ token: `jwt-${Date.now()}`, refreshToken: `refresh-${Date.now()}` });
});

app.post('/api/attendance/punch', (req, res) => {
  const payload = req.body;
  punches.push({
    attendanceId: randomUUID(),
    userId: user.userId,
    ...payload,
    status: 'synced',
  });
  res.status(201).json({ success: true, serverTimestamp: Date.now() });
});

app.get('/api/attendance/daily', (_req, res) => {
  res.json(punches);
});

app.get('/api/attendance/inout', (_req, res) => {
  res.json(punches);
});

app.post('/api/leave/apply', (req, res) => {
  const leave = {
    leaveId: randomUUID(),
    ...req.body,
    status: 'pending',
  };
  leaves.push(leave);
  res.status(201).json(leave);
});

app.get('/api/leave/list', (_req, res) => {
  res.json(leaves);
});

app.get('/api/leave/balance', (_req, res) => {
  res.json(leaveBalance);
});

app.post('/api/leave/:id/approve', (req, res) => {
  const leave = leaves.find((item) => item.leaveId === req.params.id);
  if (!leave) {
    return res.status(404).json({ message: 'leave not found' });
  }
  leave.status = req.body?.action === 'rejected' ? 'rejected' : 'approved';
  res.json(leave);
});

app.post('/api/ticket/create', (req, res) => {
  const ticket = {
    ticketId: randomUUID(),
    ...req.body,
    status: 'open',
  };
  tickets.push(ticket);
  res.status(201).json(ticket);
});

app.get('/api/ticket/list', (_req, res) => {
  res.json(tickets);
});

app.post('/api/ticket/:id/reply', (req, res) => {
  const ticket = tickets.find((item) => item.ticketId === req.params.id);
  if (!ticket) {
    return res.status(404).json({ message: 'ticket not found' });
  }
  ticket.status = req.body?.status ?? ticket.status;
  res.json(ticket);
});

app.get('/api/payslip/:year/:month', (req, res) => {
  const slip = payslips.find(
    (item) => item.year === Number(req.params.year) && item.month === Number(req.params.month)
  );
  if (!slip) {
    return res.status(404).json({ message: 'payslip not found' });
  }
  res.json(slip);
});

app.get('/api/approvals', (_req, res) => {
  res.json(approvals);
});

app.post('/api/approval/:id/action', (req, res) => {
  const approval = approvals.find((item) => item.id === req.params.id);
  if (!approval) {
    return res.status(404).json({ message: 'approval not found' });
  }
  approval.status = req.body?.action ?? approval.status;
  res.json(approval);
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Stub API listening on ${port}`);
});

