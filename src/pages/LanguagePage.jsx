import React from 'react';
import { useForm } from '../context/FormContext';
import { useData } from '../context/DataContext';
import { useTranslation } from '../hooks/useTranslation';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Select } from '../components/Input';


export const LanguagePage = () => {
  const { formData, updateFormData, nextStep } = useForm();
  const { languages } = useData();
  const { t } = useTranslation();

  const handleLanguageChange = (e) => {
    updateFormData({ language: e.target.value });
  };

  const handleOptInChange = (e) => {
    updateFormData({ opt_in: e.target.checked });
  };

  const handleNext = () => {
    if (formData.language) {

      nextStep();
    }
  };

  const langOptions = languages
    .filter(l => l.Languages) // Ensure it's not empty
    .map(l => ({
      value: l.Languages,
      label: l.Languages
    }));

  return (
    <Card>
      <h2 style={{ marginBottom: '24px', textAlign: 'center', color: 'var(--color-primary-dark)' }}>
        {t('Please select your preferred language.')}
      </h2>
      
      <Select 
        label={t('Please select your preferred language.')}
        value={formData.language}
        onChange={handleLanguageChange}
        options={langOptions}
        placeholder="Select Language / भाषा चुनें"
      />

      <div style={{ marginTop: '24px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <input 
          type="checkbox" 
          id="privacy-opt-in" 
          checked={formData.opt_in} 
          onChange={handleOptInChange}
          style={{ marginTop: '4px', transform: 'scale(1.2)', cursor: 'pointer' }}
        />
        <label htmlFor="privacy-opt-in" style={{ fontSize: '14px', color: 'var(--color-text)', lineHeight: '1.5' }}>
          I agree to the <a href="https://www.eastwestseed.com/privacy-policy/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-dark)', textDecoration: 'underline', fontWeight: 'bold' }}>Privacy Policy</a> and consent to having my data collected and processed.
        </label>
      </div>
      
      <div style={{ marginTop: '32px' }}>
        <Button 
          fullWidth 
          onClick={handleNext} 
          disabled={!formData.language}
        >
          Next
        </Button>
      </div>
    </Card>
  );
};
