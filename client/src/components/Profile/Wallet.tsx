import React, { useEffect, useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { formatNumber } from '@nexora/shared';

const Wallet: React.FC = () => {
  const { wallet, price, sendTokens, fetchWallet } = useWallet();
  const [sendTo, setSendTo] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleSend = async () => {
    if (!sendTo || !amount) return;
    setSending(true);
    await sendTokens(sendTo, parseFloat(amount));
    setSending(false);
    setSendTo('');
    setAmount('');
  };

  if (!wallet) return <div>Loading wallet...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Balance</p>
          <p className="text-3xl font-bold">{formatNumber(wallet.balance)} NXR</p>
          <p className="text-sm text-gray-500">≈ ${formatNumber(wallet.balance * price)} USD</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Address</p>
          <p className="font-mono text-sm">{wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold mb-2">Send Tokens</h4>
        <input
          type="text"
          placeholder="Recipient address"
          value={sendTo}
          onChange={(e) => setSendTo(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-2 dark:bg-gray-700"
        />
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 border rounded px-3 py-2 dark:bg-gray-700"
          />
          <button
            onClick={handleSend}
            disabled={sending || !sendTo || !amount}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold mb-2">Recent Transactions</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {wallet.transactions.slice(0, 5).map(tx => (
            <div key={tx.id} className="flex justify-between text-sm">
              <span className={tx.type === 'send' ? 'text-red-500' : 'text-green-500'}>
                {tx.type === 'send' ? '-' : '+'}{tx.amount} NXR
              </span>
              <span className="text-gray-500">{new Date(tx.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
