import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { getLeaveBalance, listLeaves, applyLeave } from '../services/leaveService';
import { getLatestPayslip } from '../services/payslipService';
import { getAttendanceDays, getInOutTimeline } from '../services/attendanceService';
import { createTicket, listTickets } from '../services/ticketService';
import { actOnApproval, listApprovals } from '../services/approvalService';
import { getMoodForDate, saveMood } from '../services/moodService';
import { MoodType } from '../types';

const moodOptions: { id: MoodType; label: string; emoji: string }[] = [
  { id: 'very_happy', label: 'Epic', emoji: '😁' },
  { id: 'happy', label: 'Upbeat', emoji: '🙂' },
  { id: 'neutral', label: 'Neutral', emoji: '😐' },
  { id: 'sad', label: 'Stretched', emoji: '🙁' },
  { id: 'very_sad', label: 'Exhausted', emoji: '😣' },
];

const HomePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    type: 'casual' as const,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    reason: '',
  });
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
  });
  const today = new Date().toISOString().slice(0, 10);

  const { data: leaveBalance = [] } = useQuery({
    queryKey: ['leave-balance'],
    queryFn: async () => getLeaveBalance(),
  });

  const { data: leaves = [] } = useQuery({
    queryKey: ['leaves'],
    queryFn: () => listLeaves(),
  });

  const { data: payslip } = useQuery({
    queryKey: ['payslip-latest'],
    queryFn: () => getLatestPayslip(),
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['attendance-days'],
    queryFn: () => getAttendanceDays(),
  });

  const { data: inOut = [] } = useQuery({
    queryKey: ['inout'],
    queryFn: () => getInOutTimeline(),
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => listTickets(),
  });

  const { data: approvals = [] } = useQuery({
    queryKey: ['approvals'],
    queryFn: async () => listApprovals(),
  });

  const { data: moodEntry } = useQuery({
    queryKey: ['mood', today],
    queryFn: () => getMoodForDate(today),
  });

  const leaveMutation = useMutation({
    mutationFn: applyLeave,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['leaves'] });
      await queryClient.invalidateQueries({ queryKey: ['leave-balance'] });
      setShowLeaveForm(false);
      setLeaveForm({
        type: 'casual',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        reason: '',
      });
    },
  });

  const moodMutation = useMutation({
    mutationFn: ({ mood, note }: { mood: MoodType; note?: string }) => saveMood(mood, note),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['mood', today] });
    },
  });

  const ticketMutation = useMutation({
    mutationFn: createTicket,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setShowTicketForm(false);
      setTicketForm({ title: '', description: '' });
    },
  });

  const approvalMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approved' | 'rejected' }) =>
      Promise.resolve(actOnApproval(id, action)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });

  const weeklyAttendance = useMemo(() => attendance.slice(0, 7).reverse(), [attendance]);
  const todaysPunches = useMemo(() => inOut.filter((entry) => entry.date === today), [inOut, today]);

  const handleLeaveSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    leaveMutation.mutate(leaveForm);
  };

  const handleTicketSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    ticketMutation.mutate(ticketForm);
  };

  return (
    <div className="space-y-6 pb-24">
      <section className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Today</p>
            <h2 className="text-2xl font-bold text-black">{format(new Date(), 'EEEE, MMM d')}</h2>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Next event</p>
            <p className="text-sm font-semibold text-black">1:1 with CTO · 15:00</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {leaveBalance.map((balance) => (
          <div key={balance.type} className="bg-white border border-gray-200 rounded-lg p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">{balance.type} leave</p>
            <p className="text-3xl font-bold text-black">{balance.available - balance.consumed}</p>
            <p className="text-xs text-gray-500">available</p>
          </div>
        ))}
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-black">Attendance · 7 days</h3>
          <span className="text-xs text-gray-500">{weeklyAttendance.length} days synced</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weeklyAttendance.map((day) => (
            <div key={day.date} className="flex flex-col items-center">
              <span className="text-xs text-gray-500">{format(new Date(day.date), 'EE')}</span>
              <span
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  day.status === 'present'
                    ? 'bg-black text-white'
                    : day.status === 'leave'
                    ? 'bg-gray-200 text-black'
                    : 'border border-gray-300 text-gray-700'
                }`}
              >
                {format(new Date(day.date), 'd')}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-black">Today&apos;s punches</h3>
          <button className="text-xs text-black underline" onClick={() => setShowLeaveForm(true)}>
            Apply leave
          </button>
        </div>
        {todaysPunches.length === 0 ? (
          <p className="text-gray-500 text-sm">No punches yet. Capture from Punch tab.</p>
        ) : (
          <ul className="space-y-3">
            {todaysPunches.map((punch) => (
              <li key={punch.id} className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-black">Punch {punch.type}</p>
                  <p className="text-xs text-gray-500">{format(new Date(punch.timestamp), 'hh:mm a')}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {punch.location?.accuracy ? `${Math.round(punch.location.accuracy)}m` : 'GPS'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-black">Recent leaves</h3>
          <span className="text-xs text-gray-500">{leaves.length} records</span>
        </div>
        <ul className="space-y-3">
          {leaves.slice(0, 3).map((leave) => (
            <li key={leave.leaveId} className="border border-gray-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-black capitalize">{leave.type} leave</p>
              <p className="text-xs text-gray-500">
                {format(new Date(leave.startDate), 'MMM d')} → {format(new Date(leave.endDate), 'MMM d')}
              </p>
              <span className="text-xs uppercase text-gray-500">{leave.status}</span>
            </li>
          ))}
        </ul>
      </section>

      {payslip && (
        <section className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Net Pay</p>
              <p className="text-3xl font-bold text-black">₹{payslip.net.toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-500">
                {format(new Date(payslip.year, payslip.month - 1), 'MMMM yyyy')}
              </p>
            </div>
            <button className="text-xs font-semibold border border-black text-black rounded-full px-4 py-1">
              Download PDF
            </button>
          </div>
          <div className="h-44">
            <ResponsiveContainer>
              <BarChart
                data={[
                  { name: 'Earnings', amount: payslip.earnings.reduce((sum, item) => sum + item.amount, 0) },
                  { name: 'Deductions', amount: payslip.deductions.reduce((sum, item) => sum + item.amount, 0) },
                ]}
              >
                <CartesianGrid stroke="#f1f1f1" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#666" />
                <Tooltip contentStyle={{ background: '#000', border: 'none', color: '#fff' }} />
                <Bar dataKey="amount" fill="#000" radius={[4, 4, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-black">Approvals</h3>
          <span className="text-xs text-gray-500">{approvals.length} pending</span>
        </div>
        <ul className="space-y-3">
          {approvals.map((approval) => (
            <li
              key={approval.id}
              className="border border-gray-200 rounded-lg p-3 flex flex-col space-y-2"
            >
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="text-sm font-semibold text-black">{approval.requesterName}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {approval.type} · {approval.meta?.range || approval.meta?.date}
                  </p>
                </div>
                <span className="text-xs text-gray-500">{format(approval.submittedAt, 'HH:mm')}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  className="flex-1 border border-gray-300 rounded-full py-1 text-xs font-semibold"
                  disabled={approval.status !== 'pending' || approvalMutation.isPending}
                  onClick={() => approvalMutation.mutate({ id: approval.id, action: 'rejected' })}
                >
                  Reject
                </button>
                <button
                  className="flex-1 bg-black text-white rounded-full py-1 text-xs font-semibold disabled:bg-gray-400"
                  disabled={approval.status !== 'pending' || approvalMutation.isPending}
                  onClick={() => approvalMutation.mutate({ id: approval.id, action: 'approved' })}
                >
                  Approve
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-black">Helpdesk</h3>
            <span className="text-xs text-gray-500">{tickets.length} tickets</span>
          </div>
          <button
            className="text-xs font-semibold border border-black text-black rounded-full px-3 py-1"
            onClick={() => setShowTicketForm(true)}
          >
            New ticket
          </button>
        </div>
        <ul className="space-y-3">
          {tickets.map((ticket) => (
            <li key={ticket.ticketId} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-black">{ticket.title}</p>
                <span className="text-xs uppercase text-gray-500">{ticket.status}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 overflow-hidden text-ellipsis whitespace-nowrap">{ticket.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <AnimatePresence>
        {!moodEntry && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 w-[90%] space-y-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Daily check-in</p>
              <h4 className="text-2xl font-bold text-black">How are you starting today?</h4>
              <div className="grid grid-cols-5 gap-2">
                {moodOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => moodMutation.mutate({ mood: option.id })}
                    className="border border-gray-200 rounded-xl py-3 flex flex-col items-center hover:border-black transition-colors"
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="text-[10px] uppercase tracking-wide text-gray-600 mt-1">{option.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLeaveForm && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-end z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLeaveForm(false)}
          >
            <motion.form
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleLeaveSubmit}
              className="bg-white rounded-t-3xl p-6 w-full space-y-4"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
            >
              <h4 className="text-xl font-bold text-black">Apply leave</h4>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase tracking-wide">Type</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-black"
                  value={leaveForm.type}
                  onChange={(e) => setLeaveForm((prev) => ({ ...prev, type: e.target.value as typeof prev.type }))}
                >
                  <option value="casual">Casual</option>
                  <option value="sick">Sick</option>
                  <option value="earned">Earned</option>
                  <option value="optional">Optional</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">From</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-black"
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm((prev) => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">To</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-black"
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm((prev) => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase tracking-wide">Reason</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-black"
                  rows={3}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Explain briefly"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  className="flex-1 border border-gray-300 rounded-lg py-3 text-black font-semibold"
                  onClick={() => setShowLeaveForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={leaveMutation.isPending}
                  className="flex-1 bg-black text-white rounded-lg py-3 font-semibold disabled:bg-gray-400"
                >
                  {leaveMutation.isPending ? 'Submitting' : 'Submit'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTicketForm && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-end z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTicketForm(false)}
          >
            <motion.form
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleTicketSubmit}
              className="bg-white rounded-t-3xl p-6 w-full space-y-4"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
            >
              <h4 className="text-xl font-bold text-black">New helpdesk ticket</h4>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase tracking-wide">Subject</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-black"
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Laptop battery replacement"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase tracking-wide">Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-black"
                  rows={4}
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Share detailed context"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  className="flex-1 border border-gray-300 rounded-lg py-3 text-black font-semibold"
                  onClick={() => setShowTicketForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ticketMutation.isPending}
                  className="flex-1 bg-black text-white rounded-lg py-3 font-semibold disabled:bg-gray-400"
                >
                  {ticketMutation.isPending ? 'Creating' : 'Submit'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;

