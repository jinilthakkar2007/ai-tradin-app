import React, { useEffect, useRef } from 'react';

// FIX: Add a global declaration for the `google` object on the `window` to resolve TypeScript errors.
declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    renderButton: (
                        parent: HTMLElement,
                        options: {
                            theme: 'outline' | 'filled_blue' | 'filled_black';
                            size: 'large' | 'medium' | 'small';
                            type: 'standard' | 'icon';
                            text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
                            width?: number;
                        }
                    ) => void;
                };
            };
        };
    }
}


interface GoogleSignInButtonProps {
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ text = 'continue_with' }) => {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (buttonRef.current && window.google?.accounts.id) {
        // Ensure the container is empty before rendering
        if (buttonRef.current.childElementCount === 0) {
            window.google.accounts.id.renderButton(
                buttonRef.current,
                // FIX: The 'width' property must be a number, not a string. Changed '320' to 320.
                { theme: 'outline', size: 'large', type: 'standard', text, width: 320 }
            );
        }
    }
  }, [text]);

  // Use a unique ID for the container in case this component is rendered multiple times
  const id = `google-button-${React.useId()}`;

  return <div ref={buttonRef} id={id} className="flex justify-center"></div>;
};

export default GoogleSignInButton;