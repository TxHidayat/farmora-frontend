import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', {
                email,
                password,
            });

            if (response.data.success) {
                const token = response.data.data.token;
                const user = response.data.data.user;

                login(token, user);

                navigate('/dashboard', {
                    replace: true,
                });
            }
        } catch (error) {
            console.error('Login error:', error);

            setError(
                error.response?.data?.message ||
                'Email atau password tidak valid.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            {/* Background decoration */}
            <div className="login-decoration decoration-one" />
            <div className="login-decoration decoration-two" />

            <div className="login-container">

                {/* =====================================================
                    LEFT SIDE
                ====================================================== */}
                <div className="login-brand">

                    {/* Logo FARMORA */}
                    <div className="brand-logo">
                        <img
                            src="/img/white1.png"
                            alt="FARMORA"
                        />
                    </div>

                    {/* Brand Name */}
                    <div>
                        <h1>FARMORA</h1>

                        <p>
                            Smart Farm Management System
                        </p>
                    </div>

                    {/* Description */}
                    <div className="brand-description">

                        <h2>
                            Kelola kebun dengan
                            <br />
                            lebih terarah.
                        </h2>

                        <p>
                            Pantau tanaman, aktivitas,
                            panen, dan keuangan kebun
                            dalam satu sistem.
                        </p>

                    </div>

                    {/* Stats */}
                    <div className="brand-stats">

                        <div>
                            <strong>01</strong>
                            <span>Manage</span>
                        </div>

                        <div>
                            <strong>02</strong>
                            <span>Monitor</span>
                        </div>

                        <div>
                            <strong>03</strong>
                            <span>Grow</span>
                        </div>

                    </div>

                </div>

                {/* =====================================================
                    LOGIN CARD
                ====================================================== */}
                <div className="login-card">

                    {/* Header */}
                    <div className="login-header">

                        <span>
                            WELCOME BACK
                        </span>

                        <h2>
                            Masuk ke FARMORA
                        </h2>

                        <p>
                            Kelola kebunmu dari sini.
                        </p>

                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit}>

                        {/* Email */}
                        <div className="form-group">

                            <label htmlFor="email">
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                placeholder="Masukkan email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                required
                                autoComplete="email"
                            />

                        </div>

                        {/* Password */}
                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="password-wrapper">

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    placeholder="Masukkan password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    required
                                    autoComplete="current-password"
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >
                                    {showPassword
                                        ? 'Hide'
                                        : 'Show'}
                                </button>

                            </div>

                        </div>

                        {/* Error */}
                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}

                        {/* Login Button */}
                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading
                                ? 'Memproses...'
                                : 'Masuk ke Dashboard'}
                        </button>

                    </form>

                    {/* =================================================
                        REGISTER LINK
                    ================================================== */}
                    <div className="register-link">

                        <span>
                            Belum punya akun?
                        </span>

                        <Link to="/register">
                            Daftar sekarang
                        </Link>

                    </div>

                    {/* Footer */}
                    <div className="login-footer">

                        <span>
                            FARMORA
                        </span>

                        <span>
                            Smart Farm Management
                        </span>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Login;