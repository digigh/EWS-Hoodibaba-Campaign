import React, { useEffect, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useForm } from '../context/FormContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { sendWebhookEvent, FACEBOOK_URL } from '../services/webhookService';

export const ThankYouPage = () => {
  const { t } = useTranslation();
  const { formData } = useForm();

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFacebookRedirect();
    }, 2000); // Redirect after 2 seconds

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleFacebookRedirect = () => {
    sendWebhookEvent('facebook_redirect', { tsm: formData.tsm });
    
    // Check if the user is on a mobile device
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    
    // The numeric Page ID for india.ews is required for native app deep linking
    const pageId = '100064050637178';

    if (isAndroid) {
      // Android intent using the numeric page ID
      window.location.href = `intent://page/${pageId}#Intent;package=com.facebook.katana;scheme=fb;end`;
    } else if (isIOS) {
      // iOS fb scheme using the numeric profile ID
      window.location.href = `fb://profile/${pageId}`;
    } else {
      // Desktop or other: just open the web URL directly
      window.location.href = FACEBOOK_URL;
      return;
    }
    
    // Fallback to browser URL if the app isn't installed
    setTimeout(() => {
      // Only redirect to web if the browser is still in the foreground
      if (!document.hidden) {
        window.location.href = FACEBOOK_URL;
      }
    }, 1500);
  };

  return (
    <Card className="text-center" style={{ 
      textAlign: 'center', 
      padding: '48px 24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '300px'
    }}>
      <div className="success-icon-container">
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="var(--color-background)" stroke="var(--color-primary-light)" strokeWidth="4" />
          <path className="success-check-path" d="M30 50L45 65L70 35" stroke="var(--color-primary)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 style={{ color: 'var(--color-primary)', fontSize: '32px', marginBottom: '16px' }}>
        {t('Thank You')}
      </h1>
      <p style={{ color: 'var(--color-text-light)', fontSize: '18px', maxWidth: '300px', margin: '0 auto' }}>
        {t('Your details have been successfully submitted.')}
      </p>
    </Card>
  );
};
