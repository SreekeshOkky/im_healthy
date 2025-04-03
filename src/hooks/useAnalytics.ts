import { getAnalytics, logEvent, Analytics } from 'firebase/analytics';
import { app } from '../lib/firebase';

let analytics: Analytics | null = null;

// Initialize analytics only in production and browser environment
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.error('Failed to initialize analytics:', error);
  }
}

export const useAnalytics = () => {
  const trackEvent = (eventName: string, eventParams = {}) => {
    if (analytics) {
      try {
        logEvent(analytics, eventName, eventParams);
      } catch (error) {
        console.error('Failed to track event:', error);
      }
    }
  };

  return { trackEvent };
}; 