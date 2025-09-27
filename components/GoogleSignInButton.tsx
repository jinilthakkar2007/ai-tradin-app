import React, { useEffect, useRef } from 'react';

// --- IMPORTANT SETUP ---
// To enable Google Sign-In, you must provide your Google Cloud Client ID.
// 1. Go to https://console.cloud.google.com/apis/credentials
// 2. Create or select a project.
// 3. Create an "OAuth 2.0 Client ID" for a "Web application".
// 4. Add your app's origin to the "Authorized JavaScript origins".
// 5. Copy the Client ID and paste it below.
const GOOGLE_CLIENT_ID = '397188489507-ofu7maggc7243iqotumjllkboaho73v7.apps.googleusercontent.com'; // Replace with your actual Google Client ID

// Extend the Window interface to include the `google` object from the GSI script
declare global {
    interface Window {
        google: any;
    }
}

interface GoogleSignInButtonProps {
    onSuccess: (response: any) => void;
    onError?: () => void;
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onSuccess, onError, text = 'continue_with' }) => {
    const buttonRef = useRef<HTMLDivElement>(null);
    const isRenderedRef = useRef(false);

    useEffect(() => {
        if (isRenderedRef.current || !buttonRef.current) {
            return;
        }

        const checkGoogle = () => {
            if (window.google?.accounts?.id) {
                if (GOOGLE_CLIENT_ID !== '397188489507-ofu7maggc7243iqotumjllkboaho73v7.apps.googleusercontent.com') {
                    console.error('ERROR: Google Client ID is not set in GoogleSignInButton.tsx. Please follow the setup instructions in the component file.');
                    if (buttonRef.current) {
                        buttonRef.current.innerHTML = '<div class="text-center p-3 bg-accent-red/10 border border-accent-red rounded-md text-sm text-accent-red" style="max-width: 320px;">Google Sign-In is not configured. <br/> Please set the Client ID.</div>';
                    }
                    return;
                }

                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: onSuccess,
                    error_callback: onError
                });

                window.google.accounts.id.renderButton(
                    buttonRef.current,
                    { 
                        theme: 'outline', 
                        size: 'large', 
                        text, 
                        shape: 'rectangular',
                        logo_alignment: 'left',
                        width: "320",
                    }
                );
                
                isRenderedRef.current = true;
            } else {
                // If GSI script hasn't loaded yet, wait and try again.
                setTimeout(checkGoogle, 100);
            }
        };

        checkGoogle();

    }, [onSuccess, onError, text]);

    return <div ref={buttonRef} id="google-signin-button"></div>;
};

export default GoogleSignInButton;