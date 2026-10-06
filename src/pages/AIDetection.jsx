import { useEffect, useState } from 'react';

import api from '../services/api';
import Sidebar from '../components/Sidebar';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
];

const AIDetection = () => {
    const [cropCycles, setCropCycles] = useState([]);
    const [selectedCrop, setSelectedCrop] = useState('');

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    useEffect(() => {
        fetchCropCycles();
    }, []);

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const fetchCropCycles = async () => {
        try {
            setLoadingData(true);
            setError('');

            const response = await api.get('/crop-cycles');

            if (response.data.success) {
                setCropCycles(
                    response.data.data || []
                );
            }
        } catch (error) {
            console.error(
                'Fetch crop cycles error:',
                error
            );

            setError(
                error.response?.data?.message ||
                'Gagal mengambil data tanaman.'
            );
        } finally {
            setLoadingData(false);
        }
    };

    const handleFileChange = (event) => {
        const selectedFile =
            event.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        setError('');
        setResult(null);

        if (
            !ALLOWED_IMAGE_TYPES.includes(
                selectedFile.type
            )
        ) {
            setFile(null);
            setPreview('');

            setError(
                'Format gambar harus JPG, PNG, atau WEBP.'
            );

            event.target.value = '';

            return;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            setFile(null);
            setPreview('');

            setError(
                'Ukuran gambar maksimal 5 MB.'
            );

            event.target.value = '';

            return;
        }

        if (preview) {
            URL.revokeObjectURL(preview);
        }

        const previewUrl =
            URL.createObjectURL(
                selectedFile
            );

        setFile(selectedFile);
        setPreview(previewUrl);
    };

    const handleAnalyze = async () => {
        setError('');
        setResult(null);

        if (!selectedCrop) {
            setError(
                'Pilih siklus tanaman terlebih dahulu.'
            );

            return;
        }

        if (!file) {
            setError(
                'Pilih gambar tanaman terlebih dahulu.'
            );

            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();

            formData.append(
                'crop_cycle_id',
                selectedCrop
            );

            formData.append(
                'image',
                file
            );

            // Upload gambar
            const uploadResponse =
                await api.post(
                    '/ai-detection/images',
                    formData,
                    {
                        headers: {
                            'Content-Type':
                                'multipart/form-data',
                        },
                    }
                );

            if (
                !uploadResponse.data.success
            ) {
                throw new Error(
                    uploadResponse.data.message ||
                    'Gagal mengupload gambar.'
                );
            }

            const imageId =
                uploadResponse.data.data.id;

            // Jalankan AI
            const analyzeResponse =
                await api.post(
                    `/ai-detection/images/${imageId}/analyze`
                );

            if (
                !analyzeResponse.data.success
            ) {
                throw new Error(
                    analyzeResponse.data.message ||
                    'Gagal melakukan analisis AI.'
                );
            }

            setResult(
                analyzeResponse.data.data
            );

        } catch (error) {
            console.error(
                'AI Detection error:',
                error
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                'Analisis AI gagal.'
            );
        } finally {
            setLoading(false);
        }
    };

    const resetAnalysis = () => {
        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setFile(null);
        setPreview('');
        setResult(null);
        setError('');
    };

    const selectedCropData =
        cropCycles.find(
            (crop) =>
                Number(crop.id) ===
                Number(selectedCrop)
        );

    const getConditionLabel = (
        condition
    ) => {
        if (condition === 'healthy') {
            return 'Sehat';
        }

        if (condition === 'problem') {
            return 'Ada Masalah';
        }

        return 'Belum Pasti';
    };

    const getConditionClass = (
        condition
    ) => {
        if (condition === 'healthy') {
            return 'healthy';
        }

        if (condition === 'problem') {
            return 'problem';
        }

        return 'uncertain';
    };

    const getConfidence = () => {
        const confidence =
            Number(
                result?.confidence || 0
            );

        if (!Number.isFinite(confidence)) {
            return 0;
        }

        return Math.min(
            100,
            Math.max(
                0,
                confidence
            )
        );
    };

    const getConfidenceLabel = () => {
        const confidence =
            getConfidence();

        if (confidence >= 80) {
            return 'Tinggi';
        }

        if (confidence >= 60) {
            return 'Sedang';
        }

        return 'Rendah';
    };

    const getFileSizeLabel = () => {
        if (!file) {
            return '';
        }

        const sizeInMb =
            file.size /
            (1024 * 1024);

        return `${sizeInMb.toFixed(
            2
        )} MB`;
    };

    return (
        <div className="dashboard-layout">

            <Sidebar
                activePage="ai-detection"
            />

            <main className="dashboard-main">

                {/* HEADER */}

                <header className="dashboard-header">

                    <div>

                        <span className="header-label">
                            AI TOOLS
                        </span>

                        <h1>
                            Pest Detection
                        </h1>

                        <p>
                            Analisis kondisi tanaman
                            berdasarkan gambar.
                        </p>

                    </div>

                </header>


                {/* ERROR */}

                {error && (
                    <div className="alert-box danger">
                        {error}
                    </div>
                )}


                {/* MAIN GRID */}

                <section className="ai-grid">

                    {/* =========================================
                        INPUT PANEL
                    ========================================== */}

                    <div className="panel">

                        <div className="panel-header">

                            <div>

                                <span>
                                    PLANT ANALYSIS
                                </span>

                                <h2>
                                    Analisis Tanaman
                                </h2>

                                <p>
                                    Pilih tanaman dan
                                    upload foto untuk
                                    diperiksa AI.
                                </p>

                            </div>

                        </div>


                        {/* CROP SELECT */}

                        <div className="form-group">

                            <label htmlFor="crop-cycle">
                                Siklus Tanaman
                            </label>

                            <select
                                id="crop-cycle"
                                value={
                                    selectedCrop
                                }
                                onChange={(
                                    event
                                ) => {
                                    setSelectedCrop(
                                        event.target.value
                                    );

                                    setResult(
                                        null
                                    );

                                    setError(
                                        ''
                                    );
                                }}
                                disabled={
                                    loadingData ||
                                    loading
                                }
                            >

                                <option value="">

                                    {loadingData
                                        ? 'Memuat tanaman...'
                                        : cropCycles.length ===
                                            0
                                            ? 'Belum ada siklus tanaman'
                                            : 'Pilih tanaman'}

                                </option>


                                {cropCycles.map(
                                    (
                                        crop
                                    ) => (

                                        <option
                                            key={
                                                crop.id
                                            }
                                            value={
                                                crop.id
                                            }
                                        >

                                            {
                                                crop.crop_name
                                            }

                                            {' - '}

                                            {
                                                crop.variety ||
                                                'Varietas tidak tersedia'
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* CROP CONTEXT */}

                        {selectedCropData && (

                            <div className="ai-context-card">

                                <div className="ai-context-main">

                                    <strong>
                                        {
                                            selectedCropData.crop_name
                                        }
                                    </strong>

                                    <span>
                                        Varietas:{' '}
                                        {
                                            selectedCropData.variety ||
                                            '-'
                                        }
                                    </span>

                                </div>


                                <div className="ai-context-status">

                                    <span>
                                        STATUS
                                    </span>

                                    <strong>
                                        {
                                            selectedCropData.status ||
                                            '-'
                                        }
                                    </strong>

                                </div>

                            </div>

                        )}


                        {/* IMAGE UPLOAD */}

                        <div className="form-group">

                            <div className="ai-upload-heading">

                                <label>
                                    Foto Tanaman
                                </label>

                                <span>
                                    Maks. 5 MB
                                </span>

                            </div>


                            <label className="ai-upload">

                                {preview ? (

                                    <div className="ai-preview-wrapper">

                                        <img
                                            src={
                                                preview
                                            }
                                            alt="Preview tanaman"
                                        />

                                        <div className="ai-preview-overlay">
                                            Ganti foto
                                        </div>

                                    </div>

                                ) : (

                                    <div className="ai-upload-placeholder">

                                        <div className="ai-upload-icon">
                                            +
                                        </div>

                                        <strong>
                                            Pilih Foto Tanaman
                                        </strong>

                                        <span>
                                            JPG, PNG atau WEBP
                                        </span>

                                    </div>

                                )}


                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={
                                        handleFileChange
                                    }
                                    disabled={
                                        loading
                                    }
                                />

                            </label>


                            {/* FILE INFO */}

                            {file && (

                                <div className="ai-file-info">

                                    <span>
                                        {
                                            file.name
                                        }
                                    </span>

                                    <span>
                                        {
                                            getFileSizeLabel()
                                        }
                                    </span>

                                </div>

                            )}


                            <p className="ai-upload-hint">

                                Gunakan foto yang cukup terang
                                dan bagian daun terlihat jelas
                                agar hasil analisis lebih informatif.

                            </p>

                        </div>


                        {/* ACTION */}

                        <div className="ai-actions">

                            <button
                                type="button"
                                className="button-primary"
                                onClick={
                                    handleAnalyze
                                }
                                disabled={
                                    loading ||
                                    loadingData ||
                                    !selectedCrop ||
                                    !file
                                }
                            >

                                {loading
                                    ? 'Menganalisis...'
                                    : 'Analisis Tanaman'}

                            </button>


                            {(file ||
                                result) && (

                                    <button
                                        type="button"
                                        className="button-secondary"
                                        onClick={
                                            resetAnalysis
                                        }
                                        disabled={
                                            loading
                                        }
                                    >
                                        Reset
                                    </button>

                                )}

                        </div>

                    </div>


                    {/* =========================================
                        RESULT PANEL
                    ========================================== */}

                    <div className="panel">

                        <div className="panel-header">

                            <div>

                                <span>
                                    AI RESULT
                                </span>

                                <h2>
                                    Hasil Analisis
                                </h2>

                                <p>
                                    Hasil pemeriksaan AI
                                    terhadap foto tanaman.
                                </p>

                            </div>

                        </div>


                        {/* EMPTY */}

                        {!result &&
                            !loading && (

                                <div className="ai-empty">

                                    <div className="ai-empty-icon">
                                        AI
                                    </div>

                                    <strong>
                                        Belum ada hasil analisis
                                    </strong>

                                    <span>
                                        Pilih tanaman dan upload
                                        foto untuk memulai.
                                    </span>

                                </div>

                            )}


                        {/* LOADING */}

                        {loading && (

                            <div className="ai-loading">

                                <div className="loading-logo">
                                    <img src="/img/green1.png" alt="FARMORA" />
                                </div>

                                <strong>
                                    AI sedang menganalisis...
                                </strong>

                                <span>
                                    Foto sedang diproses.
                                    Proses ini dapat membutuhkan
                                    beberapa detik.
                                </span>

                            </div>

                        )}


                        {/* RESULT */}

                        {result &&
                            !loading && (

                                <div className="ai-result">


                                    {/* TOP RESULT */}

                                    <div className="ai-result-top">

                                        <div className="ai-condition-block">

                                            <span>
                                                KONDISI
                                            </span>

                                            <strong
                                                className={`ai-condition-badge ${getConditionClass(
                                                    result.condition
                                                )}`}
                                            >
                                                {
                                                    getConditionLabel(
                                                        result.condition
                                                    )
                                                }
                                            </strong>

                                        </div>


                                        {/* CONFIDENCE */}

                                        <div className="confidence-box">

                                            <span>
                                                CONFIDENCE
                                            </span>

                                            <strong>
                                                {
                                                    getConfidence().toFixed(
                                                        0
                                                    )
                                                }
                                                %
                                            </strong>

                                            <small>
                                                {
                                                    getConfidenceLabel()
                                                }
                                            </small>

                                        </div>

                                    </div>


                                    {/* CONFIDENCE BAR */}

                                    <div className="ai-confidence-bar">

                                        <div
                                            className="ai-confidence-fill"
                                            style={{
                                                width: `${getConfidence()}%`,
                                            }}
                                        />

                                    </div>


                                    {/* DIAGNOSIS */}

                                    <div className="ai-result-section">

                                        <span>
                                            DIAGNOSIS
                                        </span>

                                        <h3>
                                            {
                                                result.diagnosis ||
                                                'Tidak dapat ditentukan'
                                            }
                                        </h3>

                                    </div>


                                    {/* OBSERVATION */}

                                    {result.observation && (

                                        <div className="ai-result-section">

                                            <span>
                                                OBSERVASI
                                            </span>

                                            <p>
                                                {
                                                    result.observation
                                                }
                                            </p>

                                        </div>

                                    )}


                                    {/* SYMPTOMS + CAUSES */}

                                    <div className="ai-two-column">


                                        {/* SYMPTOMS */}

                                        <div>

                                            <span>
                                                GEJALA
                                            </span>


                                            {result.symptoms?.length ? (

                                                <ul>

                                                    {result.symptoms.map(
                                                        (
                                                            symptom,
                                                            index
                                                        ) => (

                                                            <li
                                                                key={
                                                                    index
                                                                }
                                                            >
                                                                {
                                                                    symptom
                                                                }
                                                            </li>

                                                        )
                                                    )}

                                                </ul>

                                            ) : (

                                                <p className="ai-muted">
                                                    Tidak ada gejala
                                                    spesifik yang
                                                    dilaporkan.
                                                </p>

                                            )}

                                        </div>


                                        {/* CAUSES */}

                                        <div>

                                            <span>
                                                KEMUNGKINAN PENYEBAB
                                            </span>


                                            {result.possible_causes?.length ? (

                                                <ul>

                                                    {result.possible_causes.map(
                                                        (
                                                            cause,
                                                            index
                                                        ) => (

                                                            <li
                                                                key={
                                                                    index
                                                                }
                                                            >
                                                                {
                                                                    cause
                                                                }
                                                            </li>

                                                        )
                                                    )}

                                                </ul>

                                            ) : (

                                                <p className="ai-muted">
                                                    Penyebab belum
                                                    dapat ditentukan.
                                                </p>

                                            )}

                                        </div>

                                    </div>


                                    {/* RECOMMENDATION */}

                                    <div className="ai-recommendation">

                                        <span>
                                            REKOMENDASI
                                        </span>

                                        <p>
                                            {
                                                result.recommendation ||
                                                'Tidak ada rekomendasi.'
                                            }
                                        </p>

                                    </div>


                                    {/* NOTE */}

                                    <div className="ai-result-note">

                                        <strong>
                                            Catatan:
                                        </strong>

                                        <span>
                                            Hasil AI merupakan
                                            analisis berdasarkan
                                            gambar yang diberikan.
                                            Gunakan sebagai informasi
                                            pendukung, bukan satu-satunya
                                            dasar keputusan penanganan
                                            tanaman.
                                        </span>

                                    </div>

                                </div>

                            )}

                    </div>

                </section>

            </main>

        </div>
    );
};

export default AIDetection;