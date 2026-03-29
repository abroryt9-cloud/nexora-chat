import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { RootState } from '../../store';
import { loginUser, demoLogin } from '../../store/authSlice';
import GlassCard from '../Common/GlassCard';
import Loader from '../Common/Loader';

const LoginForm = (): JSX.Element => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
  });
  
  const [demoData, setDemoData] = useState({
    phone: '',
    code: '123456',
  });
  
  const [isDemo, setIsDemo] = useState(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDemoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDemoData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.loginId || !formData.password) {
      toast.error('Пожалуйста, заполните все поля');
      return;
    }
    
    try {
      await dispatch(loginUser(formData) as any).unwrap();
      toast.success('Добро пожаловать!');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка входа');
    }
  };
  
  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!demoData.phone) {
      toast.error('Введите любой номер телефона');
      return;
    }
    
    try {
      await dispatch(demoLogin(demoData) as any).unwrap();
      toast.success('Добро пожаловать в демо режим!');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка демо входа');
    }
  };

  return (
    <div className="auth-form-container">
      <GlassCard className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Добро пожаловать в Nexora</h1>
          <p className="auth-subtitle">Войдите в свой аккаунт или попробуйте демо</p>
        </div>
        
        <div className="auth-tabs">
          <button 
            className={`tab ${isDemo ? 'active' : ''}`}
            onClick={() => setIsDemo(true)}
          >
            Демо вход
          </button>
          <button 
            className={`tab ${!isDemo ? 'active' : ''}`}
            onClick={() => setIsDemo(false)}
          >
            Обычный вход
          </button>
        </div>
        
        {isDemo ? (
          <form onSubmit={handleDemoLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="phone">Номер телефона (любой)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={demoData.phone}
                onChange={handleDemoChange}
                placeholder="+7 900 123 45 67"
                className="form-input"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="code">Код подтверждения</label>
              <input
                type="text"
                id="code"
                name="code"
                value={demoData.code}
                onChange={handleDemoChange}
                placeholder="123456"
                className="form-input"
                maxLength={6}
                disabled={loading}
              />
              <p className="form-hint">Используйте код: 123456</p>
            </div>
            
            <button 
              type="submit" 
              className="auth-button demo"
              disabled={loading}
            >
              {loading ? <Loader size="sm" /> : 'Войти в демо'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="loginId">Email или логин</label>
              <input
                type="text"
                id="loginId"
                name="loginId"
                value={formData.loginId}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className="form-input"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="form-input"
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? <Loader size="sm" /> : 'Войти'}
            </button>
          </form>
        )}
        
        <div className="auth-footer">
          <p>
            Нет аккаунта? <Link to="/register" className="auth-link">Зарегистрироваться</Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default LoginForm;
