'use client';

import { useState } from 'react';
import Image from 'next/image';
import { stopAlarmSound } from '../utils/soundManager';
import { useTranslation } from '../i18n/useTranslation';

interface HeaderProps {
  onHelpClick: () => void;
  onHomeClick?: () => void;
  gameActive?: boolean;
  onAchievementsClick: () => void;
}

export default function Header({ onHelpClick, onHomeClick, gameActive = false, onAchievementsClick }: HeaderProps) {
  const [isHovering, setIsHovering] = useState(false);
  const { t } = useTranslation('header');
  const { t: tGeneral } = useTranslation('general');
  
  const handleHomeClick = () => {
    stopAlarmSound();
    
    if (onHomeClick) {
      onHomeClick();
    }
  };
  
  return (
    <>
      <div className="headerContainer" style={{ width: '100%', position: 'relative' }}>
        <a 
          tabIndex={-1} 
          className="questionCircle fa fa-question-circle" 
          onClick={onHelpClick}
          aria-label={t('help')}
          style={{
            animation: 'pulse 3s infinite'
          }}
        ></a>
        
        <a 
          tabIndex={-1} 
          className="trophyCircle fa fa-trophy" 
          onClick={onAchievementsClick}
          aria-label={t('achievements')}
          title={t('achievements')}
          style={{
            animation: 'pulse 2s infinite alternate',
            position: 'fixed',
            left: '1.5rem',
            top: '1.5rem',
            fontSize: '1.8rem',
            color: 'gold',
            cursor: 'pointer',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.5)',
            zIndex: 110,
            background: 'radial-gradient(circle, rgba(123, 57, 228, 0.5) 0%, rgba(0, 0, 0, 0.3) 100%)',
            padding: '0.7rem 1rem',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'transform 0.3s ease, color 0.3s ease',
            transformOrigin: 'center',
            transform: 'scale(1)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.color = '#ffdf00';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.color = 'gold';
          }}
        >
          <i className="fa fa-trophy"></i>
          <span style={{ 
            fontWeight: 'bold', 
            color: 'white',
            textShadow: '2px 2px 3px rgba(0, 0, 0, 0.7)'
          }}>
            {t('achievements')}
          </span>
        </a>

        <div className="container">
          <h1 
            className={`title ${gameActive ? 'clickable' : ''}`} 
            onClick={gameActive ? handleHomeClick : undefined}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{
              transform: isHovering && gameActive ? 'scale(1.05) rotate(-2deg)' : 'scale(1) rotate(0deg)',
              transition: 'all 0.3s ease',
              textShadow: isHovering && gameActive ? 
                '6px 6px 5px black, 0 0 10px rgba(123, 57, 228, 0.7)' : 
                '6px 6px 5px black'
            }}
          >
            {tGeneral('appName')} 2
          </h1>
          <h3 
            className="subtitle"
            style={{
              animation: 'float 4s ease-in-out infinite',
              animationDelay: '0.5s'
            }}
          >
            {t('subtitle')}
          </h3>
          <p 
            className="version"
            style={{
              animation: 'pulse 2s infinite',
              animationDelay: '1s'
            }}
          >
            v1.1.0 - {t('challengeUpdate')}
          </p>
          {!gameActive && (
            <Image 
              className="peepoThink" 
              src="/img/3x.webp" 
              alt={t('thinkingEmoteAlt')} 
              width={96}
              height={96}
              priority
              unoptimized
              style={{
                animation: 'float 3s ease-in-out infinite',
                transition: 'transform 0.3s ease',
                transform: isHovering ? 'rotate(10deg)' : 'rotate(0deg)'
              }}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            />
          )}
        </div>
      </div>
    </>
  );
} 