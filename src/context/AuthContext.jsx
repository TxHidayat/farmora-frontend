
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';

import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const checkAuth = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                if (active) setLoading(false);
                return;
            }

            try {
                const response = await api.get('/auth/me');

                if (active && response.data.success) {
                    setUser(response.data.data);
                }
            } catch (error) {
                if (active) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        checkAuth();

        return () => {
            active = false;
        };
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const loginDemo = async () => {
        const response = await api.post('/auth/demo-login');

        if (!response.data.success) {
            throw new Error(
                response.data.message || 'Login demo gagal'
            );
        }

        const { token, user: userData } = response.data.data;

        if (!token || !userData) {
            throw new Error('Respons login demo tidak valid');
        }

        login(token, userData);

        return { success: true, user: userData };
    };

    const isDemo = Boolean(user?.isDemo ?? user?.is_demo);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                loginDemo,
                logout,
                isAuthenticated: Boolean(user),
                isDemo,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
