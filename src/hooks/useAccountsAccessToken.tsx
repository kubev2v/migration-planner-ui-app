import React from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

declare global {
  interface Window {
    ocmConfig?: {
      configData?: {
        apiGateway?: string;
      };
    };
  }
}

export type AccountsAccessToken = {
  auths: {
    [domain: string]: {
      auth: string;
      email?: string;
    };
  };
};

export type OCMErrorResponse = {
  kind: string;
  id: string;
  href: string;
  code: string;
  reason?: string;
};

export function objectIsAccessToken(
  obj: AccountsAccessToken | OCMErrorResponse,
): obj is AccountsAccessToken {
  return 'auths' in obj;
}

// Hook para obtener el token de acceso
export function useAccountsAccessToken(): {
  accessToken: string | undefined;
} {
  const [accessToken, setAccessToken] = React.useState<string | undefined>(
    undefined,
  );
  const { auth } = useChrome();

  React.useEffect(() => {
    async function getToken(): Promise<void> {
      try {
        const bearerToken = await auth.getToken(); // Get Bearer Token
        setAccessToken(bearerToken);
      } catch (error) {
        console.error('Error fetching access token:', error);
        setAccessToken('test token');
      }
    }

    getToken();
  }, [auth]);

  return { accessToken };
}