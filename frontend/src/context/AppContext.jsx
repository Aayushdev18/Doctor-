import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { doctors as doctorsData } from '../assets/assets';

export const AppContext = createContext();

export const useAuth = () => useContext(AppContext);

export default function AppContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [doctors] = useState(doctorsData);
    const currencySymbol = '₹';

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        doctors,
        currencySymbol
    };

    return (
        <AppContext.Provider value={value}>
            {!loading && children}
        </AppContext.Provider>
    );
} 