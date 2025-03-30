'use client';

import React, { useState } from 'react';
import { useI18n } from '../i18n/i18nContext';

interface LanguageSelectorProps {
  minimal?: boolean;
  inFooter?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ minimal = false, inFooter = false }) => {
  const { locale, setLocale, locales } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const localeNames: Record<string, string> = {
    en: 'English',
    pt: 'Português'
  };
  
  const localeFlags: Record<string, string> = {
    en: '🇨🇦',
    pt: '🇧🇷'
  };

  const handleChange = (newLocale: string) => {
    setLocale(newLocale as any);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const dropdownClasses = `language-dropdown ${isOpen ? 'language-dropdown--open' : ''} ${inFooter ? 'language-dropdown--footer' : ''}`;

  if (minimal) {
    return (
      <div className={`language-selector language-selector--minimal ${inFooter ? 'language-selector--footer' : ''}`}>
        <div className="language-display" onClick={toggleDropdown}>
          <span className="language-flag">{localeFlags[locale]}</span>
          <span className="language-name">{localeNames[locale]}</span>
          <span className="language-arrow">▾</span>
        </div>
        
        {isOpen && (
          <div className={dropdownClasses}>
            {locales.map((code) => (
              <div 
                key={code} 
                className={`language-option ${code === locale ? 'language-option--active' : ''}`}
                onClick={() => handleChange(code)}
              >
                <span className="language-flag">{localeFlags[code]}</span>
                <span className="language-name">{localeNames[code]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`language-selector ${inFooter ? 'language-selector--footer' : ''}`}>
      <div className="language-display" onClick={toggleDropdown}>
        <span className="language-flag">{localeFlags[locale]}</span>
        <span className="language-name">{localeNames[locale]}</span>
        <span className="language-arrow">▾</span>
      </div>
      
      {isOpen && (
        <div className={dropdownClasses}>
          {locales.map((code) => (
            <div 
              key={code} 
              className={`language-option ${code === locale ? 'language-option--active' : ''}`}
              onClick={() => handleChange(code)}
            >
              <span className="language-flag">{localeFlags[code]}</span>
              <span className="language-name">{localeNames[code]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector; 