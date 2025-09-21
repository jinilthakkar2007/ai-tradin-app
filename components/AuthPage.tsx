
import React, { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import GoogleSignInButton from './GoogleSignInButton';
import LogoIcon from './icons/LogoIcon';
import MailIcon from './icons/MailIcon';

interface AuthPageProps {
    authError: string | null;
}

const AuthPage: React.FC<AuthPageProps> = ({ authError: initialError }) => {
    const [mode, setMode] = useState<'login' | 'signup' | 'forgotPassword' | 'awaitingVerification'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    
    const { loginWithEmail, signUpWithEmail, sendPasswordResetEmail, authError, setAuthError, signInWithGoogleIdToken } = useAuth();
    
    useEffect(() => {
      // Clear previous auth errors when the component mounts or mode changes
      setAuthError(null);
    }, [mode, setAuthError]);
    
    const effectiveError = authError || initialError;

    const handleEmailAuth = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setAuthError(null);

        if (mode === 'signup') {
            if (password !== confirmPassword) {
                setAuthError("Passwords do not match.");
                setLoading(false);
                return;
            }
            if (password.length < 6) {
                setAuthError("Password must be at least 6 characters long.");
                setLoading(false);
                return;
            }
            const { error } = await signUpWithEmail(email, password);
            if (!error) {
                 setMode('awaitingVerification');
            }
        } else if (mode === 'login') {
            await loginWithEmail(email, password);
        } else if (mode === 'forgotPassword') {
            const { error } = await sendPasswordResetEmail(email);
             if (!error) {
                setMessage("If an account exists for this email, a password reset link has been sent.");
                setMode('login');
            }
        }
        setLoading(false);
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setLoading(true);
        setMessage(null);
        setAuthError(null);
        if (credentialResponse.credential) {
            await signInWithGoogleIdToken(credentialResponse.credential);
        } else {
            setAuthError("Google Sign-In failed. Please try again.");
        }
        setLoading(false);
    };

    const handleGoogleError = () => {
        setAuthError("Google Sign-In failed. Please try again or use another method.");
        setLoading(false);
    };
    
    const switchMode = (newMode: 'login' | 'signup' | 'forgotPassword') => {
        setMode(newMode);
        setAuthError(null);
        setMessage(null);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    }

    const getTitle = () => {
        switch(mode) {
            case 'login': return 'Sign in to your account';
            case 'signup': return 'Create a new account';
            case 'forgotPassword': return 'Reset your password';
            case 'awaitingVerification': return 'Check your email';
        }
    }

    return (
        <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center p-4">
             <div className="w-full max-w-sm">
                <div className="flex flex-col items-center mb-6">
                    {mode !== 'awaitingVerification' ? <LogoIcon /> : <MailIcon />}
                    <h1 className="text-2xl font-bold text-text-primary mt-4">
                      {mode === 'awaitingVerification' ? getTitle() : 'Welcome to AI Trade Alerts'}
                    </h1>
                    <p className="text-text-secondary mt-1">
                      {mode === 'awaitingVerification' 
                        ? <>A verification link has been sent to <strong className="text-text-primary">{email}</strong></> 
                        : getTitle()
                      }
                    </p>
                </div>

                <div className="bg-surface p-8 rounded-lg border border-border">
                    {message && <p className="text-sm text-accent-green bg-accent-green/10 p-3 rounded-md mb-4">{message}</p>}
                    {effectiveError && <p className="text-sm text-accent-red bg-accent-red/10 p-3 rounded-md mb-4">{effectiveError}</p>}
                    
                    {mode === 'awaitingVerification' ? (
                        <div className="text-center">
                            <p className="text-text-secondary">Please click the link in the email to complete your registration and sign in.</p>
                            <button onClick={() => switchMode('login')} className="mt-6 w-full py-2 px-5 bg-brand hover:bg-brand-hover rounded-md text-white font-semibold transition-colors">
                                Back to Sign In
                            </button>
                        </div>
                    ) : (
                      <form onSubmit={handleEmailAuth} className="space-y-4">
                          {mode !== 'login' || (
                            <>
                              <div>
                                  <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
                                  <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-background border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand focus:border-brand" />
                              </div>
                              <div>
                                  <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                                  <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-background border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand focus:border-brand" />
                              </div>
                              <div className="text-right">
                                  <button type="button" onClick={() => switchMode('forgotPassword')} className="text-xs font-semibold text-brand hover:text-brand-hover">Forgot Password?</button>
                              </div>
                            </>
                          )}
                          {mode !== 'signup' || (
                              <>
                                  <div>
                                      <label htmlFor="email-signup" className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
                                      <input id="email-signup" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-background border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand focus:border-brand" />
                                  </div>
                                  <div>
                                      <label htmlFor="password-signup" className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                                      <input id="password-signup" name="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-background border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand focus:border-brand" />
                                  </div>
                                  <div>
                                      <label htmlFor="confirm-password"className="block text-sm font-medium text-text-secondary mb-1">Confirm Password</label>
                                      <input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-background border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand focus:border-brand" />
                                  </div>
                              </>
                          )}
                          {mode !== 'forgotPassword' || (
                               <div>
                                  <label htmlFor="email-forgot" className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
                                  <input id="email-forgot" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-background border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand focus:border-brand" />
                               </div>
                          )}
                          <button type="submit" disabled={loading} className="w-full py-2 px-5 bg-brand hover:bg-brand-hover rounded-md text-white font-semibold transition-colors disabled:bg-border disabled:cursor-not-allowed">
                              {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : (mode === 'signup' ? 'Sign Up' : 'Send Reset Link'))}
                          </button>
                      </form>
                    )}

                    {mode !== 'forgotPassword' && mode !== 'awaitingVerification' && (
                        <>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-border"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-surface text-text-secondary">Or continue with</span>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <GoogleSignInButton 
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    text={mode === 'login' ? 'signin_with' : 'signup_with'}
                                />
                            </div>
                        </>
                    )}

                </div>
                {mode !== 'awaitingVerification' && (
                  <div className="text-center mt-4 text-sm text-text-secondary">
                      {mode === 'login' && (<>Don't have an account? <button onClick={() => switchMode('signup')} className="font-semibold text-brand hover:text-brand-hover">Sign up</button></>)}
                      {mode === 'signup' && (<>Already have an account? <button onClick={() => switchMode('login')} className="font-semibold text-brand hover:text-brand-hover">Sign in</button></>)}
                      {mode === 'forgotPassword' && (<>Remembered your password? <button onClick={() => switchMode('login')} className="font-semibold text-brand hover:text-brand-hover">Sign in</button></>)}
                  </div>
                )}
            </div>
        </div>
    );
};

export default AuthPage;
