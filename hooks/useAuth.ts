import { useState, useCallback } from 'react';
import { User } from '../types';

// A mock user to use since login is disabled.
const MOCK_USER: User = {
    name: 'Demo User',
    email: 'demo@trading.ai',
    subscriptionTier: 'Premium', // Default to Premium to show all features
};

/**
 * A modified authentication hook that bypasses login and provides a default user.
 * All authentication-related functions are now no-ops.
 */
export const useAuth = () => {
    // The user is now static and always "logged in" for the demo.
    const [user, setUserState] = useState<User>(MOCK_USER);

    // Logout is a no-op as there is no real session.
    const logout = useCallback(() => {
        console.log("Logout action is disabled in this version.");
    }, []);

    const setUser = useCallback((newUser: User) => {
        setUserState(newUser);
    }, []);

    return { 
        user, 
        authError: null, 
        logout, 
        setUser,
        // The following are no-op functions to maintain hook signature if needed by other components.
        signUpWithEmail: async () => false,
        loginWithEmail: async () => false,
    };
};