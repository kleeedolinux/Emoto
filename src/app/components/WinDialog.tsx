'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { stopAlarmSound } from '../utils/soundManager';
import { useTranslation } from '../i18n/useTranslation';

interface WinDialogProps {
  isOpen: boolean;
  score: number;
  onHome: () => void;
  onShare: () => void;
}

export default function WinDialog({ isOpen, score, onHome, onShare }: WinDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [animateIn, setAnimateIn] = useState(false);
  const { t } = useTranslation('win');
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
  
  const renderConfetti = () => {
    return (
      <div className="confetti-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden', borderRadius: '12px' }}>
        {Array.from({ length: 30 }).map((_, i) => {
          const size = Math.random() * 12 + 5;
          const color = [
            '#7b39e4', '#398ce4', '#1DA1F2', '#01b601', 
            '#ffcc00', '#ff6b6b', '#9c27b0', '#4caf50'
          ][Math.floor(Math.random() * 8)];
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const animationDuration = Math.random() * 8 + 4;
          const animationDelay = Math.random() * 3;
          const rotation = Math.random() * 360;
          
          return (
            <div 
              key={i}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: `${top}%`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: color,
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
                transform: `rotate(${rotation}deg)`,
                opacity: Math.random() * 0.7 + 0.3,
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
      className="win-dialog"
      onClick={handleDialogClick}
      style={{
        opacity: animateIn ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        margin: '0',
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: animateIn ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.9)',
        background: 'transparent',
        border: 'none',
        padding: 0,
        overflow: 'visible',
        maxWidth: 'none',
        maxHeight: 'none',
        boxShadow: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div className="modalWin" style={{
        background: 'radial-gradient(circle at center, rgba(30,60,30,0.8) 0%, rgba(10,30,10,0.9) 100%)',
        borderRadius: '12px',
        boxShadow: '0 0 30px rgba(1,182,1,0.3), 0 0 15px rgba(123,57,228,0.2) inset',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '500px',
        animation: 'border-glow-success 3s infinite',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem'
      }}>
        {renderConfetti()}
        
        <div className="win-flare" style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(1,182,1,0.3) 0%, rgba(1,182,1,0) 70%)',
          filter: 'blur(15px)',
          zIndex: 0
        }} />
        
        <div className="win-flare" style={{
          position: 'absolute',
          bottom: '-100px',
          left: '-100px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123,57,228,0.2) 0%, rgba(123,57,228,0) 70%)',
          filter: 'blur(20px)',
          zIndex: 0
        }} />
        
        <h1 className="modalTitleWin" style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          animation: 'score-popup 1.5s ease-out'
        }}>
          <span>
            <Image
              id="ClapLeft"
              className="clapLeft"
              src="/img/4x.webp"
              alt="Clap"
              width={120}
              height={120}
              unoptimized
              style={{
                animation: 'float 3s ease-in-out infinite',
                filter: 'drop-shadow(2px 2px 5px rgba(0,0,0,0.5))'
              }}
            />
          </span>
          <span style={{
            textShadow: '0 0 10px rgba(1,182,1,0.8), 0 0 20px rgba(1,182,1,0.4)'
          }}>
            {t('congratulations')}
          </span>
          <span>
            <Image
              id="ClapRight"
              className="clapRight"
              src="/img/4x.webp"
              alt="Clap"
              width={120}
              height={120}
              unoptimized
              style={{
                animation: 'float 4s ease-in-out infinite', 
                animationDelay: '0.5s',
                filter: 'drop-shadow(2px 2px 5px rgba(0,0,0,0.5))'
              }}
            />
          </span>
        </h1>
        
        <div 
          style={{
            width: '80%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #01b601, transparent)',
            margin: '0.5rem auto 1rem',
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
            background: '#01b601',
            boxShadow: '0 0 8px #01b601'
          }} />
        </div>
        
        <div className="modalWinContent" style={{
          position: 'relative',
          zIndex: 1,
          marginBottom: '1rem'
        }}>
          <div style={{ position: 'relative' }}>
            <p className="modalAcertos" style={{
              margin: '0',
              animation: 'score-popup 1.5s',
              fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
              position: 'relative',
              zIndex: 2,
              color: '#01b601'
            }}>
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
          <p style={{
            margin: '0.5rem 0',
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            color: '#fff',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            {t('score')}
          </p>
        </div>
        
        <div className="gameover-buttons-row" style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          maxWidth: '300px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
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
    </dialog>
  );
} 