import { getDB } from './db';
import { Payslip } from '../types';

export const listPayslips = async (): Promise<Payslip[]> => {
  const db = await getDB();
  const slips = await db.getAll('payslips');
  return slips.sort((a, b) => {
    if (a.year === b.year) {
      return b.month - a.month;
    }
    return b.year - a.year;
  });
};

export const getLatestPayslip = async (): Promise<Payslip | null> => {
  const slips = await listPayslips();
  return slips[0] ?? null;
};

