'use client';

import { useEffect, useState } from 'react';
import { Achievement } from '../types';
import { playAchievementSound } from '../utils/soundManager';
import { useTranslation } from '../i18n/useTranslation';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

export default function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { t } = useTranslation('achievements');
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); 
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [onClose]);
  
  return (
    <div 
      className={`fixed bottom-0 right-0 mb-20 mr-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg shadow-lg transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      } z-[150] max-w-xs w-full flex items-center gap-3`}
      style={{
        animation: isVisible ? 'bounce 0.5s, glow 2s infinite alternate' : 'none',
        boxShadow: '0 0 15px rgba(123, 57, 228, 0.5), 0 0 30px rgba(123, 57, 228, 0.3)',
        border: '2px solid rgba(130, 80, 223, 0.3)'
      }}
    >
      <div 
        className="text-4xl" 
        style={{ 
          animation: 'wiggle 1s ease-in-out infinite',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
        }}
      >{achievement.icon}</div>
      <div className="flex-1">
        <h3 className="font-bold text-lg bg-gradient-to-r from-white to-yellow-200 text-transparent bg-clip-text">{achievement.title}</h3>
        <p className="text-sm opacity-90">{achievement.description}</p>
      </div>
      <button 
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="text-white opacity-70 hover:opacity-100 transition-opacity"
      >
        &times;
      </button>
    </div>
  );
}

interface AchievementNotificationContainerProps {
  children: (props: { addAchievement: (achievement: Achievement) => void }) => React.ReactNode;
}

export function AchievementNotificationContainer({ children }: AchievementNotificationContainerProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  
  const addAchievement = (achievement: Achievement) => {
    setAchievements(prev => [...prev, achievement]);
    playAchievementSound();
  };
  
  const removeAchievement = (id: string) => {
    setAchievements(prev => prev.filter(a => a.id !== id));
  };
  
  return (
    <>
      {achievements.map((achievement) => (
        <AchievementNotification
          key={achievement.id}
          achievement={achievement}
          onClose={() => removeAchievement(achievement.id)}
        />
      ))}
      {children({ addAchievement })}
    </>
  );
} 