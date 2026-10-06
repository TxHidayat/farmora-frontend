import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const ModulePage = ({
    title,
    subtitle,
    module,
}) => {
    const navigate = useNavigate();

    return (
        <div className="dashboard-layout">
            <Sidebar activePage={module} />


            {/* MAIN */}

            <main className="dashboard-main">

                <header className="dashboard-header">

                    <div>

                        <span className="header-label">
                            FARMORA
                        </span>

                        <h1>
                            {title}
                        </h1>

                        <p>
                            {subtitle}
                        </p>

                    </div>

                </header>


                <section className="empty-state">

                    <div className="empty-icon">
                        {module === 'crop-cycles'
                            ? '♧'
                            : module === 'activities'
                                ? '✓'
                                : module === 'harvests'
                                    ? '▣'
                                    : module === 'expenses'
                                        ? 'Rp'
                                        : '▥'}
                    </div>

                    <h3>
                        Modul {title}
                    </h3>

                    <p>
                        Halaman ini sudah terhubung
                        dengan navigasi FARMORA.
                        CRUD modul akan kita bangun
                        menggunakan API backend yang
                        sudah tersedia.
                    </p>

                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate('/dashboard')
                        }
                    >
                        Kembali ke Dashboard
                    </button>

                </section>

            </main>

        </div>
    );
};

export default ModulePage;