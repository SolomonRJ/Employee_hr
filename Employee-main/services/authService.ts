import { UserProfile } from '../types';

const STORAGE_KEY = 'emp-pwa-auth-user';

const seedUser: UserProfile = {
  userId: 'usr-1001',
  name: 'Anika Sharma',
  phone: '+91 98765 12345',
  email: 'anika.sharma@empco.com',
  role: 'manager',
  employeeId: 'EMP-4092',
  department: 'People Operations',
  profilePicUrl: '/icons/icon-192.png',
};

export const requestOtp = async (identifier: string): Promise<string> => {
  console.info(`OTP requested for ${identifier}`);
  // In production this would call backend to send OTP
  return new Promise((resolve) => {
    const code = `${Math.floor(100000 + Math.random() * 900000)}`;
    setTimeout(() => resolve(code), 500);
  });
};

export const login = async ({
  identifier,
  otp,
}: {
  identifier: string;
  otp: string;
}): Promise<UserProfile> => {
  if (!identifier || otp.length < 4) {
    throw new Error('Invalid credentials');
  }

  const profile = {
    ...seedUser,
    email: identifier,
    jwt: `mock-jwt-${Date.now()}`,
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }
  return profile;
};

export const logout = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};

export const getStoredUser = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
};

