import { useAuth } from '../context/AuthContext';

const DemoBanner = () => {
    const { isDemo } = useAuth();

    if (!isDemo) return null;

    return (
        <div className="demo-banner">
            <div className="demo-banner-content">
                <span className="demo-banner-icon">ℹ️</span>
                <div>
                    <strong>Mode Demo (Read-Only)</strong>
                    <p>
                        Anda sedang menjelajahi data percontohan FARMORA. Seluruh operasi tambah, edit, hapus, dan pemindaian AI dinonaktifkan.
                    </p>
                </div>
            </div>
            <span className="demo-banner-pill">
                Hanya Baca
            </span>
        </div>
    );
};

export default DemoBanner;
