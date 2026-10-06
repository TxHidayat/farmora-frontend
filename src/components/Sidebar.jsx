import {
    useState,
    useRef,
    useEffect
} from 'react';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';


const Sidebar = ({ activePage }) => {

    const navigate = useNavigate();

    const {
        user,
        logout
    } = useAuth();


    // =========================================
    // MOBILE USER MENU
    // =========================================

    const [
        showMobileUserMenu,
        setShowMobileUserMenu
    ] = useState(false);

    const mobileUserMenuRef = useRef(null);


    // =========================================
    // NAVIGATION
    // =========================================

    const goTo = (path) => {

        navigate(path);

        setShowMobileUserMenu(false);

    };


    // =========================================
    // LOGOUT
    // =========================================

    const handleLogout = () => {

        setShowMobileUserMenu(false);

        logout();

        navigate('/login', {
            replace: true,
        });

    };


    // =========================================
    // CLOSE MOBILE MENU
    // CLICK OUTSIDE
    // =========================================

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                mobileUserMenuRef.current &&
                !mobileUserMenuRef.current.contains(
                    event.target
                )
            ) {

                setShowMobileUserMenu(false);

            }

        };


        document.addEventListener(
            'mousedown',
            handleClickOutside
        );


        return () => {

            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );

        };

    }, []);


    return (

        <aside className="sidebar">


            {/* =================================
                TOP HEADER
            ================================= */}

            <div className="sidebar-header-top">


                {/* BRAND */}

                <div className="sidebar-brand">

                    <div className="sidebar-logo">
                        <img src="/img/greenWhite1.png" alt="FARMORA" />
                    </div>

                    <div>

                        <strong>
                            FARMORA
                        </strong>

                        <span>
                            Smart Farm
                        </span>

                    </div>

                </div>


                {/* =================================
                    MOBILE USER MENU
                ================================= */}

                <div
                    className="mobile-user-menu"
                    ref={mobileUserMenuRef}
                >

                    <button
                        type="button"
                        className="mobile-user-menu-button"
                        onClick={() =>
                            setShowMobileUserMenu(
                                (prev) => !prev
                            )
                        }
                        aria-label="Menu pengguna"
                    >
                        ⋮
                    </button>


                    {showMobileUserMenu && (

                        <div className="mobile-user-dropdown">


                            {/* USER INFO */}

                            <div className="mobile-user-info">

                                <div className="mobile-user-avatar">

                                    {
                                        user?.name
                                            ?.charAt(0)
                                            ?.toUpperCase() ||
                                        'U'
                                    }

                                </div>


                                <div>

                                    <strong>
                                        {
                                            user?.name ||
                                            'User'
                                        }
                                    </strong>


                                    <span>
                                        {
                                            user?.email ||
                                            ''
                                        }
                                    </span>

                                </div>

                            </div>


                            {/* DIVIDER */}

                            <div className="mobile-user-divider" />


                            {/* LOGOUT */}

                            <button
                                type="button"
                                className="mobile-logout-button"
                                onClick={handleLogout}
                            >
                                Keluar
                            </button>

                        </div>

                    )}

                </div>

            </div>


            {/* =================================
                NAVIGATION
            ================================= */}

            <nav className="sidebar-nav">


                {/* =================================
                    OVERVIEW
                ================================= */}

                <div className="nav-section">
                    OVERVIEW
                </div>


                <button
                    type="button"
                    className={`nav-item ${activePage === 'dashboard'
                        ? 'active'
                        : ''
                        }`}
                    onClick={() =>
                        goTo('/dashboard')
                    }
                >

                    <span>
                        ⌂
                    </span>

                    Dashboard

                </button>


                {/* =================================
                    FARM MANAGEMENT
                ================================= */}

                <div className="nav-section">
                    FARM MANAGEMENT
                </div>


                <button
                    type="button"
                    className={`nav-item ${activePage === 'farms'
                        ? 'active'
                        : ''
                        }`}
                    onClick={() =>
                        goTo('/farms')
                    }
                >

                    <span>
                        ◫
                    </span>

                    Kebun

                </button>


                <button
                    type="button"
                    className={`nav-item ${activePage === 'fields'
                        ? 'active'
                        : ''
                        }`}
                    onClick={() =>
                        goTo('/fields')
                    }
                >

                    <span>
                        □
                    </span>

                    Lahan

                </button>


                <button
                    type="button"
                    className={`nav-item ${activePage === 'crop-cycles'
                        ? 'active'
                        : ''
                        }`}
                    onClick={() =>
                        goTo('/crop-cycles')
                    }
                >

                    <span>
                        ♧
                    </span>

                    Tanaman

                </button>


                {/* =================================
                    OPERASIONAL
                ================================= */}

                <div className="nav-section">
                    OPERASIONAL
                </div>


                <button
                    type="button"
                    className={`nav-item ${activePage === 'activities'
                        ? 'active'
                        : ''
                        }`}
                    onClick={() =>
                        goTo('/activities')
                    }
                >

                    <span>
                        ✓
                    </span>

                    Aktivitas

                </button>


                <button
                    type="button"
                    className={`nav-item ${activePage === 'harvests'
                        ? 'active'
                        : ''
                        }`}
                    onClick={() =>
                        goTo('/harvests')
                    }
                >

                    <span>
                        ▣
                    </span>

                    Panen

                </button>


                <button
                    type="button"
                    className={`nav-item ${activePage === 'expenses'
                        ? 'active'
                        : ''
                        }`}
                    onClick={() =>
                        goTo('/expenses')
                    }
                >

                    <span>
                        Rp
                    </span>

                    Pengeluaran

                </button>


                {/* =================================
                    ANALYTICS
                ================================= */}

                <div className="nav-section">
                    ANALYTICS
                </div>


                {/* ANALYTICS */}

                <button
                    type="button"
                    className={`nav-item ${activePage === 'analytics'
                        ? 'active'
                        : ''
                        }`}
                    onClick={() =>
                        goTo('/analytics')
                    }
                >

                    <span>
                        ◈
                    </span>

                    Analytics

                </button>


                {/* REPORTS */}

                <button
                    type="button"
                    className={`nav-item ${activePage === 'reports'
                        ? 'active'
                        : ''
                        }`}
                    onClick={() =>
                        goTo('/reports')
                    }
                >

                    <span>
                        ▥
                    </span>

                    Laporan

                </button>


                {/* =================================
                    AI TOOLS
                ================================= */}

                <div className="nav-section">
                    AI TOOLS
                </div>


                {/* PEST DETECTION */}

                <button
                    type="button"
                    className={`nav-item ${activePage === 'ai-detection'
                        ? 'active'
                        : ''
                        }`}
                    onClick={() =>
                        goTo('/ai-detection')
                    }
                >

                    <span>
                        AI
                    </span>

                    Pest Detection

                </button>


                {/* QUICK PLANT SCAN */}

                <button
                    type="button"
                    className={`nav-item ${activePage === 'quick-plant-scan'
                        ? 'active'
                        : ''
                        }`}
                    onClick={() =>
                        goTo(
                            '/ai-detection/quick-scan'
                        )
                    }
                >

                    <span>
                        QS
                    </span>

                    Quick Plant Scan

                </button>


            </nav>


            {/* =================================
                DESKTOP USER SECTION
                TIDAK DIUBAH
            ================================= */}

            <div className="sidebar-bottom desktop-user-section">


                <div className="sidebar-user">


                    <div className="user-avatar">

                        {
                            user?.name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                            'U'
                        }

                    </div>


                    <div className="user-info">

                        <strong>
                            {
                                user?.name ||
                                'User'
                            }
                        </strong>


                        <span>
                            {
                                user?.email ||
                                ''
                            }
                        </span>

                    </div>


                </div>


                <button
                    type="button"
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Keluar
                </button>


            </div>


        </aside>

    );

};


export default Sidebar;