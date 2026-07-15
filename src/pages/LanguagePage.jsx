import React from 'react';
import { useForm } from '../context/FormContext';
import { useData } from '../context/DataContext';
import { useTranslation } from '../hooks/useTranslation';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Select } from '../components/Input';
import { sendWebhookEvent } from '../services/webhookService';

export const LanguagePage = () => {
  const { formData, updateFormData, nextStep } = useForm();
  const { languages } = useData();
  const { t } = useTranslation();

  const handleLanguageChange = (e) => {
    updateFormData({ language: e.target.value });
  };

  const handleNext = () => {
    if (formData.language) {
      sendWebhookEvent('language_selected', { language: formData.language, tsm: formData.tsm });
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
