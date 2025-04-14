import type { ChromeAPI } from '@redhat-cloud-services/types';

export const createAuthFetch = (chrome: ChromeAPI): typeof fetch => {
  return async (input: RequestInfo, init: RequestInit = {}) => {
    const token = await chrome.auth.getToken();

    // Nos aseguramos de crear headers a partir de init.headers o un objeto vacío
    const headers = new Headers(init.headers || {});
    headers.set('Authorization', `Bearer ${token}`);

    return fetch(input, {
      ...init,
      headers,
    });
  };
};
