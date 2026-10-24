
import { lazy, Suspense } from 'react';
import {
    Navigate,
    Route,
    Routes,
} from 'react-router-dom';

// =====================================================
// AUTH PAGES
// =====================================================

const Login = lazy(() => import('../pages/login'));
const Register = lazy(() => import('../pages/register'));

// =====================================================
// MAIN PAGES
// =====================================================

const Dashboard = lazy(() => import('../pages/dashboard'));
const Farms = lazy(() => import('../pages/farms'));
const Fields = lazy(() => import('../pages/fields'));
const CropCycles = lazy(() => import('../pages/crop-cycles'));

const Activities = lazy(() => import('../pages/activities'));
const Harvests = lazy(() => import('../pages/harvests'));
const Expenses = lazy(() => import('../pages/expenses'));

const Reports = lazy(() => import('../pages/report'));
const Analytics = lazy(() => import('../pages/analytics'));

const AIDetection = lazy(() => import('../pages/AIDetection'));
const QuickPlantScan = lazy(() => import('../pages/QuickPlantScan'));

// =====================================================
// AUTH CONTEXT
// =====================================================

import { useAuth } from '../context/AuthContext';

// =====================================================
// LOADING FALLBACK
// =====================================================

const PageLoading = () => {
    return (
        <div className="loading-screen">
            <div className="loading-logo">
                <img
                    src="/img/icon1.png"
                    alt="FARMORA"
                />
            </div>

            <p>Memuat halaman...</p>
        </div>
    );
};

// =====================================================
// PROTECTED ROUTE
// =====================================================

const ProtectedRoute = ({ children }) => {
    const {
        isAuthenticated,
        loading,
    } = useAuth();

    if (loading) {
        return <PageLoading />;
    }

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
// Login & Register
// =====================================================

const PublicRoute = ({ children }) => {
    const {
        isAuthenticated,
        loading,
    } = useAuth();

    if (loading) {
        return <PageLoading />;
    }

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
        <Suspense fallback={<PageLoading />}>
            <Routes>

                {/* AUTH */}

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

                {/* DASHBOARD */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* FARM MANAGEMENT */}

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

                {/* OPERATIONAL */}

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

                {/* ANALYTICS */}

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

                {/* AI TOOLS */}

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

                {/* DEFAULT */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

                {/* 404 */}

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
        </Suspense>
    );
};

export default AppRoutes;
