import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { requestOtp } from '../services/authService';
import { useAuth } from '../context/AuthContext';

interface AuthFormValues {
  identifier: string;
  otp: string;
}

const AuthPage: React.FC = () => {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AuthFormValues>();
  const [otpSent, setOtpSent] = useState(false);
  const [serverOtp, setServerOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const identifierValue = watch('identifier');

  const handleRequestOtp = async () => {
    if (!identifierValue) return;
    setLoading(true);
    const otp = await requestOtp(identifierValue);
    setServerOtp(otp);
    setOtpSent(true);
    setLoading(false);
    console.info(`Mock OTP for ${identifierValue}: ${otp}`);
  };

  const onSubmit = async (values: AuthFormValues) => {
    setLoading(true);
    await login({ identifier: values.identifier, otp: values.otp || serverOtp });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6">
      <div className="max-w-sm w-full mx-auto">
        <div className="mb-8 text-center">
          <p className="tracking-widest text-sm text-gray-500">ENTERPRISE ACCESS</p>
          <h1 className="text-3xl font-bold text-black mt-2">EmpPWA</h1>
          <p className="text-gray-600 mt-1">Secure employee workspace</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-black mb-2">Work Email / Phone</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-black bg-white focus:border-black"
              placeholder="you@empco.com"
              {...register('identifier', { required: 'Identifier is required' })}
            />
            {errors.identifier && <p className="text-xs text-red-500 mt-1">{errors.identifier.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-black mb-2">OTP</label>
            <div className="flex space-x-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-md px-4 py-3 text-black bg-white focus:border-black"
                placeholder="6-digit code"
                {...register('otp', { minLength: 4 })}
              />
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={!identifierValue || loading}
                className="px-4 py-3 border border-black text-black rounded-md text-sm font-semibold disabled:border-gray-300 disabled:text-gray-400"
              >
                {otpSent ? 'Resend' : 'Get OTP'}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !otpSent}
            className="w-full py-3 bg-black text-white rounded-md font-semibold disabled:bg-gray-400"
          >
            {loading ? 'Signing in...' : 'Sign In Securely'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;

