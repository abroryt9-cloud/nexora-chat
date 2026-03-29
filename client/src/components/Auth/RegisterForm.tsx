import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { RootState } from '../../store';
import { registerUser } from '../../store/authSlice';
import GlassCard from '../Common/GlassCard';
import Loader from '../Common/Loader';

const RegisterForm = (): JSX.Element => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }
    
    if (!formData.username) {
      newErrors.username = 'Логин обязателен';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Логин должен быть минимум 3 символа';
    } else if (formData.username.length > 30) {
      newErrors.username = 'Логин не может быть длиннее 30 символов';
    }
    
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть минимум 6 символов';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await dispatch(registerUser({
        email: formData.email,
        username: formData.username,
        password: formData.password,
      }) as any).unwrap();
      
      toast.success('Добро пожаловать в Nexora! Ваш стартовый баланс: 1000 NXR');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка регистрации');
    }
  };

  return (
    <div className="auth-form-container">
      <GlassCard className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Создать аккаунт</h1>
          <p className="auth-subtitle">Присоединяйтесь к будущему общения</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email адрес</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              className={`form-input ${errors.email ? 'error' : ''}`}
              disabled={loading}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="username">Логин</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="username"
              className={`form-input ${errors.username ? 'error' : ''}`}
              disabled={loading}
            />
            {errors.username && <span className="form-error">{errors.username}</span>}
            <p className="form-hint">3-30 символов, только буквы, цифры и _</p>
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
              className={`form-input ${errors.password ? 'error' : ''}`}
              disabled={loading}
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Повторите пароль</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              disabled={loading}
            />
            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? <Loader size="sm" /> : 'Создать аккаунт'}
          </button>
        </form>
        
        <div className="auth-benefits">
          <h4>Ваши преимущества:</h4>
          <ul>
            <li>💰 1000 NXR стартовый бонус</li>
            <li>🔒 Безопасные чаты с шифрованием</li>
            <li>🎨 6 космических тем</li>
            <li>🌍 Поддержка 60+ языков</li>
            <li>🤖 AI-ассистент встроен</li>
          </ul>
        </div>
        
        <div className="auth-footer">
          <p>
            Уже есть аккаунт? <Link to="/login" className="auth-link">Войти</Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default RegisterForm;
