import React from 'react';
import styles from './Card.module.css';

export const Card = ({ children, className = '', style = {} }) => {
  return (
    <div className={`${styles.card} ${className}`} style={style}>
      {children}
    </div>
  );
};
