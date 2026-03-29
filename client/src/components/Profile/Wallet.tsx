import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Wallet as WalletIcon, 
  Send, 
  Download, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Plus,
  Minus,
  History,
  Shield,
  Settings,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

import { RootState } from '../../store';
import GlassCard from '../Common/GlassCard';
import Loader from '../Common/Loader';

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'buy' | 'sell' | 'stake' | 'unstake';
  amount: number;
  currency: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  fromAddress?: string;
  toAddress?: string;
  description?: string;
  fee?: number;
}

const Wallet: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'send' | 'receive'>('overview');
  const [loading, setLoading] = useState(false);
  
  // Демо данные для кошелька
  const [walletData] = useState({
    balance: {
      NXR: 15420.50,
      USDT: 2847.20,
      BTC: 0.0234,
      ETH: 1.2456
    },
    totalUSD: 18450.75,
    change24h: 5.67,
    address: 'NXR1x8K9mPqL3vR7zY4nQ2wE6sT5uI0oP9aS'
  });
  
  // Демо транзакции
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'receive',
      amount: 1500,
      currency: 'NXR',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'completed',
      fromAddress: 'NXR2y9L0nQr4wS8zA5pN3xF7uJ1vK6bM4cT',
      description: 'Награда за активность'
    },
    {
      id: '2',
      type: 'send',
      amount: 250,
      currency: 'USDT',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'completed',
      toAddress: 'USDT3a1B2cD4eF5gH6iJ7kL8mN9oP0qR1sT',
      fee: 2.5,
      description: 'Перевод другу'
    },
    {
      id: '3',
      type: 'buy',
      amount: 0.005,
      currency: 'BTC',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed',
      description: 'Покупка через карту'
    }
  ]);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Адрес скопирован!');
  };
  
  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'BTC' || currency === 'ETH') {
      return amount.toFixed(6);
    }
    return amount.toLocaleString('ru-RU', { minimumFractionDigits: 2 });
  };
  
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send': return ArrowUpRight;
      case 'receive': return ArrowDownLeft;
      case 'buy': return Plus;
      case 'sell': return Minus;
      default: return History;
    }
  };
  
  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'send': case 'sell': return 'text-red-400';
      case 'receive': case 'buy': return 'text-green-400';
      default: return 'text-blue-400';
    }
  };
  
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Только что';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} ч. назад`;
    } else {
      return `${Math.floor(diffInHours / 24)} дн. назад`;
    }
  };

  return (
    <div className="wallet-container">
      <GlassCard className="wallet-card">
        {/* Header */}
        <div className="wallet-header">
          <div className="wallet-title">
            <WalletIcon className="wallet-title-icon" />
            <h2>Мой кошелёк</h2>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="balance-toggle"
            >
              {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="wallet-actions">
            <button className="wallet-action-btn">
              <QrCode className="w-5 h-5" />
            </button>
            <button className="wallet-action-btn">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Баланс */}
        <div className="wallet-balance">
          <div className="balance-main">
            <span className="balance-label">Общий баланс</span>
            <div className="balance-value">
              {showBalance ? (
                <>
                  <span className="balance-amount">${formatCurrency(walletData.totalUSD, 'USD')}</span>
                  <div className={`balance-change ${walletData.change24h >= 0 ? 'positive' : 'negative'}`}>
                    {walletData.change24h >= 0 ? (
                      <TrendingUp className="change-icon" />
                    ) : (
                      <TrendingDown className="change-icon" />
                    )}
                    <span>{Math.abs(walletData.change24h).toFixed(2)}%</span>
                  </div>
                </>
              ) : (
                <span className="balance-hidden">••••••</span>
              )}
            </div>
          </div>
          
          {/* Адрес кошелька */}
          <div className="wallet-address">
            <span>Адрес:</span>
            <div className="address-container">
              <span className="address-text">
                {`${walletData.address.slice(0, 8)}...${walletData.address.slice(-8)}`}
              </span>
              <button 
                onClick={() => copyToClipboard(walletData.address)}
                className="address-copy"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Быстрые действия */}
        <div className="wallet-quick-actions">
          <button 
            onClick={() => setActiveTab('send')}
            className="quick-action-btn"
          >
            <Send className="action-icon" />
            <span>Отправить</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('receive')}
            className="quick-action-btn"
          >
            <Download className="action-icon" />
            <span>Получить</span>
          </button>
          
          <button className="quick-action-btn">
            <CreditCard className="action-icon" />
            <span>Купить</span>
          </button>
          
          <button className="quick-action-btn">
            <ExternalLink className="action-icon" />
            <span>Обменять</span>
          </button>
        </div>
        
        {/* Вкладки */}
        <div className="wallet-tabs">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`wallet-tab ${activeTab === 'overview' ? 'active' : ''}`}
          >
            Обзор
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`wallet-tab ${activeTab === 'transactions' ? 'active' : ''}`}
          >
            История
          </button>
        </div>
        
        {/* Контент вкладок */}
        <div className="wallet-content">
          {activeTab === 'overview' && (
            <div className="wallet-overview">
              <h3 className="overview-title">Мои активы</h3>
              <div className="assets-list">
                {Object.entries(walletData.balance).map(([currency, amount]) => (
                  <div key={currency} className="asset-item">
                    <div className="asset-info">
                      <div className="asset-icon">
                        {currency === 'NXR' ? '🌟' : currency === 'BTC' ? '₿' : currency === 'ETH' ? 'Ξ' : '💲'}
                      </div>
                      <div className="asset-details">
                        <span className="asset-name">{currency}</span>
                        <span className="asset-amount">
                          {showBalance ? formatCurrency(amount, currency) : '••••••'}
                        </span>
                      </div>
                    </div>
                    <div className="asset-actions">
                      <button className="asset-action-btn">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'transactions' && (
            <div className="wallet-transactions">
              <div className="transactions-header">
                <h3>Последние транзакции</h3>
                <button className="transactions-filter">
                  Все
                </button>
              </div>
              
              <div className="transactions-list">
                {transactions.map((tx) => {
                  const Icon = getTransactionIcon(tx.type);
                  const colorClass = getTransactionColor(tx.type);
                  
                  return (
                    <div key={tx.id} className="transaction-item">
                      <div className={`transaction-icon ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="transaction-details">
                        <div className="transaction-main">
                          <span className="transaction-type">
                            {tx.type === 'send' ? 'Отправлено' : 
                             tx.type === 'receive' ? 'Получено' :
                             tx.type === 'buy' ? 'Покупка' : 'Продажа'}
                          </span>
                          <span className="transaction-description">
                            {tx.description}
                          </span>
                        </div>
                        
                        <div className="transaction-meta">
                          <span className="transaction-time">
                            {formatTimeAgo(tx.timestamp)}
                          </span>
                          <span className={`transaction-status status-${tx.status}`}>
                            {tx.status === 'completed' ? 'Завершена' :
                             tx.status === 'pending' ? 'В процессе' : 'Ошибка'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="transaction-amount">
                        <span className={`amount ${tx.type === 'send' || tx.type === 'sell' ? 'negative' : 'positive'}`}>
                          {tx.type === 'send' || tx.type === 'sell' ? '-' : '+'}{
                            formatCurrency(tx.amount, tx.currency)
                          } {tx.currency}
                        </span>
                        {tx.fee && (
                          <span className="transaction-fee">
                            Комиссия: {tx.fee} {tx.currency}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button className="load-more-btn">
                <History className="w-4 h-4" />
                Загрузить ещё
              </button>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default Wallet;
