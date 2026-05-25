import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const token = localStorage.getItem('careerflux_token');
        const savedUser = localStorage.getItem('careerflux_user');

        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem('careerflux_token');
                localStorage.removeItem('careerflux_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await authAPI.login({ email, password });
        const { token, user: userData } = res.data;
        localStorage.setItem('careerflux_token', token);
        localStorage.setItem('careerflux_user', JSON.stringify(userData));
        setUser(userData);
        toast.success('Welcome back!');
        return userData;
    };

    const register = async (formData) => {
        const res = await authAPI.register(formData);
        const { token, user: userData } = res.data;
        if (token) {
            localStorage.setItem('careerflux_token', token);
            localStorage.setItem('careerflux_user', JSON.stringify(userData));
            setUser(userData);
            toast.success('Account created successfully!');
        } else {
            toast.success(res.data.message || 'Registration successful! Pending admin approval.');
        }
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('careerflux_token');
        localStorage.removeItem('careerflux_user');
        setUser(null);
        toast.success('Logged out');
    };

    const refreshUser = async () => {
        try {
            const res = await authAPI.getMe();
            const userData = res.data.user;
            localStorage.setItem('careerflux_user', JSON.stringify(userData));
            setUser(userData);
            return userData;
        } catch {
            logout();
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
