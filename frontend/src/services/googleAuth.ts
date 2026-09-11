export interface GoogleUserProfile {
  name: string;
  email: string;
  googleId: string;
  avatar: string;
  givenName?: string;
  familyName?: string;
}

const getGoogleClientId = (): string => {
  return (
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '522295379594-0fv25if5irsbv2rpkkb0ll56cb7ep5j6.apps.googleusercontent.com'
  );
};

// Wait for Google Identity Services script to be available on window
const waitForGoogleScript = (timeoutMs = 5000): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.accounts?.oauth2) {
      return resolve((window as any).google);
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      if ((window as any).google?.accounts?.oauth2) {
        clearInterval(interval);
        return resolve((window as any).google);
      }
      if (Date.now() - startTime > timeoutMs) {
        clearInterval(interval);
        // Try dynamically loading the script if missing
        if (!document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          script.onload = () => {
            if ((window as any).google?.accounts?.oauth2) {
              resolve((window as any).google);
            } else {
              reject(new Error('Google Identity Services script loaded but oauth2 client not found.'));
            }
          };
          script.onerror = () => reject(new Error('Failed to load Google Identity Services SDK. Check your internet connection or ad-blocker.'));
          document.head.appendChild(script);
        } else {
          reject(new Error('Google Identity Services SDK timed out. Please refresh the page or check ad-blocker.'));
        }
      }
    }, 100);
  });
};

/**
 * Triggers the official Google OAuth popup window allowing the user
 * to select one of their real Google accounts.
 */
export const promptGoogleSignIn = async (): Promise<GoogleUserProfile> => {
  const google = await waitForGoogleScript();
  const clientId = getGoogleClientId();

  if (!clientId || clientId.includes('your-google-client-id')) {
    throw new Error('Google Client ID is missing. Please check your VITE_GOOGLE_CLIENT_ID in .env');
  }

  return new Promise((resolve, reject) => {
    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (tokenResponse: any) => {
          if (tokenResponse?.error) {
            console.error('Google OAuth Error Response:', tokenResponse);
            return reject(new Error(tokenResponse.error_description || tokenResponse.error || 'Google Sign-In was cancelled or failed.'));
          }

          if (!tokenResponse?.access_token) {
            return reject(new Error('No access token received from Google Sign-In.'));
          }

          try {
            // Fetch real user info from Google's official userinfo endpoint
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            });

            if (!res.ok) {
              throw new Error(`Failed to fetch Google profile (Status ${res.status})`);
            }

            const data = await res.json();

            if (!data.email) {
              throw new Error('Google account did not return an email address.');
            }

            resolve({
              name: data.name || data.given_name || 'Google User',
              email: data.email,
              googleId: data.sub || `g_${Date.now()}`,
              avatar: data.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              givenName: data.given_name,
              familyName: data.family_name,
            });
          } catch (fetchErr: any) {
            console.error('Error fetching Google user profile:', fetchErr);
            reject(new Error(`Failed to retrieve Google profile: ${fetchErr.message}`));
          }
        },
        error_callback: (error: any) => {
          console.error('Google OAuth client error:', error);
          reject(new Error(error?.message || error?.type || 'Failed to open Google account chooser.'));
        },
      });

      // Request token with prompt: 'select_account' to force Google to show the account chooser
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err: any) {
      console.error('Error initializing Google token client:', err);
      reject(new Error(`Google Sign-In initialization failed: ${err.message}`));
    }
  });
};
