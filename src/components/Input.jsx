import React from 'react';
import styles from './Input.module.css';

export const Input = ({ label, error, ...props }) => {
  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.label}>{label}</label>}
      <input 
        className={`${styles.input} ${error ? styles.inputError : ''}`} 
        {...props} 
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export const Select = ({ label, options, error, placeholder, ...props }) => {
  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.label}>{label}</label>}
      <select 
        className={`${styles.select} ${error ? styles.inputError : ''}`} 
        {...props}
      >
        <option value="" disabled hidden>{placeholder || 'Select...'}</option>
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};
