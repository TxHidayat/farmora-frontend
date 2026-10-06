import {
    Navigate,
    Route,
    Routes,
} from 'react-router-dom';

// =====================================================
// AUTH PAGES
// =====================================================

import Login from '../pages/login';
import Register from '../pages/register';

// =====================================================
// MAIN PAGES
// =====================================================

import Dashboard from '../pages/dashboard';
import Farms from '../pages/farms';
import Fields from '../pages/fields';
import CropCycles from '../pages/crop-cycles';

import Activities from '../pages/activities';
import Harvests from '../pages/harvests';
import Expenses from '../pages/expenses';

import Reports from '../pages/report';
import Analytics from '../pages/analytics';

import AIDetection from '../pages/AIDetection';
import QuickPlantScan from '../pages/QuickPlantScan';

// =====================================================
// AUTH CONTEXT
// =====================================================

import { useAuth } from '../context/AuthContext';


// =====================================================
// PROTECTED ROUTE
// =====================================================

const ProtectedRoute = ({ children }) => {
    const {
        isAuthenticated,
        loading,
    } = useAuth();

    // =================================================
    // AUTH LOADING
    // =================================================

    if (loading) {
        return (
            <div className="loading-screen">

                <div className="loading-logo">
                    <img
                        src="/img/icon1.png"
                        alt="FARMORA"
                    />
                </div>

                <p>
                    Memuat FARMORA...
                </p>

            </div>
        );
    }

    // =================================================
    // NOT AUTHENTICATED
    // =================================================

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return children;
};


// =====================================================
// PUBLIC ROUTE
// Digunakan untuk Login & Register
// Jika user sudah login, jangan biarkan kembali
// ke halaman Login/Register.
// =====================================================

const PublicRoute = ({ children }) => {
    const {
        isAuthenticated,
        loading,
    } = useAuth();

    // =================================================
    // AUTH LOADING
    // =================================================

    if (loading) {
        return (
            <div className="loading-screen">

                <div className="loading-logo">
                    <img
                        src="/img/icon1.png"
                        alt="FARMORA"
                    />
                </div>

                <p>
                    Memuat FARMORA...
                </p>

            </div>
        );
    }

    // =================================================
    // ALREADY LOGIN
    // =================================================

    if (isAuthenticated) {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    return children;
};


// =====================================================
// APP ROUTES
// =====================================================

const AppRoutes = () => {

    return (
        <Routes>

            {/* =================================================
                AUTH
            ================================================= */}

            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />

            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                }
            />


            {/* =================================================
                DASHBOARD
            ================================================= */}

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                FARM MANAGEMENT
            ================================================= */}

            <Route
                path="/farms"
                element={
                    <ProtectedRoute>
                        <Farms />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/fields"
                element={
                    <ProtectedRoute>
                        <Fields />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/crop-cycles"
                element={
                    <ProtectedRoute>
                        <CropCycles />
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                OPERATIONAL
            ================================================= */}

            <Route
                path="/activities"
                element={
                    <ProtectedRoute>
                        <Activities />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/harvests"
                element={
                    <ProtectedRoute>
                        <Harvests />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/expenses"
                element={
                    <ProtectedRoute>
                        <Expenses />
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                ANALYTICS
            ================================================= */}

            <Route
                path="/reports"
                element={
                    <ProtectedRoute>
                        <Reports />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/analytics"
                element={
                    <ProtectedRoute>
                        <Analytics />
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                AI TOOLS
            ================================================= */}

            <Route
                path="/ai-detection"
                element={
                    <ProtectedRoute>
                        <AIDetection />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/ai-detection/quick-scan"
                element={
                    <ProtectedRoute>
                        <QuickPlantScan />
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                DEFAULT
            ================================================= */}

            <Route
                path="/"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />


            {/* =================================================
                404
            ================================================= */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />

        </Routes>
    );
};


export default AppRoutes;