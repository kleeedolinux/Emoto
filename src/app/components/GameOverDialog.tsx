'use client';

import { useRef, useEffect, useState } from 'react';
import { Emote } from '../types';
import Image from 'next/image';
import { stopAlarmSound } from '../utils/soundManager';
import { useTranslation } from '../i18n/useTranslation';

interface GameOverDialogProps {
  isOpen: boolean;
  score: number;
  onTryAgain: () => void;
  onHome: () => void;
  onShare: () => void;
  lastEmote: Emote | null;
}

export default function GameOverDialog({ 
  isOpen, 
  score, 
  onTryAgain, 
  onHome, 
  onShare,
  lastEmote
}: GameOverDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [animateIn, setAnimateIn] = useState(false);
  const { t } = useTranslation('gameOver');
  const { t: tGeneral } = useTranslation('general');
  
  useEffect(() => {
    if (isOpen && dialogRef.current && !dialogRef.current.open) {

      stopAlarmSound();
      
      dialogRef.current.showModal();
      setTimeout(() => setAnimateIn(true), 50);
    } else if (!isOpen && dialogRef.current && dialogRef.current.open) {
      setAnimateIn(false);
      setTimeout(() => {
        if (dialogRef.current) {
          dialogRef.current.close();
        }
      }, 300);
    }
  }, [isOpen]);

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    e.stopPropagation();
  };
  
  const handleTryAgainClick = () => {
    stopAlarmSound();
    onTryAgain();
  };
  
  const handleHomeClick = () => {
    stopAlarmSound();
    
    if (dialogRef.current) {
      setAnimateIn(false);
      setTimeout(() => {
        if (dialogRef.current) {
          dialogRef.current.close();
        }
        onHome();
      }, 300);
    } else {
      onHome();
    }
  };
  
  const getScoreMessage = () => {
    if (score === 0) return t('scoreMessages.zero');
    if (score < 5) return t('scoreMessages.low');
    if (score < 10) return t('scoreMessages.medium');
    if (score < 15) return t('scoreMessages.high');
    return t('scoreMessages.excellent');
  };
  
  const renderDecorativeIcons = () => {
    return (
      <div className="decorative-icons" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden', borderRadius: '12px' }}>
        {Array.from({ length: 20 }).map((_, i) => {
          const size = Math.random() * 20 + 10;
          const opacity = Math.random() * 0.4 + 0.1;
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const animationDuration = Math.random() * 8 + 6;
          const animationDelay = Math.random() * 5;
          
          return (
            <div 
              key={i}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: `${top}%`,
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                background: `rgba(${Math.random() * 100 + 100}, ${Math.random() * 50}, ${Math.random() * 50}, ${opacity})`,
                boxShadow: `0 0 ${size/2}px rgba(255, 0, 0, ${opacity})`,
                opacity: opacity,
                animation: `float ${animationDuration}s ease-in-out infinite`,
                animationDelay: `${animationDelay}s`
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <dialog 
      ref={dialogRef} 
      className="game-over-dialog"
      onClick={handleDialogClick}
      style={{
        opacity: animateIn ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        margin: '0',
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: animateIn ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.9)',
        maxHeight: '90vh',
        maxWidth: '90vw',
        width: 'auto',
        boxSizing: 'border-box'
      }}
    >
      <div className="modalGameOver">
        {renderDecorativeIcons()}
        
        <div className="game-over-flare" style={{
          position: 'absolute',
          top: '-100px',
          left: '-100px',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,107,0.2) 0%, rgba(255,0,0,0) 70%)',
          filter: 'blur(10px)',
          zIndex: 0
        }} />
        
        <div className="game-over-flare" style={{
          position: 'absolute',
          bottom: '-80px',
          right: '-80px',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123,57,228,0.2) 0%, rgba(123,57,228,0) 70%)',
          filter: 'blur(10px)',
          zIndex: 0
        }} />
        
        <div 
          className="gameOverHeader"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '1rem',
            position: 'relative',
            zIndex: 1
          }}
        >
          <div style={{ position: 'relative' }}>
            <h1 
              className="modalTitleGameOver"
              style={{
                fontSize: 'clamp(2rem, 8vw, 3rem)',
                margin: '0',
                position: 'relative',
                zIndex: 2
              }}
            >
              {t('title')}
            </h1>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120%',
              height: '80%',
              background: 'radial-gradient(ellipse, rgba(255,0,0,0.1) 0%, rgba(255,0,0,0) 70%)',
              filter: 'blur(10px)',
              zIndex: 1
            }} />
          </div>
          
          <div 
            style={{
              width: '80%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #ff6b6b, transparent)',
              margin: '1rem auto',
              position: 'relative'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-3px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#ff6b6b',
              boxShadow: '0 0 8px #ff6b6b'
            }} />
          </div>
        </div>
        
        <div 
          className="modalGameOverContent"
          style={{
            position: 'relative',
            marginBottom: '1.5rem',
            zIndex: 1
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <div style={{ position: 'relative' }}>
              <p 
                className="modalAcertos"
                style={{
                  margin: '0',
                  animation: 'score-popup 1.5s',
                  fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                {score}
              </p>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '150%',
                height: '100%',
                background: 'radial-gradient(ellipse, rgba(1,182,1,0.2) 0%, rgba(1,182,1,0) 70%)',
                filter: 'blur(15px)',
                zIndex: 1
              }} />
            </div>
            <p 
              style={{
                margin: '0.5rem 0 0',
                fontSize: 'clamp(0.9rem, 3vw, 1.2rem)',
                color: '#dcdcdc',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                textAlign: 'center',
                maxWidth: '90%'
              }}
            >
              {getScoreMessage()}
            </p>
          </div>
        </div>

        {lastEmote && (
          <div className="last-emote-container" style={{
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <p style={{
              margin: '0',
              fontSize: '1rem',
              color: '#ff6b6b',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}>
              {t('defeatMessage')}
            </p>
            
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Image
                src={lastEmote.url}
                alt={lastEmote.name}
                width={40}
                height={40}
                unoptimized
                style={{
                  borderRadius: '4px',
                  boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                }}
              />
              
              <span style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#ffffff',
                textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
              }}>
                {lastEmote.name}
              </span>
            </div>
          </div>
        )}

        <div 
          className="gameOverActions"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: '300px',
            margin: '0 auto'
          }}
        >
          <button 
            className="dialogTryAgainButton"
            onClick={handleTryAgainClick}
          >
            {t('tryAgain')}
          </button>
          
          <div className="gameover-buttons-row">
            <button 
              className="dialogTwitterButton"
              onClick={onShare}
            >
              <i className="fa fa-share-alt" aria-hidden="true"></i>
              <span>{tGeneral('share')}</span>
            </button>
            
            <button 
              className="dialogHomeButton"
              onClick={handleHomeClick}
            >
              <i className="fa fa-home" aria-hidden="true"></i>
              <span>{tGeneral('home')}</span>
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
} 