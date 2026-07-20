import React, { useState, useMemo } from 'react';
import { useForm } from '../context/FormContext';
import { useData } from '../context/DataContext';
import { useTranslation } from '../hooks/useTranslation';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Input';


export const FarmerDetailsPage = () => {
  const { formData, updateFormData, nextStep, prevStep } = useForm();
  const { cropProductMapping } = useData();
  const { t } = useTranslation();
  
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.mobile || !/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = t('Enter your 10-digit Mobile Number');
    }
    if (!formData.name.trim()) {
      newErrors.name = t('Enter Farmer Name');
    }
    if (!formData.crop) {
      newErrors.crop = t('Select Crop');
    }
    if (!formData.product) {
      newErrors.product = t('Select Product');
    } else if (formData.product === 'Others' && (!formData.otherProduct || !formData.otherProduct.trim())) {
      newErrors.otherProduct = t('Please specify the product');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {

      nextStep();
    }
  };

  const getCropColumn = (lang) => {
    switch (lang) {
      case 'Hindi (हिन्दी)': return 'hindi_crop';
      case 'Kannada (ಕನ್ನಡ)': return 'kannada_crop';
      case 'Telugu (తెలుగు)': return 'telugu_crop';
      case 'Malayalam (മലയാളം)': return 'malayalam_crop';
      case 'Tamil (தமிழ்)': return 'tamil_crop';
      case 'Marathi (मराठी)': return 'marathi_crop';
      case 'Gujarati (ગુજરાતી)': return 'gujarati_crop';
      case 'Punjabi (ਪੰਜਾਬੀ)': return 'punjabi_crop';
      case 'Bengali (বাংলা)': return 'bengali_crop';
      case 'Assamese (অসমীয়া)': return 'assamese_crop';
      case 'Odia (ଓଡ଼ିଆ)': return 'odia_crop';
      default: return 'crop';
    }
  };

  const getProductColumn = (lang) => {
    switch (lang) {
      case 'Hindi (हिन्दी)': return 'hindi_product';
      case 'Kannada (ಕನ್ನಡ)': return 'kannada_product';
      case 'Telugu (తెలుగు)': return 'telugu_product';
      case 'Malayalam (മലയാളം)': return 'malayalam_product';
      case 'Tamil (தமிழ்)': return 'tamil_product';
      case 'Marathi (मराठी)': return 'marathi_product';
      case 'Gujarati (ગુજરાતી)': return 'gujarati_product';
      case 'Punjabi (ਪੰਜਾਬੀ)': return 'punjabi_product';
      case 'Bengali (বাংলা)': return 'bengali_product';
      case 'Assamese (অসমীয়া)': return 'assamese_product';
      case 'Odia (ଓଡ଼ିଆ)': return 'odia_product';
      default: return 'product';
    }
  };

  const currentLang = formData.language || 'English';
  const cropCol = getCropColumn(currentLang);
  const productCol = getProductColumn(currentLang);

  const cropOptions = useMemo(() => {
    const uniqueCrops = [];
    const seen = new Set();
    cropProductMapping.forEach(c => {
      // The CSV now uses lowercase 'crop' instead of 'Crop'
      const baseCrop = c.crop || c.Crop; 
      if (baseCrop && !seen.has(baseCrop)) {
        seen.add(baseCrop);
        uniqueCrops.push({
          value: baseCrop, // Keep English value for logic/webhooks
          label: c[cropCol] || baseCrop // Use translated label if available
        });
      }
    });
    return uniqueCrops;
  }, [cropProductMapping, cropCol]);

  const productOptions = useMemo(() => {
    if (!formData.crop) return [];
    const options = cropProductMapping
      .filter(c => (c.crop || c.Crop) === formData.crop && (c.product || c.Product))
      .map(c => {
        const baseProduct = c.product || c.Product;
        return {
          value: baseProduct, // Keep English value for logic/webhooks
          label: c[productCol] || baseProduct // Use translated label if available
        };
      });
      
    // Append Others option
    options.push({ value: 'Others', label: t('Others') || 'Others' });
    return options;
  }, [cropProductMapping, formData.crop, productCol, t]);

  return (
    <Card>
      <h2 style={{ marginBottom: '24px', textAlign: 'center', color: 'var(--color-primary-dark)' }}>
        {t('Enter Farmer Name')} {/* Or a generic Farmer Details header if there was one, using first field as title for now */}
      </h2>
      
      <Input
        label={t('Enter your 10-digit Mobile Number')}
        type="tel"
        maxLength={10}
        value={formData.mobile}
        onChange={e => {
          const val = e.target.value.replace(/\D/g, '');
          updateFormData({ mobile: val });
        }}
        error={errors.mobile}
        placeholder="9876543210"
      />

      <Input
        label={t('Enter Farmer Name')}
        type="text"
        value={formData.name}
        onChange={e => updateFormData({ name: e.target.value })}
        error={errors.name}
        placeholder={t('Enter Farmer Name')}
      />

      <Select
        label={t('Select Crop')}
        options={cropOptions}
        value={formData.crop}
        onChange={e => updateFormData({ crop: e.target.value, product: '' })}
        error={errors.crop}
        placeholder={t('Select Crop')}
      />

      <Select
        label={t('Select Product')}
        options={productOptions}
        value={formData.product}
        onChange={e => updateFormData({ product: e.target.value, otherProduct: '' })}
        error={errors.product}
        placeholder={t('Select Product')}
        disabled={!formData.crop}
      />

      {formData.product === 'Others' && (
        <Input
          label={t('Please specify the product')}
          type="text"
          value={formData.otherProduct || ''}
          onChange={e => updateFormData({ otherProduct: e.target.value })}
          error={errors.otherProduct}
          placeholder={t('Please specify the product')}
        />
      )}

      <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
        <Button variant="outline" fullWidth onClick={prevStep}>
          Back
        </Button>
        <Button fullWidth onClick={handleNext}>
          Next
        </Button>
      </div>
    </Card>
  );
};
