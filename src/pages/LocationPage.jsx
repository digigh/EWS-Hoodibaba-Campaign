import React, { useState, useMemo } from 'react';
import { useForm } from '../context/FormContext';
import { useData } from '../context/DataContext';
import { useTranslation } from '../hooks/useTranslation';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Select } from '../components/Input';
import { sendWebhookEvent } from '../services/webhookService';

export const LocationPage = () => {
  const { formData, updateFormData, nextStep, prevStep } = useForm();
  const { districtStateMapping } = useData();
  const { t } = useTranslation();
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.state) {
      newErrors.state = t('Select State');
    }
    if (!formData.district) {
      newErrors.district = t('Select District');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setIsSubmitting(true);
      
      // Fire webhooks

      await sendWebhookEvent('form_submitted', { 
        ...formData
      });

      // Move to Thank You page
      nextStep();
      setIsSubmitting(false);
    }
  };

  const getStateColumn = (lang) => {
    switch (lang) {
      case 'Hindi (हिन्दी)': return 'hindi_state';
      case 'Kannada (ಕನ್ನಡ)': return 'kannada_state';
      case 'Telugu (తెలుగు)': return 'telugu_state';
      case 'Malayalam (മലയാളം)': return 'malayalam_state';
      case 'Tamil (தமிழ்)': return 'tamil_state';
      case 'Marathi (मराठी)': return 'marathi_state';
      case 'Gujarati (ગુજરાતી)': return 'gujarati_state';
      case 'Punjabi (ਪੰਜਾਬੀ)': return 'punjabi_state';
      case 'Bengali (বাংলা)': return 'bengali_state';
      case 'Assamese (অসমীয়া)': return 'assamese_state';
      case 'Odia (ଓଡ଼ିଆ)': return 'odia_state';
      default: return 'state';
    }
  };

  const getDistrictColumn = (lang) => {
    switch (lang) {
      case 'Hindi (हिन्दी)': return 'hindi_district';
      case 'Kannada (ಕನ್ನಡ)': return 'kannada_district';
      case 'Telugu (తెలుగు)': return 'telugu_district';
      case 'Malayalam (മലയാളം)': return 'malayalam_district';
      case 'Tamil (தமிழ்)': return 'tamil_district';
      case 'Marathi (मराठी)': return 'marathi_district';
      case 'Gujarati (ગુજરાતી)': return 'gujarati_district';
      case 'Punjabi (ਪੰਜਾਬੀ)': return 'punjabi_district';
      case 'Bengali (বাংলা)': return 'bengali_district';
      case 'Assamese (অসমীয়া)': return 'assamese_district';
      case 'Odia (ଓଡ଼ିଆ)': return 'odia_district';
      default: return 'district';
    }
  };

  const currentLang = formData.language || 'English';
  const stateCol = getStateColumn(currentLang);
  const districtCol = getDistrictColumn(currentLang);

  const stateOptions = useMemo(() => {
    const uniqueStates = [];
    const seen = new Set();
    districtStateMapping.forEach(s => {
      if (s.state && !seen.has(s.state)) {
        seen.add(s.state);
        uniqueStates.push({
          value: s.state, // keep English value for logic/webhooks
          label: s[stateCol] || s.state // use translated label if available
        });
      }
    });
    return uniqueStates.sort((a, b) => a.label.localeCompare(b.label));
  }, [districtStateMapping, stateCol]);

  const districtOptions = useMemo(() => {
    if (!formData.state) return [];
    return districtStateMapping
      .filter(s => s.state === formData.state && s.district)
      .map(s => ({
        value: s.district, // keep English value for logic/webhooks
        label: s[districtCol] || s.district // use translated label if available
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [districtStateMapping, formData.state, districtCol]);

  return (
    <Card>
      <h2 style={{ marginBottom: '24px', textAlign: 'center', color: 'var(--color-primary-dark)' }}>
        {t('Select State')}
      </h2>

      <Select
        label={t('Select State')}
        options={stateOptions}
        value={formData.state}
        onChange={e => updateFormData({ state: e.target.value, district: '' })}
        error={errors.state}
        placeholder={t('Select State')}
      />

      <Select
        label={t('Select District')}
        options={districtOptions}
        value={formData.district}
        onChange={e => updateFormData({ district: e.target.value })}
        error={errors.district}
        placeholder={t('Select District')}
        disabled={!formData.state}
      />

      <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
        <Button variant="outline" fullWidth onClick={prevStep} disabled={isSubmitting}>
          Back
        </Button>
        <Button fullWidth onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </Card>
  );
};
