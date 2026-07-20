import React, { useEffect } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { FormProvider, useForm } from './context/FormContext';
import { LanguagePage } from './pages/LanguagePage';
import { FarmerDetailsPage } from './pages/FarmerDetailsPage';
import { LocationPage } from './pages/LocationPage';
import { ThankYouPage } from './pages/ThankYouPage';
import { Stepper } from './components/Stepper';

import './styles/global.css';

const AppContent = () => {
  const { loading, error } = useData();
  const { currentStep, updateFormData } = useForm();

  useEffect(() => {
    // Parse TSM from URL parameter (e.g., ?tsm=Anal-Das)
    const urlParams = new URLSearchParams(window.location.search);
    const tsmParam = urlParams.get('tsm') || urlParams.get('tsm_id') || 'unknown';
    
    updateFormData({ tsm: tsmParam });
    

  }, []);

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <h2>Error Loading Application</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Loading EWS Seeds...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="poster-container" style={{ marginBottom: '32px', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
        <img 
          src="/ews_screen_poster.png" 
          alt="EWS Seeds Poster" 
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>

      <div key={currentStep} className="page-transition">
        {currentStep < 4 && <Stepper currentStep={currentStep} totalSteps={3} />}

        {currentStep === 1 && <LanguagePage />}
        {currentStep === 2 && <FarmerDetailsPage />}
        {currentStep === 3 && <LocationPage />}
        {currentStep === 4 && <ThankYouPage />}
      </div>
    </div>
  );
};

function App() {
  return (
    <DataProvider>
      <FormProvider>
        <AppContent />
      </FormProvider>
    </DataProvider>
  );
}

export default App;
