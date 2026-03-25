import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, ArrowRight } from 'lucide-react';

const LoginForm: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Demo mode: any phone number works
    setStep('code');
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Demo mode: any 6-digit code works
    const result = await login(`${phone}@nexora.com`, `code_${code}`);
    if (result?.token) {
      navigate('/chats');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C12] flex items-center justify-center p-4">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0A0C12] via-[#1A1D2D] to-[#0A0C12]" />
      
      {/* Animated Stars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
          />
        ))}
      </div>

      {/* Glass Card */}
      <div className="relative w-full max-w-md">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#6C5CE7] to-[#00D9FF] rounded-[28px] blur opacity-30" />
        
        <div className="relative bg-[rgba(17,21,31,0.6)] backdrop-blur-xl border border-white/10 rounded-[28px] p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#00D9FF] flex items-center justify-center shadow-xl">
              <span className="text-4xl font-bold text-white">N</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-white mb-2">Welcome Back</h2>
          <p className="text-[#8E9AAF] text-center mb-8">
            {step === 'phone' ? 'Enter your phone number' : 'Enter verification code'}
          </p>

          <form onSubmit={step === 'phone' ? handlePhoneSubmit : handleCodeSubmit} className="space-y-4">
            {step === 'phone' ? (
              <>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E9AAF]" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[rgba(26,29,45,0.6)] border border-white/10 rounded-2xl text-white placeholder-[#8E9AAF] focus:outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20 transition"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E9AAF]" />
                  <input
                    type="text"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="w-full pl-12 pr-4 py-4 bg-[rgba(26,29,45,0.6)] border border-white/10 rounded-2xl text-white placeholder-[#8E9AAF] focus:outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20 transition text-center text-2xl tracking-widest"
                    required
                  />
                </div>
              </>
            )}

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-xl">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#6C5CE7] to-[#00D9FF] text-white rounded-2xl font-semibold hover:opacity-90 disabled:opacity-50 transition transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#6C5CE7]/25 flex items-center justify-center gap-2"
            >
              {loading ? 'Loading...' : step === 'phone' ? (
                <>
                  Continue <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                'Verify'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[#8E9AAF] text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#6C5CE7] hover:text-[#00D9FF] transition font-semibold">
              Create Account
            </Link>
          </p>

          <p className="mt-4 text-center text-[#8E9AAF] text-xs opacity-60">
            Demo mode: Any phone number and code (123456) works
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
