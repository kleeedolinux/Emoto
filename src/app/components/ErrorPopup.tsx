'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ErrorType = 'invalid_channel' | 'offline' | 'invalid_chars' | 'api_error' | 'not_found';

interface ErrorPopupProps {
  isVisible: boolean;
  errorType?: ErrorType;
  onClose: () => void;
  customMessage?: string;
}

export const ErrorPopup = ({ isVisible, errorType = 'invalid_channel', onClose, customMessage }: ErrorPopupProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  const getErrorContent = () => {
    switch (errorType) {
      case 'invalid_channel':
        return {
          title: 'Canal Inválido',
          message: 'Este canal não existe ou não tem emotes disponíveis.',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          )
        };
      case 'offline':
        return {
          title: 'Sem Conexão',
          message: 'Verifique sua conexão com a internet e tente novamente.',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"></path>
            </svg>
          )
        };
      case 'invalid_chars':
        return {
          title: 'Caracteres Inválidos',
          message: 'O nome do canal contém caracteres não permitidos.',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          )
        };
      case 'api_error':
        return {
          title: 'Erro na API',
          message: 'Ocorreu um erro ao consultar a API da Twitch. Tente novamente mais tarde.',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          )
        };
      case 'not_found':
        return {
          title: 'Nada Encontrado',
          message: 'Não foi possível encontrar emotes para este canal.',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          )
        };
      default:
        return {
          title: 'Erro',
          message: customMessage || 'Ocorreu um erro desconhecido.',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          )
        };
    }
  };

  const { title, message, icon } = getErrorContent();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="error-popup"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
        >
          <div className="error-icon">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1, 1.1, 1] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2,
                ease: "easeInOut"
              }}
            >
              {icon}
            </motion.div>
          </div>
          <div className="error-content">
            <h3>{title}</h3>
            <p>{message}</p>
          </div>
          <motion.button 
            className="error-close"
            onClick={handleClose}
            whileTap={{ scale: 0.95 }}
            aria-label="Fechar"
          >
            ×
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 