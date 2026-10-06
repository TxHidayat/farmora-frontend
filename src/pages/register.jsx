import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import api from '../services/api';

const Register = () => {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError('');

        // ==========================================
        // VALIDASI PASSWORD
        // ==========================================

        if (password !== confirmPassword) {
            setError('Password dan konfirmasi password tidak sama.');
            return;
        }

        if (password.length < 6) {
            setError('Password minimal 6 karakter.');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/register', {
                name,
                email,
                password,
            });

            if (response.data.success) {
                // Setelah berhasil daftar,
                // arahkan user ke halaman login.
                navigate('/login', {
                    replace: true,
                    state: {
                        message:
                            'Registrasi berhasil. Silakan login.',
                    },
                });
            } else {
                setError(
                    response.data.message ||
                    'Registrasi gagal.'
                );
            }
        } catch (error) {
            console.error(
                'Register error:',
                error
            );

            setError(
                error.response?.data?.message ||
                'Registrasi gagal. Silakan coba lagi.'
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

                {/* =================================================
                    LEFT SIDE
                ================================================== */}

                <div className="login-brand">

                    {/* Logo */}
                    <div className="brand-logo">
                        <img
                            src="/img/white1.png"
                            alt="FARMORA"
                        />
                    </div>

                    {/* Brand */}
                    <div>
                        <h1>FARMORA</h1>

                        <p>
                            Smart Farm Management System
                        </p>
                    </div>

                    {/* Description */}
                    <div className="brand-description">

                        <h2>
                            Mulai kelola kebun
                            <br />
                            lebih terarah.
                        </h2>

                        <p>
                            Buat akun FARMORA dan
                            mulai mengelola tanaman,
                            aktivitas, panen, serta
                            keuangan kebunmu.
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


                {/* =================================================
                    REGISTER CARD
                ================================================== */}

                <div className="login-card">

                    {/* Header */}
                    <div className="login-header">

                        <span>
                            GET STARTED
                        </span>

                        <h2>
                            Buat Akun FARMORA
                        </h2>

                        <p>
                            Daftarkan akun untuk mulai
                            mengelola kebunmu.
                        </p>

                    </div>


                    {/* Register Form */}
                    <form onSubmit={handleSubmit}>

                        {/* Nama */}
                        <div className="form-group">

                            <label htmlFor="name">
                                Nama
                            </label>

                            <input
                                id="name"
                                type="text"
                                placeholder="Masukkan nama"
                                value={name}
                                onChange={(event) =>
                                    setName(
                                        event.target.value
                                    )
                                }
                                required
                                autoComplete="name"
                            />

                        </div>


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
                                    setEmail(
                                        event.target.value
                                    )
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
                                    placeholder="Minimal 6 karakter"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    required
                                    autoComplete="new-password"
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


                        {/* Konfirmasi Password */}
                        <div className="form-group">

                            <label htmlFor="confirmPassword">
                                Konfirmasi Password
                            </label>

                            <div className="password-wrapper">

                                <input
                                    id="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    placeholder="Ulangi password"
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(
                                            event.target.value
                                        )
                                    }
                                    required
                                    autoComplete="new-password"
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                >
                                    {showConfirmPassword
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


                        {/* Register Button */}
                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading
                                ? 'Mendaftarkan...'
                                : 'Buat Akun'}
                        </button>

                    </form>


                    {/* Login Link */}
                    <div className="register-link">

                        <span>
                            Sudah punya akun?
                        </span>

                        <Link to="/login">
                            Masuk sekarang
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

export default Register;