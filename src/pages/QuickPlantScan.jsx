import {
    useEffect,
    useRef,
    useState,
} from 'react';

import api from '../services/api';
import Sidebar from '../components/Sidebar';

const QuickPlantScan = () => {
    const fileInputRef = useRef(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [result, setResult] = useState(null);

    const [history, setHistory] = useState([]);
    const [selectedHistory, setSelectedHistory] = useState(null);

    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [historyDeleting, setHistoryDeleting] = useState(false);

    const [error, setError] = useState('');

    const backendBaseUrl = 'http://localhost:5000';

    // =========================================================
    // IMAGE URL
    // =========================================================

    const getImageUrl = (imagePath) => {
        if (!imagePath) {
            return '';
        }

        if (
            imagePath.startsWith('http://') ||
            imagePath.startsWith('https://')
        ) {
            return imagePath;
        }

        return `${backendBaseUrl}/${imagePath.replace(/^\/+/, '')}`;
    };

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDateTime = (date) => {
        if (!date) {
            return '-';
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return '-';
        }

        return parsedDate.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // =========================================================
    // CONDITION
    // =========================================================

    const getConditionLabel = (condition) => {
        switch (condition) {
            case 'healthy':
                return 'Sehat';

            case 'problem':
                return 'Bermasalah';

            case 'uncertain':
                return 'Tidak Yakin';

            default:
                return 'Tidak diketahui';
        }
    };

    const getConditionIcon = (condition) => {
        switch (condition) {
            case 'healthy':
                return '✓';

            case 'problem':
                return '!';

            case 'uncertain':
                return '?';

            default:
                return '•';
        }
    };

    // =========================================================
    // FETCH HISTORY
    // =========================================================

    const fetchHistory = async () => {
        try {
            setHistoryLoading(true);

            const response = await api.get(
                '/ai-detection/quick-scans'
            );

            if (response.data.success) {
                setHistory(response.data.data || []);
            }
        } catch (err) {
            console.error(
                'Quick scan history error:',
                err
            );
        } finally {
            setHistoryLoading(false);
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        fetchHistory();
    }, []);

    // =========================================================
    // FILE SELECT
    // =========================================================

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setError('');
        setResult(null);

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
        ];

        // Validasi format
        if (!allowedTypes.includes(file.type)) {
            setError(
                'Format gambar harus JPG, PNG atau WEBP.'
            );

            event.target.value = '';
            return;
        }

        // Validasi ukuran
        if (file.size > 5 * 1024 * 1024) {
            setError(
                'Ukuran gambar maksimal 5 MB.'
            );

            event.target.value = '';
            return;
        }

        // Hapus preview lama
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        // Buat preview baru
        const newPreviewUrl =
            URL.createObjectURL(file);

        setSelectedFile(file);
        setPreviewUrl(newPreviewUrl);
    };

    // =========================================================
    // REMOVE IMAGE
    // =========================================================

    const handleRemoveImage = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setSelectedFile(null);
        setPreviewUrl('');
        setResult(null);
        setError('');

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // =========================================================
    // SCAN
    // =========================================================

    const handleScan = async () => {
        if (!selectedFile) {
            setError(
                'Pilih foto tanaman terlebih dahulu.'
            );

            return;
        }

        try {
            setLoading(true);
            setError('');
            setResult(null);

            const formData = new FormData();

            formData.append(
                'image',
                selectedFile
            );

            const response = await api.post(
                '/ai-detection/quick-scan',
                formData,
                {
                    headers: {
                        'Content-Type':
                            'multipart/form-data',
                    },
                }
            );

            if (response.data.success) {
                const scanResult =
                    response.data.data;

                setResult({
                    ...scanResult,

                    image_path:
                        scanResult.image_path ||
                        scanResult.image?.image_path ||
                        '',
                });

                await fetchHistory();
            }
        } catch (err) {
            console.error(
                'Quick scan error:',
                err
            );

            setError(
                err.response?.data?.message ||
                'Gagal melakukan analisis tanaman.'
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // HISTORY DETAIL
    // =========================================================

    const handleHistoryClick = (item) => {
        let parsedResult = {};

        if (item.result) {
            try {
                parsedResult =
                    typeof item.result === 'string'
                        ? JSON.parse(item.result)
                        : item.result;
            } catch (err) {
                console.error(
                    'Gagal membaca hasil scan:',
                    err
                );
            }
        }

        setSelectedHistory({
            ...item,
            ...parsedResult,

            image_path:
                item.image_path ||
                parsedResult.image_path ||
                '',
        });
    };

    // =========================================================
    // DELETE ALL HISTORY
    // =========================================================

    const handleDeleteAllHistory = async () => {
        if (
            history.length === 0 ||
            historyDeleting
        ) {
            return;
        }

        const confirmed = window.confirm(
            `Hapus semua ${history.length} riwayat Quick Scan?\n\nSemua hasil analisis dan gambar akan dihapus permanen.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setHistoryDeleting(true);
            setError('');

            await api.delete(
                '/ai-detection/quick-scans'
            );

            setHistory([]);
            setSelectedHistory(null);
            setResult(null);
        } catch (err) {
            console.error(
                'Delete all quick scan history error:',
                err
            );

            setError(
                err.response?.data?.message ||
                'Gagal menghapus seluruh riwayat Quick Scan.'
            );
        } finally {
            setHistoryDeleting(false);
        }
    };

    // =========================================================
    // NEW SCAN
    // =========================================================

    const handleNewScan = () => {
        handleRemoveImage();

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="dashboard-layout">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <Sidebar
                activePage="quick-plant-scan"
            />

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="dashboard-main">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="page-header">
                    <div>
                        <span className="header-label">
                            AI TOOLS
                        </span>

                        <h1>
                            Quick Plant Scan
                        </h1>

                        <p>
                            Upload foto tanaman apa saja
                            untuk mendapatkan analisis cepat.
                        </p>
                    </div>
                </header>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div className="ai-error-box">
                        {error}
                    </div>
                )}

                {/* =================================================
                    MAIN GRID
                ================================================= */}

                <section className="quick-scan-grid">

                    {/* =================================================
                        UPLOAD PANEL
                    ================================================= */}

                    <div className="ai-panel">

                        <div className="ai-panel-header">
                            <div>
                                <span className="ai-label">
                                    QUICK SCAN
                                </span>

                                <h2>
                                    Scan Tanaman
                                </h2>

                                <p>
                                    Tidak perlu memilih
                                    crop cycle.
                                </p>
                            </div>
                        </div>

                        {/* =================================================
                            PREVIEW
                        ================================================= */}

                        {previewUrl ? (
                            <div className="quick-preview">
                                <img
                                    src={previewUrl}
                                    alt="Preview tanaman"
                                />

                                <button
                                    type="button"
                                    className="preview-remove"
                                    onClick={
                                        handleRemoveImage
                                    }
                                    disabled={loading}
                                >
                                    ×
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="quick-upload-box"
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                                disabled={loading}
                            >
                                <span className="upload-icon">
                                    +
                                </span>

                                <strong>
                                    Pilih Foto Tanaman
                                </strong>

                                <small>
                                    JPG, PNG atau WEBP
                                    <br />
                                    maksimal 5 MB
                                </small>
                            </button>
                        )}

                        {/* =================================================
                            FILE INPUT
                        ================================================= */}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                            hidden
                        />

                        {/* =================================================
                            FILE INFO
                        ================================================= */}

                        {selectedFile && (
                            <div className="selected-file">
                                <div>
                                    <strong>
                                        {selectedFile.name}
                                    </strong>

                                    <span>
                                        {(
                                            selectedFile.size /
                                            1024
                                        ).toFixed(1)}
                                        {' KB'}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    disabled={loading}
                                >
                                    Ganti
                                </button>
                            </div>
                        )}

                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <div className="quick-actions">

                            <button
                                type="button"
                                className="button-primary"
                                onClick={handleScan}
                                disabled={
                                    !selectedFile ||
                                    loading
                                }
                            >
                                {loading
                                    ? 'Menganalisis...'
                                    : 'Scan Tanaman'}
                            </button>

                            {result && !loading && (
                                <button
                                    type="button"
                                    className="button-secondary"
                                    onClick={handleNewScan}
                                >
                                    Scan Baru
                                </button>
                            )}

                        </div>
                    </div>

                    {/* =================================================
                        RESULT PANEL
                    ================================================= */}

                    <div className="ai-panel">

                        <div className="ai-panel-header">
                            <div>
                                <span className="ai-label">
                                    AI RESULT
                                </span>

                                <h2>
                                    Hasil Scan
                                </h2>
                            </div>
                        </div>

                        {/* =================================================
                            LOADING
                        ================================================= */}

                        {loading && (
                            <div className="ai-result-loading">

                                <div className="ai-spinner">
                                    AI
                                </div>

                                <strong>
                                    AI sedang menganalisis...
                                </strong>

                                <p>
                                    Proses ini dapat
                                    membutuhkan beberapa
                                    detik.
                                </p>

                            </div>
                        )}

                        {/* =================================================
                            EMPTY
                        ================================================= */}

                        {!loading && !result && (
                            <div className="ai-empty">

                                <div className="ai-empty-icon">
                                    AI
                                </div>

                                <strong>
                                    Belum ada hasil
                                </strong>

                                <p>
                                    Upload foto untuk
                                    memulai Quick Scan.
                                </p>

                            </div>
                        )}

                        {/* =================================================
                            RESULT
                        ================================================= */}

                        {!loading && result && (
                            <div className="quick-result">

                                {/* =================================================
                                    IMAGE
                                ================================================= */}

                                {result.image_path && (
                                    <div className="result-image">
                                        <img
                                            src={getImageUrl(
                                                result.image_path
                                            )}
                                            alt={
                                                result.plant_name ||
                                                'Tanaman'
                                            }
                                            onError={(event) => {
                                                console.error(
                                                    'Gambar hasil Quick Scan gagal dimuat:',
                                                    event.currentTarget.src
                                                );
                                            }}
                                        />
                                    </div>
                                )}

                                {/* =================================================
                                    PLANT INFO
                                ================================================= */}

                                <div className="result-heading">

                                    <div>
                                        <span className="ai-label">
                                            TANAMAN
                                        </span>

                                        <h3>
                                            {result.plant_name ||
                                                'Tanaman tidak teridentifikasi'}
                                        </h3>
                                    </div>

                                    <div
                                        className={`condition-badge ${result.condition ||
                                            'uncertain'
                                            }`}
                                    >
                                        <span>
                                            {getConditionIcon(
                                                result.condition
                                            )}
                                        </span>

                                        {getConditionLabel(
                                            result.condition
                                        )}
                                    </div>

                                </div>

                                {/* =================================================
                                    DIAGNOSIS
                                ================================================= */}

                                <div className="result-diagnosis">
                                    <span>
                                        Diagnosis
                                    </span>

                                    <strong>
                                        {result.diagnosis ||
                                            'Tidak dapat ditentukan'}
                                    </strong>
                                </div>

                                {/* =================================================
                                    CONFIDENCE
                                ================================================= */}

                                <div className="confidence-section">

                                    <div className="confidence-header">
                                        <span>
                                            Confidence
                                        </span>

                                        <strong>
                                            {Number(
                                                result.confidence || 0
                                            )}
                                            %
                                        </strong>
                                    </div>

                                    <div className="confidence-track">
                                        <div
                                            className="confidence-fill"
                                            style={{
                                                width: `${Math.min(
                                                    100,
                                                    Math.max(
                                                        0,
                                                        Number(
                                                            result.confidence ||
                                                            0
                                                        )
                                                    )
                                                )}%`,
                                            }}
                                        />
                                    </div>

                                </div>

                                {/* =================================================
                                    TWO COLUMN
                                ================================================= */}

                                <div className="result-two-column">

                                    {/* GEJALA */}

                                    <div className="result-section">

                                        <span className="result-section-title">
                                            Gejala
                                        </span>

                                        {result.symptoms?.length > 0 ? (
                                            <ul>
                                                {result.symptoms.map(
                                                    (
                                                        symptom,
                                                        index
                                                    ) => (
                                                        <li
                                                            key={index}
                                                        >
                                                            {symptom}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        ) : (
                                            <p className="result-muted">
                                                Tidak ada gejala
                                                yang teridentifikasi.
                                            </p>
                                        )}

                                    </div>

                                    {/* PENYEBAB */}

                                    <div className="result-section">

                                        <span className="result-section-title">
                                            Kemungkinan Penyebab
                                        </span>

                                        {result.possible_causes?.length > 0 ? (
                                            <ul>
                                                {result.possible_causes.map(
                                                    (
                                                        cause,
                                                        index
                                                    ) => (
                                                        <li
                                                            key={index}
                                                        >
                                                            {cause}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        ) : (
                                            <p className="result-muted">
                                                Belum dapat
                                                ditentukan.
                                            </p>
                                        )}

                                    </div>

                                </div>

                                {/* =================================================
                                    OBSERVATION
                                ================================================= */}

                                {result.observation && (
                                    <div className="result-observation">

                                        <span>
                                            Observasi AI
                                        </span>

                                        <p>
                                            {result.observation}
                                        </p>

                                    </div>
                                )}

                                {/* =================================================
                                    RECOMMENDATION
                                ================================================= */}

                                <div className="result-recommendation">

                                    <span>
                                        Rekomendasi
                                    </span>

                                    <p>
                                        {result.recommendation ||
                                            'Tidak ada rekomendasi.'}
                                    </p>

                                </div>

                            </div>
                        )}

                    </div>
                </section>

                {/* =================================================
                    HISTORY
                ================================================= */}

                <section className="ai-panel history-panel">

                    {/* =================================================
                        HISTORY HEADER
                    ================================================= */}

                    <div className="ai-panel-header history-header">

                        <div>
                            <span className="ai-label">
                                HISTORY
                            </span>

                            <h2>
                                Riwayat Quick Scan
                            </h2>

                            <p>
                                {history.length > 0
                                    ? `${history.length} riwayat tersimpan`
                                    : 'Belum ada riwayat'}
                            </p>
                        </div>

                        {/* HAPUS SEMUA */}

                        {history.length > 0 && (
                            <button
                                type="button"
                                className="history-delete-all"
                                onClick={
                                    handleDeleteAllHistory
                                }
                                disabled={historyDeleting}
                            >
                                {historyDeleting
                                    ? 'Menghapus...'
                                    : 'Hapus Semua'}
                            </button>
                        )}

                    </div>

                    {/* =================================================
                        HISTORY LOADING
                    ================================================= */}

                    {historyLoading ? (
                        <div className="history-loading">
                            Memuat riwayat...
                        </div>
                    ) : history.length === 0 ? (
                        <div className="history-empty">
                            Belum ada riwayat Quick Scan.
                        </div>
                    ) : (
                        <div className="history-list">

                            {history.map((item) => {
                                const condition =
                                    item.condition_status ||
                                    item.condition ||
                                    'uncertain';

                                return (
                                    <button
                                        type="button"
                                        className="history-item"
                                        key={item.id}
                                        onClick={() =>
                                            handleHistoryClick(
                                                item
                                            )
                                        }
                                    >

                                        {/* THUMBNAIL */}

                                        <div className="history-thumbnail">

                                            {item.image_path ? (
                                                <img
                                                    src={getImageUrl(
                                                        item.image_path
                                                    )}
                                                    alt={
                                                        item.plant_name ||
                                                        'Tanaman'
                                                    }
                                                    onError={(
                                                        event
                                                    ) => {
                                                        event.currentTarget.style.display =
                                                            'none';
                                                    }}
                                                />
                                            ) : (
                                                <span>
                                                    AI
                                                </span>
                                            )}

                                        </div>

                                        {/* CONTENT */}

                                        <div className="history-content">

                                            <div className="history-title-row">

                                                <strong>
                                                    {item.plant_name ||
                                                        'Tanaman tidak dikenal'}
                                                </strong>

                                                <span
                                                    className={`history-condition ${condition}`}
                                                >
                                                    {getConditionLabel(
                                                        condition
                                                    )}
                                                </span>

                                            </div>

                                            <p>
                                                {item.diagnosis ||
                                                    'Tidak ada diagnosis'}
                                            </p>

                                            <small>
                                                {formatDateTime(
                                                    item.created_at
                                                )}
                                            </small>

                                        </div>

                                        {/* CONFIDENCE */}

                                        <div className="history-confidence">

                                            <span>
                                                Confidence
                                            </span>

                                            <strong>
                                                {Number(
                                                    item.confidence || 0
                                                )}
                                                %
                                            </strong>

                                        </div>

                                        {/* ARROW */}

                                        <span className="history-arrow">
                                            →
                                        </span>

                                    </button>
                                );
                            })}

                        </div>
                    )}

                </section>

            </main>

            {/* =================================================
                HISTORY DETAIL MODAL
            ================================================= */}

            {selectedHistory && (
                <div
                    className="ai-modal-overlay"
                    onClick={() =>
                        setSelectedHistory(null)
                    }
                >

                    <div
                        className="ai-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* =================================================
                            MODAL HEADER
                        ================================================= */}

                        <div className="ai-modal-header">

                            <div>
                                <span className="ai-label">
                                    QUICK SCAN DETAIL
                                </span>

                                <h2>
                                    Detail Analisis
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={() =>
                                    setSelectedHistory(null)
                                }
                            >
                                ×
                            </button>

                        </div>

                        {/* =================================================
                            MODAL BODY
                        ================================================= */}

                        <div className="modal-body">

                            {/* IMAGE */}

                            {selectedHistory.image_path && (
                                <div className="modal-image">

                                    <img
                                        src={getImageUrl(
                                            selectedHistory.image_path
                                        )}
                                        alt={
                                            selectedHistory.plant_name ||
                                            'Tanaman'
                                        }
                                    />

                                </div>
                            )}

                            {/* TOP */}

                            <div className="modal-result-top">

                                <div>
                                    <span className="ai-label">
                                        TANAMAN
                                    </span>

                                    <h3>
                                        {selectedHistory.plant_name ||
                                            'Tidak teridentifikasi'}
                                    </h3>
                                </div>

                                <div
                                    className={`condition-badge ${selectedHistory.condition ||
                                        selectedHistory.condition_status ||
                                        'uncertain'
                                        }`}
                                >
                                    <span>
                                        {getConditionIcon(
                                            selectedHistory.condition ||
                                            selectedHistory.condition_status
                                        )}
                                    </span>

                                    {getConditionLabel(
                                        selectedHistory.condition ||
                                        selectedHistory.condition_status
                                    )}
                                </div>

                            </div>

                            {/* DIAGNOSIS */}

                            <div className="modal-diagnosis">

                                <span>
                                    Diagnosis
                                </span>

                                <strong>
                                    {selectedHistory.diagnosis ||
                                        'Tidak dapat ditentukan'}
                                </strong>

                            </div>

                            {/* CONFIDENCE */}

                            <div className="confidence-section">

                                <div className="confidence-header">

                                    <span>
                                        Confidence
                                    </span>

                                    <strong>
                                        {Number(
                                            selectedHistory.confidence ||
                                            0
                                        )}
                                        %
                                    </strong>

                                </div>

                                <div className="confidence-track">

                                    <div
                                        className="confidence-fill"
                                        style={{
                                            width: `${Math.min(
                                                100,
                                                Math.max(
                                                    0,
                                                    Number(
                                                        selectedHistory.confidence ||
                                                        0
                                                    )
                                                )
                                            )}%`,
                                        }}
                                    />

                                </div>

                            </div>

                            {/* DETAIL GRID */}

                            <div className="result-two-column">

                                {/* GEJALA */}

                                <div className="result-section">

                                    <span className="result-section-title">
                                        Gejala
                                    </span>

                                    {selectedHistory.symptoms?.length > 0 ? (
                                        <ul>
                                            {selectedHistory.symptoms.map(
                                                (
                                                    symptom,
                                                    index
                                                ) => (
                                                    <li
                                                        key={index}
                                                    >
                                                        {symptom}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    ) : (
                                        <p className="result-muted">
                                            Tidak ada data.
                                        </p>
                                    )}

                                </div>

                                {/* PENYEBAB */}

                                <div className="result-section">

                                    <span className="result-section-title">
                                        Kemungkinan Penyebab
                                    </span>

                                    {selectedHistory.possible_causes?.length > 0 ? (
                                        <ul>
                                            {selectedHistory.possible_causes.map(
                                                (
                                                    cause,
                                                    index
                                                ) => (
                                                    <li
                                                        key={index}
                                                    >
                                                        {cause}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    ) : (
                                        <p className="result-muted">
                                            Tidak ada data.
                                        </p>
                                    )}

                                </div>

                            </div>

                            {/* OBSERVATION */}

                            {selectedHistory.observation && (
                                <div className="result-observation">

                                    <span>
                                        Observasi AI
                                    </span>

                                    <p>
                                        {
                                            selectedHistory.observation
                                        }
                                    </p>

                                </div>
                            )}

                            {/* RECOMMENDATION */}

                            <div className="result-recommendation">

                                <span>
                                    Rekomendasi
                                </span>

                                <p>
                                    {
                                        selectedHistory.recommendation ||
                                        'Tidak ada rekomendasi.'
                                    }
                                </p>

                            </div>

                            {/* DATE */}

                            <div className="scan-date">

                                <span>
                                    Waktu Scan
                                </span>

                                <strong>
                                    {formatDateTime(
                                        selectedHistory.created_at
                                    )}
                                </strong>

                            </div>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default QuickPlantScan;