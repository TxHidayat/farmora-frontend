import { useEffect, useState } from 'react';

import api from '../services/api';
import Sidebar from '../components/Sidebar';

const Activities = () => {
    const [activities, setActivities] = useState([]);
    const [cropCycles, setCropCycles] = useState([]);
    const [fields, setFields] = useState([]);
    const [farms, setFarms] = useState([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);

    const [form, setForm] = useState({
        crop_cycle_id: '',
        activity_type: '',
        activity_date: '',
        quantity: '',
        unit: '',
        cost: '',
        description: '',
        notes: '',
    });

    // =========================================
    // FETCH DATA
    // =========================================

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');

            const [
                activitiesResponse,
                cropsResponse,
                fieldsResponse,
                farmsResponse,
            ] = await Promise.all([
                api.get('/activities'),
                api.get('/crop-cycles'),
                api.get('/fields'),
                api.get('/farms'),
            ]);

            if (activitiesResponse.data.success) {
                setActivities(
                    activitiesResponse.data.data || []
                );
            }

            if (cropsResponse.data.success) {
                setCropCycles(
                    cropsResponse.data.data || []
                );
            }

            if (fieldsResponse.data.success) {
                setFields(
                    fieldsResponse.data.data || []
                );
            }

            if (farmsResponse.data.success) {
                setFarms(
                    farmsResponse.data.data || []
                );
            }
        } catch (error) {
            console.error(
                'Fetch activities error:',
                error
            );

            setError(
                error.response?.data?.message ||
                'Gagal mengambil data aktivitas.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // =========================================
    // FORM CHANGE
    // =========================================

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =========================================
    // RESET FORM
    // =========================================

    const resetForm = () => {
        setForm({
            crop_cycle_id: '',
            activity_type: '',
            activity_date: '',
            quantity: '',
            unit: '',
            cost: '',
            description: '',
            notes: '',
        });

        setEditingActivity(null);
    };

    // =========================================
    // CREATE
    // =========================================

    const openCreateModal = () => {
        resetForm();

        setError('');
        setSuccess('');

        setShowModal(true);
    };

    // =========================================
    // EDIT
    // =========================================

    const openEditModal = (activity) => {
        setEditingActivity(activity);

        setForm({
            crop_cycle_id:
                activity.crop_cycle_id || '',

            activity_type:
                activity.activity_type || '',

            activity_date:
                activity.activity_date || '',

            quantity:
                activity.quantity ?? '',

            unit:
                activity.unit || '',

            cost:
                activity.cost ?? '',

            description:
                activity.description || '',

            notes:
                activity.notes || '',
        });

        setError('');
        setSuccess('');

        setShowModal(true);
    };

    // =========================================
    // CLOSE
    // =========================================

    const closeModal = () => {
        if (submitting) {
            return;
        }

        setShowModal(false);
        resetForm();
    };

    // =========================================
    // SUBMIT
    // =========================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            if (!form.crop_cycle_id) {
                throw new Error(
                    'Silakan pilih tanaman terlebih dahulu.'
                );
            }

            if (!form.activity_type.trim()) {
                throw new Error(
                    'Jenis aktivitas wajib diisi.'
                );
            }

            if (!form.activity_date) {
                throw new Error(
                    'Tanggal aktivitas wajib diisi.'
                );
            }

            const quantityValue =
                form.quantity === ''
                    ? null
                    : Number(form.quantity);

            if (
                quantityValue !== null &&
                (Number.isNaN(quantityValue) ||
                    quantityValue < 0)
            ) {
                throw new Error(
                    'Jumlah tidak boleh bernilai negatif.'
                );
            }

            const costValue =
                form.cost === ''
                    ? 0
                    : Number(form.cost);

            if (
                Number.isNaN(costValue) ||
                costValue < 0
            ) {
                throw new Error(
                    'Biaya tidak boleh bernilai negatif.'
                );
            }

            const payload = {
                crop_cycle_id:
                    Number(form.crop_cycle_id),

                activity_type:
                    form.activity_type.trim(),

                activity_date:
                    form.activity_date,

                quantity:
                    quantityValue,

                unit:
                    form.unit.trim() || null,

                cost:
                    costValue,

                description:
                    form.description.trim() || null,

                notes:
                    form.notes.trim() || null,
            };

            let response;

            if (editingActivity) {
                response = await api.put(
                    `/activities/${editingActivity.id}`,
                    payload
                );
            } else {
                response = await api.post(
                    '/activities',
                    payload
                );
            }

            if (!response.data.success) {
                throw new Error(
                    response.data.message ||
                    'Gagal menyimpan aktivitas.'
                );
            }

            setShowModal(false);
            resetForm();

            setSuccess(
                editingActivity
                    ? 'Aktivitas berhasil diperbarui.'
                    : 'Aktivitas berhasil ditambahkan.'
            );

            await fetchData();
        } catch (error) {
            console.error(
                'Save activity error:',
                error
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                'Gagal menyimpan aktivitas.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    // =========================================
    // DELETE
    // =========================================

    const handleDelete = async (activity) => {
        const confirmed =
            window.confirm(
                `Hapus aktivitas "${activity.activity_type}"?\n\nData aktivitas akan dihapus permanen.`
            );

        if (!confirmed) {
            return;
        }

        try {
            setError('');
            setSuccess('');

            const response =
                await api.delete(
                    `/activities/${activity.id}`
                );

            if (!response.data.success) {
                throw new Error(
                    response.data.message ||
                    'Gagal menghapus aktivitas.'
                );
            }

            setSuccess(
                'Aktivitas berhasil dihapus.'
            );

            await fetchData();
        } catch (error) {
            console.error(
                'Delete activity error:',
                error
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                'Gagal menghapus aktivitas.'
            );
        }
    };

    // =========================================
    // HELPER
    // =========================================

    const getCrop = (cropId) => {
        return cropCycles.find(
            (crop) =>
                Number(crop.id) ===
                Number(cropId)
        );
    };

    const getField = (cropId) => {
        const crop = getCrop(cropId);

        if (!crop) {
            return null;
        }

        return fields.find(
            (field) =>
                Number(field.id) ===
                Number(crop.field_id)
        );
    };

    const getFarm = (cropId) => {
        const field = getField(cropId);

        if (!field) {
            return null;
        }

        return farms.find(
            (farm) =>
                Number(farm.id) ===
                Number(field.farm_id)
        );
    };

    const getCropName = (cropId) => {
        const crop = getCrop(cropId);

        return (
            crop?.crop_name ||
            'Tanaman tidak ditemukan'
        );
    };

    const getFieldName = (cropId) => {
        const field = getField(cropId);

        return (
            field?.name ||
            'Lahan tidak ditemukan'
        );
    };

    const getFarmName = (cropId) => {
        const farm = getFarm(cropId);

        return (
            farm?.name ||
            'Kebun tidak ditemukan'
        );
    };

    const formatRupiah = (value) => {
        return new Intl.NumberFormat(
            'id-ID',
            {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
            }
        ).format(
            Number(value || 0)
        );
    };

    const formatNumber = (value) => {
        if (
            value === null ||
            value === undefined ||
            value === ''
        ) {
            return '-';
        }

        return new Intl.NumberFormat(
            'id-ID',
            {
                maximumFractionDigits: 2,
            }
        ).format(
            Number(value)
        );
    };

    const formatDate = (date) => {
        if (!date) {
            return '-';
        }

        return new Date(
            `${date}T00:00:00`
        ).toLocaleDateString(
            'id-ID',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }
        );
    };

    // =========================================
    // SORT
    // =========================================

    const sortedActivities =
        [...activities].sort(
            (a, b) =>
                new Date(
                    `${b.activity_date}T00:00:00`
                ) -
                new Date(
                    `${a.activity_date}T00:00:00`
                )
        );

    // =========================================
    // SUMMARY
    // =========================================

    const totalCost =
        activities.reduce(
            (total, activity) =>
                total +
                Number(
                    activity.cost || 0
                ),
            0
        );

    const totalQuantity =
        activities.reduce(
            (total, activity) =>
                total +
                Number(
                    activity.quantity || 0
                ),
            0
        );

    // =========================================
    // LOADING
    // =========================================

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-logo">
                    <img
                        src="/img/green1.png"
                        alt="FARMORA"
                    />
                </div>

                <p>
                    Memuat data aktivitas...
                </p>
            </div>
        );
    }

    // =========================================
    // RENDER
    // =========================================

    return (
        <div className="dashboard-layout">

            {/* SIDEBAR */}

            <Sidebar
                activePage="activities"
            />

            {/* MAIN */}

            <main className="dashboard-main">

                {/* HEADER */}

                <header className="dashboard-header">

                    <div>
                        <span className="header-label">
                            FARM OPERATIONS
                        </span>

                        <h1>
                            Aktivitas
                        </h1>

                        <p>
                            Catat seluruh kegiatan
                            perawatan dan operasional
                            tanaman.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="primary-button"
                        onClick={
                            openCreateModal
                        }
                    >
                        + Tambah Aktivitas
                    </button>

                </header>

                {/* ALERT */}

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        {success}
                    </div>
                )}

                {/* SUMMARY */}

                <section className="stats-grid">

                    {/* TOTAL AKTIVITAS */}

                    <div className="stat-card">

                        <div className="stat-icon activity">
                            ✓
                        </div>

                        <div>
                            <span>
                                Total Aktivitas
                            </span>

                            <strong>
                                {activities.length}
                            </strong>
                        </div>

                    </div>


                    {/* TANAMAN */}

                    <div className="stat-card">

                        <div className="stat-icon crop">
                            🌱
                        </div>

                        <div>
                            <span>
                                Tanaman
                            </span>

                            <strong>
                                {cropCycles.length}
                            </strong>
                        </div>

                    </div>


                    {/* TOTAL JUMLAH */}

                    <div className="stat-card">

                        <div className="stat-icon field">
                            #
                        </div>

                        <div>
                            <span>
                                Total Jumlah
                            </span>

                            <strong>
                                {formatNumber(
                                    totalQuantity
                                )}
                            </strong>
                        </div>

                    </div>


                    {/* TOTAL BIAYA */}

                    <div className="stat-card">

                        <div className="stat-icon farm">
                            Rp
                        </div>

                        <div>
                            <span>
                                Total Biaya
                            </span>

                            <strong>
                                {formatRupiah(
                                    totalCost
                                )}
                            </strong>
                        </div>

                    </div>

                </section>


                {/* LIST HEADER */}

                <section className="section-heading">

                    <div>
                        <span>
                            ACTIVITY LOG
                        </span>

                        <h2>
                            Riwayat Aktivitas
                        </h2>
                    </div>

                </section>


                {/* EMPTY */}

                {activities.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            ✓
                        </div>

                        <h3>
                            Belum ada aktivitas
                        </h3>

                        <p>
                            Tambahkan aktivitas pertama
                            untuk mulai mencatat kegiatan
                            pertanian.
                        </p>

                        <button
                            type="button"
                            className="primary-button"
                            onClick={
                                openCreateModal
                            }
                        >
                            + Tambah Aktivitas
                        </button>

                    </div>

                ) : (

                    /* ACTIVITY CARDS */

                    <div className="farm-grid">

                        {sortedActivities.map(
                            (activity) => (

                                <div
                                    className="farm-card"
                                    key={
                                        activity.id
                                    }
                                >

                                    {/* TOP */}

                                    <div className="farm-card-top">

                                        <div className="farm-icon">
                                            ✓
                                        </div>

                                        <div className="farm-actions">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openEditModal(
                                                        activity
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="delete-action"
                                                onClick={() =>
                                                    handleDelete(
                                                        activity
                                                    )
                                                }
                                            >
                                                Hapus
                                            </button>

                                        </div>

                                    </div>


                                    {/* TITLE */}

                                    <div className="crop-card-title">

                                        <div>

                                            <h3>
                                                {
                                                    activity.activity_type
                                                }
                                            </h3>

                                            <span className="farm-location">
                                                {
                                                    getCropName(
                                                        activity.crop_cycle_id
                                                    )
                                                }
                                            </span>

                                        </div>

                                        <span className="crop-status status-growing">
                                            {
                                                formatDate(
                                                    activity.activity_date
                                                )
                                            }
                                        </span>

                                    </div>


                                    {/* LOCATION */}

                                    <div className="crop-location-info">

                                        <strong>
                                            {
                                                getFieldName(
                                                    activity.crop_cycle_id
                                                )
                                            }
                                        </strong>

                                        <span>
                                            {
                                                getFarmName(
                                                    activity.crop_cycle_id
                                                )
                                            }
                                        </span>

                                    </div>


                                    {/* DETAILS */}

                                    <div className="farm-details">

                                        <div>

                                            <span>
                                                Tanggal
                                            </span>

                                            <strong>
                                                {
                                                    formatDate(
                                                        activity.activity_date
                                                    )
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Jumlah
                                            </span>

                                            <strong>
                                                {formatNumber(
                                                    activity.quantity
                                                )}

                                                {activity.unit
                                                    ? ` ${activity.unit}`
                                                    : ''}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Biaya
                                            </span>

                                            <strong>
                                                {
                                                    formatRupiah(
                                                        activity.cost
                                                    )
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    {/* DESCRIPTION */}

                                    {activity.description && (

                                        <p className="farm-description">
                                            {
                                                activity.description
                                            }
                                        </p>

                                    )}


                                    {/* NOTES */}

                                    {activity.notes && (

                                        <div className="activity-notes">

                                            <span>
                                                Catatan
                                            </span>

                                            <p>
                                                {
                                                    activity.notes
                                                }
                                            </p>

                                        </div>

                                    )}

                                </div>

                            )
                        )}

                    </div>

                )}

            </main>


            {/* MODAL */}

            {showModal && (

                <div
                    className="modal-overlay"
                    onMouseDown={
                        closeModal
                    }
                >

                    <div
                        className="modal"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* HEADER */}

                        <div className="modal-header">

                            <div>

                                <span>
                                    FARM OPERATIONS
                                </span>

                                <h2>
                                    {editingActivity
                                        ? 'Edit Aktivitas'
                                        : 'Tambah Aktivitas'}
                                </h2>

                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={
                                    closeModal
                                }
                                disabled={
                                    submitting
                                }
                            >
                                ×
                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            className="modal-form"
                            onSubmit={
                                handleSubmit
                            }
                        >

                            {/* TANAMAN */}

                            <div className="form-group">

                                <label htmlFor="crop_cycle_id">
                                    Tanaman
                                </label>

                                <select
                                    id="crop_cycle_id"
                                    name="crop_cycle_id"
                                    value={
                                        form.crop_cycle_id
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Pilih tanaman
                                    </option>

                                    {cropCycles.map(
                                        (crop) => (

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
                                                    getFieldName(
                                                        crop.id
                                                    )
                                                }

                                                {' - '}

                                                {
                                                    getFarmName(
                                                        crop.id
                                                    )
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* JENIS AKTIVITAS */}

                            <div className="form-group">

                                <label htmlFor="activity_type">
                                    Jenis Aktivitas
                                </label>

                                <select
                                    id="activity_type"
                                    name="activity_type"
                                    value={
                                        form.activity_type
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Pilih aktivitas
                                    </option>

                                    <option value="Penyiraman">
                                        Penyiraman
                                    </option>

                                    <option value="Pemupukan">
                                        Pemupukan
                                    </option>

                                    <option value="Penyemprotan">
                                        Penyemprotan
                                    </option>

                                    <option value="Penyiangan">
                                        Penyiangan
                                    </option>

                                    <option value="Perawatan">
                                        Perawatan
                                    </option>

                                    <option value="Pengendalian Hama">
                                        Pengendalian Hama
                                    </option>

                                    <option value="Lainnya">
                                        Lainnya
                                    </option>

                                </select>

                            </div>


                            {/* TANGGAL + BIAYA */}

                            <div className="form-row">

                                <div className="form-group">

                                    <label htmlFor="activity_date">
                                        Tanggal Aktivitas
                                    </label>

                                    <input
                                        id="activity_date"
                                        name="activity_date"
                                        type="date"
                                        value={
                                            form.activity_date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label htmlFor="cost">
                                        Biaya
                                    </label>

                                    <input
                                        id="cost"
                                        name="cost"
                                        type="number"
                                        min="0"
                                        step="1"
                                        placeholder="Contoh: 50000"
                                        value={
                                            form.cost
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                            </div>


                            {/* JUMLAH + SATUAN */}

                            <div className="form-row">

                                <div className="form-group">

                                    <label htmlFor="quantity">
                                        Jumlah
                                    </label>

                                    <input
                                        id="quantity"
                                        name="quantity"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Contoh: 5"
                                        value={
                                            form.quantity
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>


                                <div className="form-group">

                                    <label htmlFor="unit">
                                        Satuan
                                    </label>

                                    <select
                                        id="unit"
                                        name="unit"
                                        value={
                                            form.unit
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="">
                                            Pilih satuan
                                        </option>

                                        <option value="kg">
                                            Kilogram (kg)
                                        </option>

                                        <option value="liter">
                                            Liter
                                        </option>

                                        <option value="gram">
                                            Gram
                                        </option>

                                        <option value="ml">
                                            Mililiter (ml)
                                        </option>

                                        <option value="karung">
                                            Karung
                                        </option>

                                        <option value="bungkus">
                                            Bungkus
                                        </option>

                                        <option value="unit">
                                            Unit
                                        </option>

                                        <option value="lainnya">
                                            Lainnya
                                        </option>

                                    </select>

                                </div>

                            </div>


                            {/* DESKRIPSI */}

                            <div className="form-group">

                                <label htmlFor="description">
                                    Deskripsi
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    rows="3"
                                    placeholder="Contoh: Penyiraman dilakukan pada pagi hari..."
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            {/* CATATAN */}

                            <div className="form-group">

                                <label htmlFor="notes">
                                    Catatan
                                </label>

                                <textarea
                                    id="notes"
                                    name="notes"
                                    rows="3"
                                    placeholder="Contoh: Kondisi tanaman terlihat baik..."
                                    value={
                                        form.notes
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            {/* ACTION */}

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        submitting
                                    }
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={
                                        submitting
                                    }
                                >

                                    {submitting
                                        ? 'Menyimpan...'
                                        : editingActivity
                                            ? 'Simpan Perubahan'
                                            : 'Tambah Aktivitas'}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};

export default Activities;