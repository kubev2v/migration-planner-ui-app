import { useEffect } from 'react';

export const useChrome = () => {
  useEffect(() => {
    if (window.insights && window.insights.chrome) {
      window.insights.chrome.init();
      window.insights.chrome.identifyApp('assisted-migration-app'); // Your appname from package.json
    }
  }, []);

  return window.insights ? window.insights.chrome : {};
};
