'use client';

import Image from 'next/image';
import { useTranslation } from '../i18n/useTranslation';
import LanguageSelector from './LanguageSelector';

export default function Footer() {
  const { t } = useTranslation('footer');
  
  return (
    <footer className="footer">
      <div className="footerContent">
        <div className="socialsIcons">
          <a 
            id="twitch-img" 
            target="_blank" 
            tabIndex={-1} 
            href="https://twitch.tv/GrifoEXE/about"
            rel="noopener noreferrer"
            aria-label={t('altText.twitch')}
          >
            <Image 
              src="/img/Twitch.png" 
              alt={t('altText.twitch')} 
              width={24} 
              height={24}
            />
          </a>
          <a 
            target="_blank" 
            tabIndex={-1} 
            href="https://www.youtube.com/@grifoexe"
            rel="noopener noreferrer"
            aria-label={t('altText.youtube')}
          >
            <Image 
              id="youtube-img" 
              src="/img/YouTube-Play.png" 
              alt={t('altText.youtube')} 
              width={24} 
              height={24}
            />
          </a>
          <a 
            target="_blank" 
            tabIndex={-1} 
            href="https://twitter.com/GrifoEXE"
            rel="noopener noreferrer"
            aria-label={t('altText.twitter')}
          >
            <Image 
              id="twitter-img" 
              src="/img/Twitter.png" 
              alt={t('altText.twitter')} 
              width={24} 
              height={24}
            />
          </a>
        </div>

        <div className="language-selector-container">
          <LanguageSelector minimal={true} inFooter={true} />
        </div>
        
        <div className="creditsContainer">
          <div className="nomeAutor">
            {t('by')} <a 
              className="autor" 
              tabIndex={-1} 
              target="_blank" 
              href="https://twitch.tv/GrifoEXE/about"
              rel="noopener noreferrer"
            >
              @GrifoEXE
            </a>
          </div>
          <div className="separator">|</div>
          <div className="refactorCredits">
            {t('remake')} <a 
              className="refactorAuthor" 
              tabIndex={-1} 
              target="_blank" 
              href="https://juliaklee.wtf"
              rel="noopener noreferrer"
            >
              @kleeedolinux
            </a>
          </div>
          <a 
            href="https://github.com/kleeedolinux/Emoto/" 
            target="_blank" 
            className="forkGithub fa fa-github"
            rel="noopener noreferrer"
            aria-label={t('altText.github')}
          ></a>
        </div>
      </div>
    </footer>
  );
} 
