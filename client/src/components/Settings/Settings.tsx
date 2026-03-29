import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Settings as SettingsIcon,
  Palette,
  Globe,
  Bell,
  Shield,
  Key,
  Download,
  Moon,
  Sun,
  Stars,
  Volume2,
  VolumeX,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Users,
  MessageSquare,
  Camera,
  Mic,
  HardDrive,
  Trash2,
  LogOut,
  ChevronRight,
  Check,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

import { RootState } from '../../store';
import { setTheme } from '../../store/themeSlice';
import { logoutUser } from '../../store/authSlice';
import GlassCard from '../Common/GlassCard';
import Modal from '../Common/Modal';

type SettingsSection = 'appearance' | 'privacy' | 'notifications' | 'data' | 'account';

const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentTheme, themes } = useSelector((state: RootState) => state.theme);
  
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [settings, setSettings] = useState({
    // Уведомления
    notifications: {
      messages: true,
      calls: true,
      groups: true,
      mentions: true,
      sounds: true,
      vibration: true,
      preview: true
    },
    // Приватность
    privacy: {
      lastSeen: 'everyone', // everyone, contacts, nobody
      profilePhoto: 'everyone',
      about: 'everyone',
      readReceipts: true,
      typingIndicators: true,
      onlineStatus: true
    },
    // Данные
    data: {
      autoDownload: 'wifi', // wifi, mobile, never
      mediaQuality: 'high', // high, medium, low
      chatBackup: true,
      dataUsage: 'normal' // normal, low
    },
    // Внешний вид
    appearance: {
      fontSize: 'medium', // small, medium, large
      chatWallpaper: 'cosmic',
      compactMode: false,
      showAvatars: true
    }
  });
  
  const menuItems = [
    {
      id: 'appearance' as SettingsSection,
      icon: Palette,
      title: 'Внешний вид',
      subtitle: 'Темы, размер шрифта, обои'
    },
    {
      id: 'privacy' as SettingsSection,
      icon: Shield,
      title: 'Конфиденциальность',
      subtitle: 'Кто может видеть ваши данные'
    },
    {
      id: 'notifications' as SettingsSection,
      icon: Bell,
      title: 'Уведомления',
      subtitle: 'Звуки, вибрация, предпросмотр'
    },
    {
      id: 'data' as SettingsSection,
      icon: HardDrive,
      title: 'Данные и память',
      subtitle: 'Автозагрузка, резервные копии'
    },
    {
      id: 'account' as SettingsSection,
      icon: Users,
      title: 'Аккаунт',
      subtitle: 'Профиль, безопасность, выход'
    }
  ];
  
  const themeOptions = [
    { id: 'light', name: 'Светлая', icon: Sun, description: 'Классическая светлая тема' },
    { id: 'dark', name: 'Тёмная', icon: Moon, description: 'Тёмная тема для экономии батареи' },
    { id: 'cosmic', name: 'Космическая', icon: Stars, description: 'Градиенты и космические эффекты' },
    { id: 'aurora', name: 'Аврора', icon: Stars, description: 'Нежные цвета северного сияния' },
    { id: 'nebula', name: 'Туманность', icon: Stars, description: 'Яркие космические туманности' },
    { id: 'galaxy', name: 'Галактика', icon: Stars, description: 'Глубокий космос и звёзды' }
  ];
  
  const handleThemeChange = (themeId: string) => {
    dispatch(setTheme(themeId as any));
    toast.success(`Тема изменена на "${themeOptions.find(t => t.id === themeId)?.name}"`);
  };
  
  const handleSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };
  
  const handleLogout = () => {
    dispatch(logoutUser() as any);
    toast.success('Вы успешно вышли из аккаунта');
  };
  
  const getThemeIcon = (themeId: string) => {
    const theme = themeOptions.find(t => t.id === themeId);
    return theme ? theme.icon : Palette;
  };

  return (
    <div className="settings-container">
      <GlassCard className="settings-card">
        {/* Header */}
        <div className="settings-header">
          <div className="settings-title">
            <SettingsIcon className="settings-title-icon" />
            <h2>Настройки</h2>
          </div>
          <div className="user-info-mini">
            <div className="user-avatar-mini">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="username-mini">{user?.username}</span>
          </div>
        </div>
        
        <div className="settings-content">
          {/* Меню разделов */}
          <div className="settings-sidebar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`settings-menu-item ${activeSection === item.id ? 'active' : ''}`}
                >
                  <Icon className="menu-item-icon" />
                  <div className="menu-item-content">
                    <span className="menu-item-title">{item.title}</span>
                    <span className="menu-item-subtitle">{item.subtitle}</span>
                  </div>
                  <ChevronRight className="menu-item-arrow" />
                </button>
              );
            })}
          </div>
          
          {/* Контент разделов */}
          <div className="settings-main">
            {activeSection === 'appearance' && (
              <div className="settings-section">
                <h3>Внешний вид</h3>
                
                {/* Выбор темы */}
                <div className="setting-group">
                  <h4>Тема оформления</h4>
                  <div className="theme-grid">
                    {themeOptions.map((theme) => {
                      const Icon = theme.icon;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => handleThemeChange(theme.id)}
                          className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
                        >
                          <div className="theme-preview">
                            <Icon className="theme-icon" />
                            {currentTheme === theme.id && (
                              <div className="theme-check">
                                <Check className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="theme-info">
                            <span className="theme-name">{theme.name}</span>
                            <span className="theme-description">{theme.description}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Размер шрифта */}
                <div className="setting-group">
                  <h4>Размер шрифта</h4>
                  <div className="font-size-options">
                    {['small', 'medium', 'large'].map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSettingChange('appearance', 'fontSize', size)}
                        className={`font-size-btn ${settings.appearance.fontSize === size ? 'active' : ''}`}
                      >
                        <span style={{ fontSize: size === 'small' ? '14px' : size === 'large' ? '18px' : '16px' }}>
                          {size === 'small' ? 'Маленький' : size === 'large' ? 'Большой' : 'Средний'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Компактный режим */}
                <div className="setting-item">
                  <div className="setting-info">
                    <span className="setting-label">Компактный режим</span>
                    <span className="setting-description">Уменьшить отступы в интерфейсе</span>
                  </div>
                  <button
                    onClick={() => handleSettingChange('appearance', 'compactMode', !settings.appearance.compactMode)}
                    className={`toggle-btn ${settings.appearance.compactMode ? 'active' : ''}`}
                  >
                    <div className="toggle-slider" />
                  </button>
                </div>
              </div>
            )}
            
            {activeSection === 'privacy' && (
              <div className="settings-section">
                <h3>Конфиденциальность и безопасность</h3>
                
                <div className="setting-group">
                  <h4>Кто может видеть</h4>
                  
                  {['lastSeen', 'profilePhoto', 'about'].map((setting) => (
                    <div key={setting} className="privacy-setting">
                      <span className="privacy-label">
                        {setting === 'lastSeen' ? 'Время последнего посещения' :
                         setting === 'profilePhoto' ? 'Фото профиля' : 'Информацию обо мне'}
                      </span>
                      <select
                        value={settings.privacy[setting as keyof typeof settings.privacy] as string}
                        onChange={(e) => handleSettingChange('privacy', setting, e.target.value)}
                        className="privacy-select"
                      >
                        <option value="everyone">Все</option>
                        <option value="contacts">Мои контакты</option>
                        <option value="nobody">Никто</option>
                      </select>
                    </div>
                  ))}
                </div>
                
                <div className="setting-group">
                  <h4>Статус и активность</h4>
                  
                  {[
                    { key: 'readReceipts', label: 'Отчёты о прочтении', desc: 'Показывать когда сообщения прочитаны' },
                    { key: 'typingIndicators', label: 'Индикатор набора', desc: 'Показывать когда печатаю' },
                    { key: 'onlineStatus', label: 'Статус "в сети"', desc: 'Показывать когда я онлайн' }
                  ].map((item) => (
                    <div key={item.key} className="setting-item">
                      <div className="setting-info">
                        <span className="setting-label">{item.label}</span>
                        <span className="setting-description">{item.desc}</span>
                      </div>
                      <button
                        onClick={() => handleSettingChange('privacy', item.key, !settings.privacy[item.key as keyof typeof settings.privacy])}
                        className={`toggle-btn ${settings.privacy[item.key as keyof typeof settings.privacy] ? 'active' : ''}`}
                      >
                        <div className="toggle-slider" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeSection === 'notifications' && (
              <div className="settings-section">
                <h3>Уведомления</h3>
                
                <div className="setting-group">
                  <h4>Типы уведомлений</h4>
                  
                  {[
                    { key: 'messages', label: 'Личные сообщения', icon: MessageSquare },
                    { key: 'calls', label: 'Звонки', icon: Smartphone },
                    { key: 'groups', label: 'Группы', icon: Users },
                    { key: 'mentions', label: 'Упоминания', icon: Bell }
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.key} className="setting-item">
                        <div className="setting-info">
                          <div className="setting-label-with-icon">
                            <Icon className="setting-icon" />
                            <span className="setting-label">{item.label}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSettingChange('notifications', item.key, !settings.notifications[item.key as keyof typeof settings.notifications])}
                          className={`toggle-btn ${settings.notifications[item.key as keyof typeof settings.notifications] ? 'active' : ''}`}
                        >
                          <div className="toggle-slider" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                
                <div className="setting-group">
                  <h4>Звуки и вибрация</h4>
                  
                  {[
                    { key: 'sounds', label: 'Звуки уведомлений', icon: Volume2 },
                    { key: 'vibration', label: 'Вибрация', icon: Smartphone },
                    { key: 'preview', label: 'Предпросмотр сообщений', icon: Eye }
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.key} className="setting-item">
                        <div className="setting-info">
                          <div className="setting-label-with-icon">
                            <Icon className="setting-icon" />
                            <span className="setting-label">{item.label}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSettingChange('notifications', item.key, !settings.notifications[item.key as keyof typeof settings.notifications])}
                          className={`toggle-btn ${settings.notifications[item.key as keyof typeof settings.notifications] ? 'active' : ''}`}
                        >
                          <div className="toggle-slider" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {activeSection === 'data' && (
              <div className="settings-section">
                <h3>Данные и память</h3>
                
                <div className="setting-group">
                  <h4>Автозагрузка медиа</h4>
                  <div className="radio-group">
                    {[
                      { value: 'wifi', label: 'Только Wi-Fi' },
                      { value: 'mobile', label: 'Wi-Fi и мобильная сеть' },
                      { value: 'never', label: 'Никогда' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSettingChange('data', 'autoDownload', option.value)}
                        className={`radio-option ${settings.data.autoDownload === option.value ? 'active' : ''}`}
                      >
                        <div className="radio-circle">
                          {settings.data.autoDownload === option.value && <div className="radio-dot" />}
                        </div>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <span className="setting-label">Резервное копирование чатов</span>
                    <span className="setting-description">Автоматически сохранять историю</span>
                  </div>
                  <button
                    onClick={() => handleSettingChange('data', 'chatBackup', !settings.data.chatBackup)}
                    className={`toggle-btn ${settings.data.chatBackup ? 'active' : ''}`}
                  >
                    <div className="toggle-slider" />
                  </button>
                </div>
              </div>
            )}
            
            {activeSection === 'account' && (
              <div className="settings-section">
                <h3>Аккаунт</h3>
                
                <div className="account-info">
                  <div className="account-avatar">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="account-details">
                    <span className="account-username">{user?.username}</span>
                    <span className="account-email">{user?.email}</span>
                  </div>
                </div>
                
                <div className="setting-group">
                  <h4>Управление аккаунтом</h4>
                  
                  <button className="action-btn">
                    <Key className="action-icon" />
                    <span>Изменить пароль</span>
                    <ChevronRight className="action-arrow" />
                  </button>
                  
                  <button className="action-btn">
                    <Download className="action-icon" />
                    <span>Экспорт данных</span>
                    <ChevronRight className="action-arrow" />
                  </button>
                  
                  <button className="action-btn danger">
                    <Trash2 className="action-icon" />
                    <span>Удалить аккаунт</span>
                    <ChevronRight className="action-arrow" />
                  </button>
                  
                  <button 
                    onClick={() => setShowLogoutModal(true)}
                    className="action-btn danger"
                  >
                    <LogOut className="action-icon" />
                    <span>Выйти из аккаунта</span>
                    <ChevronRight className="action-arrow" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
      
      {/* Модальное окно выхода */}
      {showLogoutModal && (
        <Modal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          title="Выход из аккаунта"
        >
          <div className="logout-modal">
            <p>Вы уверены, что хотите выйти из аккаунта?</p>
            <div className="modal-actions">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="modal-btn secondary"
              >
                Отмена
              </button>
              <button 
                onClick={handleLogout}
                className="modal-btn primary"
              >
                Выйти
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Settings;
