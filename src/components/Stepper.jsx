import React from 'react';
import styles from './Stepper.module.css';

export const Stepper = ({ currentStep, totalSteps }) => {
  return (
    <div className={styles.stepperContainer}>
      {[...Array(totalSteps)].map((_, index) => {
        const step = index + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <React.Fragment key={step}>
            <div className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}>
              <div className={styles.stepCircle}>
                {isCompleted ? '✓' : step}
              </div>
            </div>
            {step < totalSteps && (
              <div className={`${styles.line} ${isCompleted ? styles.lineCompleted : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
