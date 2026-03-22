import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const { login, verify2FA, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tempToken) {
      await verify2FA(tempToken, twoFactorCode);
    } else {
      const res = await login(email, password);
      if (res?.twoFactorRequired) {
        setTempToken(res.tempToken);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Login to Nexora</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!tempToken ? (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </>
        ) : (
          <input
            type="text"
            placeholder="2FA Code"
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            required
          />
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : tempToken ? 'Verify 2FA' : 'Login'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        Don't have an account? <Link to="/register" className="text-blue-500">Register</Link>
      </p>
    </div>
  );
};

export default LoginForm;
