export const WEBHOOK_URL = 'https://aiautomation.digicides.com/webhook/ews-hoodibaba';
export const FACEBOOK_URL = 'https://www.facebook.com/india.ews';

export const sendWebhookEvent = async (eventName, payload) => {
  try {
    const timestamp = new Date().toISOString();
    
    // Extract TSM from URL directly to guarantee it's always included
    const urlParams = new URLSearchParams(window.location.search);
    const tsm = urlParams.get('tsm') || urlParams.get('tsm_id') || 'unknown';
    const currentUrl = window.location.href;

    const data = {
      event: eventName,
      timestamp,
      tsm,
      url: currentUrl,
      ...payload
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      // Use keepalive to ensure the request is not cancelled if the page unloads
      keepalive: true
    });

    if (!response.ok) {
      console.error(`Webhook failed for event ${eventName} with status ${response.status}`);
    }
  } catch (error) {
    // Graceful error handling for offline/failed webhooks
    console.error(`Error sending webhook for event ${eventName}:`, error);
  }
};
