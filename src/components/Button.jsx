import React from 'react';
import styles from './Button.module.css';

export const Button = ({ children, onClick, type = 'button', variant = 'primary', fullWidth, disabled }) => {
  const btnClass = `${styles.button} ${styles[variant]} ${fullWidth ? styles.fullWidth : ''} ${disabled ? styles.disabled : ''}`;
  
  return (
    <button 
      type={type} 
      className={btnClass} 
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
