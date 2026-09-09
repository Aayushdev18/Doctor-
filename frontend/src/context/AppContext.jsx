import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api, { assetUrl } from '../api';

export const AppContext = createContext();

export const useAuth = () => useContext(AppContext);

const mapDoctor = (doctor) => ({
    ...doctor,
    image: assetUrl(doctor.image)
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function AppContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [doctors, setDoctors] = useState([]);
    const [doctorsError, setDoctorsError] = useState('');
    const [doctorsLoading, setDoctorsLoading] = useState(true);
    const currencySymbol = '₹';

    const login = (userData, token) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const refreshDoctors = useCallback(async () => {
        setDoctorsLoading(true);
        setDoctorsError('');
        let lastError;
        for (let attempt = 0; attempt < 4; attempt++) {
            try {
                const { data } = await api.get('/doctors');
                setDoctors((data.doctors || []).map(mapDoctor));
                setDoctorsLoading(false);
                return;
            } catch (error) {
                lastError = error;
                await wait(400 * (attempt + 1));
            }
        }
        setDoctors([]);
        setDoctorsError(lastError?.response?.data?.message || lastError?.message || 'The clinic list could not be loaded. Please try again.');
        setDoctorsLoading(false);
    }, []);

    useEffect(() => {
        const bootstrap = async () => {
            await refreshDoctors();
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const { data } = await api.get('/auth/me');
                    setUser(data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
            } catch {
                logout();
            } finally {
                setLoading(false);
            }
        };

        bootstrap();
    }, [refreshDoctors]);

    const value = {
        user,
        setUser,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        doctors,
        setDoctors,
        doctorsError,
        doctorsLoading,
        mapDoctor,
        refreshDoctors,
        currencySymbol
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}
