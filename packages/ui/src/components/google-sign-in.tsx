import { useEffect } from 'react';

import { cn } from '../utils/cn';

export function GoogleSignIn() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        login_uri: `${import.meta.env.VITE_SERVER_URL}/auth/login-with-google`,
        ux_mode: 'redirect',
      });

      window.google.accounts.id.renderButton(
        document.getElementById('buttonDiv'),
        {
          theme: 'outline',
          size: 'large',
        },
      );
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      id="buttonDiv"
      className={cn('mx-auto', {
        hidden: !import.meta.env.VITE_GOOGLE_CLIENT_ID,
      })}
    ></div>
  );
}
