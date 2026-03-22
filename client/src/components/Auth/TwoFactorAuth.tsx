import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const TwoFactorAuth: React.FC = () => {
  const { setup2FA, enable2FA, user } = useAuth();
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');

  const handleSetup = async () => {
    const data = await setup2FA();
    if (data) setSecret(data.secret);
  };

  const handleEnable = async () => {
    await enable2FA(code);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">Two-Factor Authentication</h3>
      {user?.twoFactorEnabled ? (
        <p className="text-green-500">2FA is enabled</p>
      ) : secret ? (
        <div>
          <p>Scan this QR code with Google Authenticator:</p>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${secret}`} alt="QR" />
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="border rounded px-2 py-1 mt-2"
          />
          <button onClick={handleEnable} className="bg-blue-500 text-white px-4 py-1 rounded mt-2">
            Enable
          </button>
        </div>
      ) : (
        <button onClick={handleSetup} className="bg-blue-500 text-white px-4 py-2 rounded">
          Setup 2FA
        </button>
      )}
    </div>
  );
};

export default TwoFactorAuth;
