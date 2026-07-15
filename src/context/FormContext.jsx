import React, { createContext, useState, useContext } from 'react';

const FormContext = createContext(null);

export const FormProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    language: '', // Will default to first language or be empty initially
    mobile: '',
    name: '',
    crop: '',
    product: '',
    state: '',
    district: '',
    tsm: '' // We will extract this from the URL on load
  });

  const [currentStep, setCurrentStep] = useState(1);

  const updateFormData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => Math.max(1, prev - 1));

  return (
    <FormContext.Provider value={{
      formData,
      updateFormData,
      currentStep,
      setCurrentStep,
      nextStep,
      prevStep
    }}>
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};
