import { backendClient } from './backendClient';
import { getDB } from './db';
import { enqueueAction, registerQueueHandler } from './offlineQueue';
import { Ticket, TicketMessage } from '../types';

const USER_ID = 'usr-1001';

registerQueueHandler<Ticket>('ticket', async (payload) => {
  await backendClient.ticket(payload);
  const db = await getDB();
  await db.put('tickets', { ...payload, synced: true });
});

export const listTickets = async (): Promise<Ticket[]> => {
  const db = await getDB();
  const tickets = await db.getAll('tickets');
  return tickets.sort((a, b) => b.createdAt - a.createdAt);
};

export const createTicket = async ({
  title,
  description,
}: {
  title: string;
  description: string;
}): Promise<Ticket> => {
  const db = await getDB();
  const ticket: Ticket = {
    ticketId: `ticket_${Date.now()}`,
    userId: USER_ID,
    title,
    description,
    attachments: [],
    status: 'open',
    createdAt: Date.now(),
    messages: [
      {
        id: `msg_${Date.now()}`,
        ticketId: `ticket_${Date.now()}`,
        senderId: USER_ID,
        body: description,
        createdAt: Date.now(),
      },
    ],
    synced: false,
  };
  await db.put('tickets', ticket);
  await enqueueAction('ticket', ticket);
  return ticket;
};

export const replyToTicket = async ({
  ticketId,
  message,
}: {
  ticketId: string;
  message: string;
}): Promise<Ticket> => {
  const db = await getDB();
  const ticket = await db.get('tickets', ticketId);
  if (!ticket) {
    throw new Error('Ticket not found');
  }
  const reply: TicketMessage = {
    id: `msg_${Date.now()}`,
    ticketId,
    senderId: USER_ID,
    body: message,
    createdAt: Date.now(),
  };
  const updatedTicket: Ticket = {
    ...ticket,
    messages: [...ticket.messages, reply],
    synced: false,
  };
  await db.put('tickets', updatedTicket);
  await enqueueAction('ticket', updatedTicket);
  return updatedTicket;
};

