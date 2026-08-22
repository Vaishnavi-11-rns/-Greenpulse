import { jsx as _jsx } from "react/jsx-runtime";
import React, { createContext, useState, useEffect } from 'react';
import { api } from '../services/api';
export const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        checkAuth();
    }, []);
    const checkAuth = async () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const currentUser = await api.getCurrentUser();
                setUser(currentUser);
            }
            catch (error) {
                localStorage.removeItem('access_token');
                setUser(null);
            }
        }
        setIsLoading(false);
    };
    const login = async (email, password) => {
        const response = await api.login(email, password);
        localStorage.setItem('access_token', response.access_token);
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
    };
    const register = async (email, password, fullName) => {
        await api.register(email, password, fullName);
        await login(email, password);
    };
    const logout = () => {
        localStorage.removeItem('access_token');
        setUser(null);
    };
    return (_jsx(AuthContext.Provider, { value: {
            user,
            isLoading,
            isAuthenticated: !!user,
            login,
            register,
            logout,
        }, children: children }));
};
export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
//# sourceMappingURL=AuthContext.js.map