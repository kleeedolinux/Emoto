'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslation } from '../i18n/useTranslation';

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpDialog({ isOpen, onClose }: HelpDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [animateIn, setAnimateIn] = useState(false);
  const { t } = useTranslation('help');
  const { t: tGeneral } = useTranslation('general');
  const { t: tGame } = useTranslation('game');

  useEffect(() => {
    if (isOpen && dialogRef.current && !dialogRef.current.open) {
      try {
        dialogRef.current.showModal();
        setTimeout(() => setAnimateIn(true), 50);
      } catch (error) {
        console.error('Error showing dialog:', error);
      }
    } else if (!isOpen && dialogRef.current && dialogRef.current.open) {
      setAnimateIn(false);
      setTimeout(() => {
        try {
          if (dialogRef.current) {
            dialogRef.current.close();
          }
        } catch (error) {
          console.error('Error closing dialog:', error);
        }
      }, 300);
    }
  }, [isOpen]);

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
  
    const dialogDimensions = dialogRef.current?.getBoundingClientRect();
    if (
      dialogDimensions &&
      (e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom)
    ) {
      onClose();
    }
  };

  const handleCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <dialog 
      ref={dialogRef} 
      className="help-dialog"
      onClick={handleDialogClick}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      style={{
        opacity: animateIn ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        zIndex: 2000
      }}
    >
      <div className="modalHelp">
        <h1 className="modalTitle">{t('howToPlay')}</h1>
        <Image 
          className="gaming" 
          src="/img/hate.webp" 
          alt="Gaming Emote" 
          width={96} 
          height={96}
          unoptimized
        />
        <p className="modalText">
          {t('gameDescription')}
          <br/><br/>
          <strong>{t('howToPlay')}:</strong>
          <br/>
          1. {t('instructions.0')}
          <br/>
          2. {t('instructions.1')} → <strong>{t('instructions.2')}</strong>.
          <br/><br/>
          <strong>{t('rules')}:</strong>
          <br/>
          ✅ {t('instructions.3')} = <strong>+1 {tGame('score').toLowerCase()}</strong>.
          <br/>
          ❌ {t('wrongGuess')} = <strong>-1 {tGame('lives').toLowerCase()}</strong>.
          <br/>
          🔥 {t('streakBonus')} = <strong>+1 {t('extraLife')}</strong>.
          <br/>
          💀 {t('gameOverCondition')} = <strong>{t('gameOver')}</strong>.
          <br/><br/>
          <strong>{t('quickControls')}</strong>
          <br/>
          ↑/↓ = {t('navigation')} | Ctrl+Home/End = {t('jump')} | Enter = {t('select')} | Esc = {t('cancel')}
        </p>
        <button 
          onClick={handleCloseButtonClick} 
          className="modalCloseButton fa fa-close"
          type="button"
          aria-label={tGeneral('close')}
        ></button>
        <a 
          target="_blank" 
          href="https://github.com/Kleeedolinux/Emoto" 
          className="github fa fa-github"
          rel="noopener noreferrer"
          aria-label={t('githubAlt')}
        ></a>
      </div>
    </dialog>
  );
} 