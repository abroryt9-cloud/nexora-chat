import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  User,
  Camera,
  Edit3,
  Star,
  Award,
  Clock,
  MapPin,
  Phone,
  Mail,
  Link as LinkIcon,
  Settings,
  Shield,
  Bell,
  Heart,
  MessageCircle,
  Users,
  Calendar,
  Trophy,
  Zap,
  Crown,
  Gift,
  Check,
  X,
  Upload,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';

import { RootState } from '../../store';
import GlassCard from '../Common/GlassCard';
import Modal from '../Common/Modal';
import Loader from '../Common/Loader';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

interface ProfileStats {
  messagesCount: number;
  chatsCount: number;
  friendsCount: number;
  achievementsCount: number;
  joinedDate: string;
  lastActive: string;
}

const ProfilePanel: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Локальное состояние для редактирования профиля
  const [editForm, setEditForm] = useState({
    username: user?.username || '',
    bio: user?.bio || 'Привет! Я использую Nexora 🌟',
    location: '',
    website: '',
    phone: ''
  });
  
  // Демо данные профиля
  const [profileStats] = useState<ProfileStats>({
    messagesCount: 12847,
    chatsCount: 156,
    friendsCount: 284,
    achievementsCount: 18,
    joinedDate: '2024-01-15',
    lastActive: new Date().toISOString()
  });
  
  // Демо достижения
  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Первые шаги',
      description: 'Отправьте первое сообщение',
      icon: '🎯',
      rarity: 'common',
      unlockedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      title: 'Болтун',
      description: 'Отправьте 1000 сообщений',
      icon: '💬',
      rarity: 'rare',
      unlockedAt: '2024-02-01T14:20:00Z'
    },
    {
      id: '3',
      title: 'Коллекционер друзей',
      description: 'Добавьте 100 друзей',
      icon: '👥',
      rarity: 'epic',
      unlockedAt: '2024-02-15T09:15:00Z'
    },
    {
      id: '4',
      title: 'Легенда Nexora',
      description: 'Используйте все функции мессенджера',
      icon: '👑',
      rarity: 'legendary',
      progress: 8,
      maxProgress: 10
    },
    {
      id: '5',
      title: 'Ранняя пташка',
      description: 'Активность в ранние утренние часы',
      icon: '🌅',
      rarity: 'rare',
      unlockedAt: '2024-01-20T06:30:00Z'
    },
    {
      id: '6',
      title: 'Щедрый спонсор',
      description: 'Отправьте криптовалюту друзьям',
      icon: '💰',
      rarity: 'epic',
      progress: 3,
      maxProgress: 5
    }
  ]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveProfile = async () => {
    setLoading(true);
    
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: Dispatch update user action
      // dispatch(updateUserProfile(editForm));
      
      setIsEditing(false);
      toast.success('Профиль успешно обновлён!');
    } catch (error) {
      toast.error('Ошибка при сохранении профиля');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelEdit = () => {
    setEditForm({
      username: user?.username || '',
      bio: user?.bio || 'Привет! Я использую Nexora 🌟',
      location: '',
      website: '',
      phone: ''
    });
    setIsEditing(false);
  };
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 5MB');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast.error('Выберите изображение');
      return;
    }
    
    setUploadingAvatar(true);
    
    try {
      // Имитация загрузки
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Upload avatar to server
      // const formData = new FormData();
      // formData.append('avatar', file);
      // dispatch(uploadAvatar(formData));
      
      toast.success('Аватар успешно обновлён!');
    } catch (error) {
      toast.error('Ошибка при загрузке аватара');
    } finally {
      setUploadingAvatar(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#9e9e9e';
      case 'rare': return '#2196f3';
      case 'epic': return '#9c27b0';
      case 'legendary': return '#ff9800';
      default: return '#9e9e9e';
    }
  };
  
  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const progressAchievements = achievements.filter(a => !a.unlockedAt && a.progress !== undefined);

  return (
    <div className="profile-container">
      <GlassCard className="profile-card">
        {/* Header */}
        <div className="profile-header">
          {!isEditing ? (
            <>
              <h2 className="profile-title">
                <User className="profile-title-icon" />
                Профиль
              </h2>
              <button 
                onClick={() => setIsEditing(true)}
                className="edit-profile-btn"
              >
                <Edit3 className="w-5 h-5" />
                Редактировать
              </button>
            </>
          ) : (
            <div className="edit-actions">
              <button 
                onClick={handleCancelEdit}
                className="edit-action-btn cancel"
                disabled={loading}
              >
                <X className="w-5 h-5" />
                Отмена
              </button>
              <button 
                onClick={handleSaveProfile}
                className="edit-action-btn save"
                disabled={loading}
              >
                {loading ? (
                  <Loader size="sm" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Сохранить
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        
        {/* Avatar and basic info */}
        <div className="profile-main">
          <div className="profile-avatar-section">
            <div className="profile-avatar-container">
              <div className="profile-avatar">
                {uploadingAvatar ? (
                  <Loader size="md" />
                ) : (
                  user?.username?.charAt(0).toUpperCase() || 'U'
                )}
                <div className="avatar-status online" />
              </div>
              
              {isEditing && (
                <>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="avatar-upload-btn"
                    disabled={uploadingAvatar}
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    style={{ display: 'none' }}
                  />
                </>
              )}
            </div>
            
            <div className="profile-info">
              {isEditing ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Имя пользователя</label>
                    <input
                      type="text"
                      name="username"
                      value={editForm.username}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Введите имя пользователя"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>О себе</label>
                    <textarea
                      name="bio"
                      value={editForm.bio}
                      onChange={handleInputChange}
                      className="form-textarea"
                      rows={3}
                      placeholder="Расскажите о себе..."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Местоположение</label>
                    <input
                      type="text"
                      name="location"
                      value={editForm.location}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Город, страна"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Веб-сайт</label>
                    <input
                      type="url"
                      name="website"
                      value={editForm.website}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="profile-username">{user?.username}</h3>
                  <p className="profile-bio">{editForm.bio}</p>
                  
                  <div className="profile-metadata">
                    <div className="metadata-item">
                      <Calendar className="metadata-icon" />
                      <span>В Nexora с {formatDate(profileStats.joinedDate)}</span>
                    </div>
                    
                    <div className="metadata-item">
                      <Clock className="metadata-icon" />
                      <span>Был в сети только что</span>
                    </div>
                    
                    {editForm.location && (
                      <div className="metadata-item">
                        <MapPin className="metadata-icon" />
                        <span>{editForm.location}</span>
                      </div>
                    )}
                    
                    {editForm.website && (
                      <div className="metadata-item">
                        <LinkIcon className="metadata-icon" />
                        <a href={editForm.website} target="_blank" rel="noopener noreferrer" className="metadata-link">
                          {editForm.website}
                        </a>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Stats */}
        {!isEditing && (
          <>
            <div className="profile-stats">
              <div className="stat-item">
                <MessageCircle className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-number">{formatNumber(profileStats.messagesCount)}</span>
                  <span className="stat-label">Сообщений</span>
                </div>
              </div>
              
              <div className="stat-item">
                <Users className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-number">{formatNumber(profileStats.friendsCount)}</span>
                  <span className="stat-label">Друзей</span>
                </div>
              </div>
              
              <div className="stat-item">
                <Heart className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-number">{formatNumber(profileStats.chatsCount)}</span>
                  <span className="stat-label">Чатов</span>
                </div>
              </div>
              
              <div className="stat-item">
                <Trophy className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-number">{unlockedAchievements.length}</span>
                  <span className="stat-label">Наград</span>
                </div>
              </div>
            </div>
            
            {/* Achievements preview */}
            <div className="achievements-section">
              <div className="achievements-header">
                <h4>Последние достижения</h4>
                <button 
                  onClick={() => setShowAchievements(true)}
                  className="view-all-btn"
                >
                  Все достижения
                </button>
              </div>
              
              <div className="achievements-preview">
                {unlockedAchievements.slice(0, 3).map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className="achievement-item"
                    style={{ borderColor: getRarityColor(achievement.rarity) }}
                  >
                    <span className="achievement-icon">{achievement.icon}</span>
                    <div className="achievement-info">
                      <span className="achievement-title">{achievement.title}</span>
                      <span className="achievement-rarity" style={{ color: getRarityColor(achievement.rarity) }}>
                        {achievement.rarity === 'common' ? 'Обычное' :
                         achievement.rarity === 'rare' ? 'Редкое' :
                         achievement.rarity === 'epic' ? 'Эпическое' : 'Легендарное'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </GlassCard>
      
      {/* Achievements modal */}
      {showAchievements && (
        <Modal
          isOpen={showAchievements}
          onClose={() => setShowAchievements(false)}
          title="Достижения"
          size="lg"
        >
          <div className="achievements-modal">
            <div className="achievements-stats">
              <div className="achievement-stat">
                <Trophy className="w-6 h-6" />
                <span>{unlockedAchievements.length} / {achievements.length}</span>
              </div>
            </div>
            
            <div className="achievements-grid">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className={`achievement-card ${achievement.unlockedAt ? 'unlocked' : 'locked'}`}
                  style={{ borderColor: getRarityColor(achievement.rarity) }}
                >
                  <div className="achievement-card-header">
                    <span className="achievement-card-icon">{achievement.icon}</span>
                    <span className="achievement-card-rarity" style={{ color: getRarityColor(achievement.rarity) }}>
                      {achievement.rarity === 'common' ? 'Обычное' :
                       achievement.rarity === 'rare' ? 'Редкое' :
                       achievement.rarity === 'epic' ? 'Эпическое' : 'Легендарное'}
                    </span>
                  </div>
                  
                  <div className="achievement-card-content">
                    <h4>{achievement.title}</h4>
                    <p>{achievement.description}</p>
                    
                    {achievement.unlockedAt ? (
                      <div className="achievement-unlocked">
                        <Check className="w-4 h-4" />
                        <span>Получено {formatDate(achievement.unlockedAt)}</span>
                      </div>
                    ) : achievement.progress !== undefined ? (
                      <div className="achievement-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${(achievement.progress! / achievement.maxProgress!) * 100}%` }}
                          />
                        </div>
                        <span>{achievement.progress} / {achievement.maxProgress}</span>
                      </div>
                    ) : (
                      <div className="achievement-locked">
                        <LockIcon className="w-4 h-4" />
                        <span>Заблокировано</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const LockIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default ProfilePanel;
