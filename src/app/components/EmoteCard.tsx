'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Emote } from '../types';
import { useNetworkStatus } from '../utils/networkManager';

interface EmoteCardProps {
  emote: Emote;
  style?: React.CSSProperties;
}

export default function EmoteCard({ emote, style = {} }: EmoteCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [imageError, setImageError] = useState(false);
  const networkStatus = useNetworkStatus();

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div 
      className={`card ${isHovering ? 'card-hover' : ''}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="cardImageContainer">
        {imageError || networkStatus === 'offline' ? (
          <div className="offline-emote-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
            <p>Imagem não disponível</p>
          </div>
        ) : (
          <Image
            className="cardImage"
            src={emote.url}
            alt="Emote"
            width={128}
            height={128}
            priority={true}
            unoptimized={true}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onError={handleImageError}
            style={{
              transform: isHovering ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.3s ease-in-out',
              ...style
            }}
          />
        )}
      </div>
    </div>
  );
} 