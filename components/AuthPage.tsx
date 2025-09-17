import React, { useState, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import GoogleSignInButton from './GoogleSignInButton';
import LogoIcon from './icons/LogoIcon';

interface AuthPageProps {
    authError: string | null;
}

const AuthPage: React.FC<AuthPageProps> = ({ authError: initialError }) => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const { loginWithEmail, signUpWithEmail, authError } = useAuth();
    
    const effectiveError = localError || authError || initialError;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setLocalError(null);

        if (mode === 'signup') {
            if (password !== confirmPassword) {
                setLocalError("Passwords do not match.");
                setLoading(false);
                return;
            }
            if (password.length < 6) {
                setLocalError("Password must be at least 6 characters long.");
                setLoading(false);
                return;
            }
            await signUpWithEmail();
        } else {
            await loginWithEmail();
        }
        setLoading(false);
    };
    
    const toggleMode = () => {
        setMode(prev => prev === 'login' ? 'signup' : 'login');
        setLocalError(null);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    }

    return (
        <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center p-4">
             <div className="w-full max-w-sm">
                <div className="flex flex-col items-center mb-6">
                    <LogoIcon />
                    <h1 className="text-2xl font-bold text-text-primary mt-4">Welcome to AI Trade Alerts</h1>
                    <p className="text-text-secondary mt-1">
                        {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
                    </p>
                </div>

                <div className="bg-background-surface p-8 rounded-lg border border-background-light">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-background border border-background-light text-text-primary rounded-md p-2 focus:ring-2 focus:ring-accent-blue focus:border-accent-blue"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-background border border-background-light text-text-primary rounded-md p-2 focus:ring-2 focus:ring-accent-blue focus:border-accent-blue"
                            />
                        </div>
                        {mode === 'signup' && (
                             <div>
                                <label htmlFor="confirm-password"className="block text-sm font-medium text-text-secondary mb-1">Confirm Password</label>
                                <input
                                    id="confirm-password"
                                    name="confirm-password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-background border border-background-light text-text-primary rounded-md p-2 focus:ring-2 focus:ring-accent-blue focus:border-accent-blue"
                                />
                            </div>
                        )}
                         {effectiveError && <p className="text-sm text-accent-red bg-accent-red/10 p-3 rounded-md">{effectiveError}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 px-5 bg-accent-blue hover:bg-accent-blueHover rounded-md text-white font-semibold transition-colors disabled:bg-background-light disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-background-light"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-background-surface text-text-secondary">Or continue with</span>
                        </div>
                    </div>
                    
                    <GoogleSignInButton text={mode === 'login' ? 'signin_with' : 'signup_with'}/>

                </div>
                <div className="text-center mt-4">
                    <p className="text-sm text-text-secondary">
                        {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={toggleMode} className="font-semibold text-accent-blue hover:text-accent-blueHover">
                            {mode === 'login' ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;