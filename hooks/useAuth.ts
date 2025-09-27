
import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase';
// FIX: Import Supabase types for v2 API to ensure type safety.
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';


// FIX: Use SupabaseUser type for better type safety.
const formatUser = (supabaseUser: SupabaseUser): User => {
    return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0],
        picture: supabaseUser.user_metadata?.avatar_url,
        // This could be fetched from your database in a real app
        subscriptionTier: 'Premium', 
    };
};

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        // FIX: Replaced synchronous `session()` (v1) with asynchronous `getSession()` (v2) to get the initial session.
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(formatUser(session.user));
            }
            setLoadingAuth(false);
        };
        
        checkSession();

        // FIX: Corrected `onAuthStateChange` to use v2 API's return value structure.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session: Session | null) => {
                if (session?.user) {
                    setUser(formatUser(session.user));
                } else {
                    setUser(null);
                }
                setLoadingAuth(false);
            }
        );

        return () => {
            // FIX: Correctly call unsubscribe on the subscription object from v2 API.
            subscription?.unsubscribe();
        };
    }, []);

    const handleAuthAction = async (action: () => Promise<{ data: any; error: Error | null }>) => {
        setLoadingAuth(true);
        setAuthError(null);
        const { error } = await action();
        if (error) {
            if (error.message.toLowerCase().includes('captcha')) {
                setAuthError("CAPTCHA is required by the authentication provider. This application does not have a CAPTCHA integration. Please disable CAPTCHA in your Supabase project's authentication settings to proceed.");
            } else {
                setAuthError(error.message);
            }
        }
        setLoadingAuth(false);
        return { error };
    };

    // FIX: Updated `signUp` to use v2 signature, with options object.
    const signUpWithEmail = useCallback(async (email: string, password: string) => {
        return handleAuthAction(() => 
            supabase.auth.signUp({
                email,
                password,
                options: {
                    // With email confirmations disabled in Supabase project,
                    // this will sign the user in directly.
                    emailRedirectTo: window.location.origin
                }
            })
        );
    }, []);

    // FIX: Replaced `signIn` (v1) with `signInWithPassword` (v2).
    const loginWithEmail = useCallback(async (email: string, password: string) => {
        return handleAuthAction(() => 
            supabase.auth.signInWithPassword({ email, password })
        );
    }, []);

    // FIX: Replaced `signIn` (v1) with `signInWithOAuth` (v2) for OAuth providers.
    const signInWithGoogle = useCallback(async () => {
        return handleAuthAction(() => 
            supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                }
            })
        );
    }, []);

    const signInWithGoogleIdToken = useCallback(async (token: string) => {
        return handleAuthAction(() => 
            supabase.auth.signInWithIdToken({
                provider: 'google',
                token,
            })
        );
    }, []);

    // FIX: Replaced `api.resetPasswordForEmail` (v1) with `resetPasswordForEmail` (v2).
    const sendPasswordResetEmail = useCallback(async (email: string) => {
         const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}`,
        });
        if (error) {
            setAuthError(error.message);
        }
        return { error };
    }, []);

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
    }, []);

    const updateUser = useCallback((newUser: Partial<User>) => {
        setUser(prev => prev ? { ...prev, ...newUser } : null);
    }, []);

    return { 
        user, 
        setUser: updateUser,
        loadingAuth,
        authError,
        setAuthError,
        signUpWithEmail, 
        loginWithEmail,
        signInWithGoogle,
        signInWithGoogleIdToken,
        sendPasswordResetEmail,
        logout,
    };
};
