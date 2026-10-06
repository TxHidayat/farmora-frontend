import { useEffect, useState } from 'react';

import api from '../services/api';
import Sidebar from '../components/Sidebar';

const Harvests = () => {
    const [harvests, setHarvests] = useState([]);
    const [cropCycles, setCropCycles] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const initialForm = {
        crop_cycle_id: '',
        harvest_date: '',
        quantity: '',
        unit: '',
        grade: '',
        price_per_unit: '',
        notes: '',
    };

    const [form, setForm] =
        useState(initialForm);

    // =========================================
    // FETCH DATA
    // =========================================

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');

            const [
                harvestsResponse,
                cropsResponse,
            ] = await Promise.all([
                api.get('/harvests'),
                api.get('/crop-cycles'),
            ]);

            if (
                harvestsResponse.data.success
            ) {
                setHarvests(
                    harvestsResponse.data.data || []
                );
            }

            if (
                cropsResponse.data.success
            ) {
                setCropCycles(
                    cropsResponse.data.data || []
                );
            }
        } catch (err) {
            console.error(
                'Fetch harvests error:',
                err
            );

            setError(
                err.response?.data?.message ||
                'Gagal mengambil data panen.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // =========================================
    // FORM
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
    // MODAL
    // =========================================

    const openAddModal = () => {
        setEditingId(null);
        setForm(initialForm);

        setError('');
        setSuccess('');

        setShowModal(true);
    };

    const openEditModal = (harvest) => {
        setEditingId(harvest.id);

        setForm({
            crop_cycle_id:
                harvest.crop_cycle_id || '',

            harvest_date:
                harvest.harvest_date || '',

            quantity:
                harvest.quantity ?? '',

            unit:
                harvest.unit || '',

            grade:
                harvest.grade || '',

            price_per_unit:
                harvest.price_per_unit ?? '',

            notes:
                harvest.notes || '',
        });

        setError('');
        setSuccess('');

        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) {
            return;
        }

        setShowModal(false);
        setEditingId(null);

        setForm(initialForm);
        setError('');
    };

    // =========================================
    // SUBMIT
    // =========================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            if (!form.crop_cycle_id) {
                throw new Error(
                    'Pilih tanaman terlebih dahulu.'
                );
            }

            if (!form.harvest_date) {
                throw new Error(
                    'Tanggal panen wajib diisi.'
                );
            }

            const quantity =
                Number(form.quantity);

            if (
                !Number.isFinite(quantity) ||
                quantity <= 0
            ) {
                throw new Error(
                    'Jumlah panen harus lebih dari 0.'
                );
            }

            if (!form.unit.trim()) {
                throw new Error(
                    'Satuan panen wajib diisi.'
                );
            }

            const pricePerUnit =
                form.price_per_unit === ''
                    ? 0
                    : Number(
                        form.price_per_unit
                    );

            if (
                !Number.isFinite(
                    pricePerUnit
                ) ||
                pricePerUnit < 0
            ) {
                throw new Error(
                    'Harga per satuan tidak valid.'
                );
            }

            const payload = {
                crop_cycle_id:
                    Number(
                        form.crop_cycle_id
                    ),

                harvest_date:
                    form.harvest_date,

                quantity,

                unit:
                    form.unit.trim(),

                grade:
                    form.grade.trim() ||
                    null,

                price_per_unit:
                    pricePerUnit,

                notes:
                    form.notes.trim() ||
                    null,
            };

            let response;

            if (editingId) {
                response =
                    await api.put(
                        `/harvests/${editingId}`,
                        payload
                    );
            } else {
                response =
                    await api.post(
                        '/harvests',
                        payload
                    );
            }

            if (
                !response.data.success
            ) {
                throw new Error(
                    response.data.message ||
                    'Gagal menyimpan data panen.'
                );
            }

            setShowModal(false);
            setEditingId(null);
            setForm(initialForm);

            setSuccess(
                editingId
                    ? 'Data panen berhasil diperbarui.'
                    : 'Data panen berhasil ditambahkan.'
            );

            await fetchData();
        } catch (err) {
            console.error(
                'Save harvest error:',
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                'Gagal menyimpan data panen.'
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================
    // DELETE
    // =========================================

    const handleDelete = async (
        harvest
    ) => {
        const confirmed =
            window.confirm(
                `Hapus data panen "${getCropName(
                    harvest.crop_cycle_id
                )}"?\n\nData ini akan dihapus permanen.`
            );

        if (!confirmed) {
            return;
        }

        try {
            setError('');
            setSuccess('');

            const response =
                await api.delete(
                    `/harvests/${harvest.id}`
                );

            if (
                !response.data.success
            ) {
                throw new Error(
                    response.data.message ||
                    'Gagal menghapus data panen.'
                );
            }

            setSuccess(
                'Data panen berhasil dihapus.'
            );

            await fetchData();
        } catch (err) {
            console.error(
                'Delete harvest error:',
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                'Gagal menghapus data panen.'
            );
        }
    };

    // =========================================
    // HELPERS
    // =========================================

    const getCrop = (
        cropCycleId
    ) => {
        return cropCycles.find(
            (crop) =>
                Number(crop.id) ===
                Number(cropCycleId)
        );
    };

    const getCropName = (
        cropCycleId
    ) => {
        const crop =
            getCrop(cropCycleId);

        if (!crop) {
            return `Tanaman #${cropCycleId}`;
        }

        return `${crop.crop_name}${crop.variety
            ? ` - ${crop.variety}`
            : ''
            }`;
    };

    const formatRupiah = (
        value
    ) => {
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

    const formatNumber = (
        value
    ) => {
        return new Intl.NumberFormat(
            'id-ID',
            {
                maximumFractionDigits: 2,
            }
        ).format(
            Number(value || 0)
        );
    };

    const formatDate = (
        date
    ) => {
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

    const getHarvestTotal = (
        harvest
    ) => {
        return (
            Number(
                harvest.quantity || 0
            ) *
            Number(
                harvest.price_per_unit ||
                0
            )
        );
    };

    // =========================================
    // SUMMARY
    // =========================================

    const totalIncome =
        harvests.reduce(
            (total, harvest) =>
                total +
                getHarvestTotal(
                    harvest
                ),
            0
        );

    const uniqueCropIds =
        new Set(
            harvests.map(
                (harvest) =>
                    Number(
                        harvest.crop_cycle_id
                    )
            )
        );

    const harvestedCropCount =
        uniqueCropIds.size;

    const averageIncome =
        harvests.length > 0
            ? totalIncome /
            harvests.length
            : 0;

    const latestHarvest =
        [...harvests].sort(
            (a, b) =>
                new Date(
                    `${b.harvest_date}T00:00:00`
                ) -
                new Date(
                    `${a.harvest_date}T00:00:00`
                )
        )[0];

    const sortedHarvests =
        [...harvests].sort(
            (a, b) =>
                new Date(
                    `${b.harvest_date}T00:00:00`
                ) -
                new Date(
                    `${a.harvest_date}T00:00:00`
                )
        );

    // =========================================
    // PREVIEW TOTAL
    // =========================================

    const previewQuantity =
        Number(form.quantity || 0);

    const previewPrice =
        Number(
            form.price_per_unit || 0
        );

    const previewTotal =
        previewQuantity *
        previewPrice;

    // =========================================
    // LOADING
    // =========================================

    if (loading) {
        return (
            <div className="loading-screen">

                <div className="loading-logo">
                    <img src="/img/green1.png" alt="FARMORA" />
                </div>

                <p>
                    Memuat data panen...
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
                activePage="harvests"
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
                            Panen
                        </h1>

                        <p>
                            Catat hasil panen dan
                            pendapatan dari tanaman.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="primary-button"
                        onClick={
                            openAddModal
                        }
                    >
                        + Tambah Panen
                    </button>

                </header>


                {/* ALERT */}

                {error &&
                    !showModal && (
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

                    {/* PENDAPATAN */}

                    <div className="stat-card">

                        <div className="stat-icon income">
                            Rp
                        </div>

                        <div>

                            <span>
                                Total Pendapatan
                            </span>

                            <strong>
                                {
                                    formatRupiah(
                                        totalIncome
                                    )
                                }
                            </strong>

                        </div>

                    </div>


                    {/* CATATAN */}

                    <div className="stat-card">

                        <div className="stat-icon activity">
                            ▣
                        </div>

                        <div>

                            <span>
                                Catatan Panen
                            </span>

                            <strong>
                                {
                                    harvests.length
                                }
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
                                Tanaman Dipanen
                            </span>

                            <strong>
                                {
                                    harvestedCropCount
                                }
                            </strong>

                        </div>

                    </div>


                    {/* RATA-RATA */}

                    <div className="stat-card">

                        <div className="stat-icon farm">
                            ↑
                        </div>

                        <div>

                            <span>
                                Rata-rata Pendapatan
                            </span>

                            <strong>
                                {
                                    formatRupiah(
                                        averageIncome
                                    )
                                }
                            </strong>

                        </div>

                    </div>

                </section>


                {/* LATEST HARVEST */}

                {latestHarvest && (

                    <section className="harvest-highlight">

                        <div>

                            <span>
                                PANEN TERBARU
                            </span>

                            <h2>
                                {
                                    getCropName(
                                        latestHarvest.crop_cycle_id
                                    )
                                }
                            </h2>

                            <p>
                                {
                                    formatDate(
                                        latestHarvest.harvest_date
                                    )
                                }
                            </p>

                        </div>


                        <div className="harvest-highlight-value">

                            <span>
                                Pendapatan
                            </span>

                            <strong>
                                {
                                    formatRupiah(
                                        getHarvestTotal(
                                            latestHarvest
                                        )
                                    )
                                }
                            </strong>

                            <small>
                                {
                                    formatNumber(
                                        latestHarvest.quantity
                                    )
                                }{' '}
                                {
                                    latestHarvest.unit
                                }
                            </small>

                        </div>

                    </section>

                )}


                {/* LIST */}

                <section className="section-heading">

                    <div>

                        <span>
                            HARVEST LOG
                        </span>

                        <h2>
                            Riwayat Panen
                        </h2>

                    </div>

                </section>


                {/* EMPTY */}

                {harvests.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            ▣
                        </div>

                        <h3>
                            Belum ada data panen
                        </h3>

                        <p>
                            Tambahkan data panen
                            pertama untuk mulai
                            mencatat hasil produksi.
                        </p>

                        <button
                            type="button"
                            className="primary-button"
                            onClick={
                                openAddModal
                            }
                        >
                            + Tambah Panen
                        </button>

                    </div>

                ) : (

                    <div className="content-card">

                        <div className="content-card-header">

                            <div>

                                <h2>
                                    Data Hasil Panen
                                </h2>

                                <p>
                                    Riwayat hasil panen
                                    seluruh tanaman.
                                </p>

                            </div>

                        </div>


                        <div className="table-wrapper">

                            <table className="data-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Tanggal
                                        </th>

                                        <th>
                                            Tanaman
                                        </th>

                                        <th>
                                            Jumlah
                                        </th>

                                        <th>
                                            Grade
                                        </th>

                                        <th>
                                            Harga / Unit
                                        </th>

                                        <th>
                                            Total Pendapatan
                                        </th>

                                        <th>
                                            Aksi
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {sortedHarvests.map(
                                        (harvest) => (

                                            <tr
                                                key={
                                                    harvest.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        formatDate(
                                                            harvest.harvest_date
                                                        )
                                                    }
                                                </td>


                                                <td>

                                                    <strong>
                                                        {
                                                            getCropName(
                                                                harvest.crop_cycle_id
                                                            )
                                                        }
                                                    </strong>

                                                </td>


                                                <td>

                                                    {
                                                        formatNumber(
                                                            harvest.quantity
                                                        )
                                                    }{' '}

                                                    {
                                                        harvest.unit
                                                    }

                                                </td>


                                                <td>

                                                    {harvest.grade ? (

                                                        <span className="grade-badge">

                                                            {
                                                                harvest.grade
                                                            }

                                                        </span>

                                                    ) : (
                                                        '-'
                                                    )}

                                                </td>


                                                <td>

                                                    {
                                                        formatRupiah(
                                                            harvest.price_per_unit
                                                        )
                                                    }

                                                </td>


                                                <td>

                                                    <strong>
                                                        {
                                                            formatRupiah(
                                                                getHarvestTotal(
                                                                    harvest
                                                                )
                                                            )
                                                        }
                                                    </strong>

                                                </td>


                                                <td>

                                                    <div className="action-buttons">

                                                        <button
                                                            type="button"
                                                            className="edit-button"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    harvest
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="delete-button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    harvest
                                                                )
                                                            }
                                                        >
                                                            Hapus
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}


                {/* NOTES */}

                {sortedHarvests.some(
                    (harvest) =>
                        harvest.notes
                ) && (

                        <section className="harvest-notes-section">

                            <div className="section-heading">

                                <div>

                                    <span>
                                        HARVEST NOTES
                                    </span>

                                    <h2>
                                        Catatan Panen
                                    </h2>

                                </div>

                            </div>


                            <div className="harvest-notes-grid">

                                {sortedHarvests
                                    .filter(
                                        (
                                            harvest
                                        ) =>
                                            harvest.notes
                                    )
                                    .map(
                                        (
                                            harvest
                                        ) => (

                                            <div
                                                className="harvest-note-card"
                                                key={
                                                    harvest.id
                                                }
                                            >

                                                <div>

                                                    <strong>
                                                        {
                                                            getCropName(
                                                                harvest.crop_cycle_id
                                                            )
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            formatDate(
                                                                harvest.harvest_date
                                                            )
                                                        }
                                                    </span>

                                                </div>

                                                <p>
                                                    {
                                                        harvest.notes
                                                    }
                                                </p>

                                            </div>

                                        )
                                    )}

                            </div>

                        </section>

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
                        onMouseDown={(
                            event
                        ) =>
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
                                    {editingId
                                        ? 'Edit Data Panen'
                                        : 'Tambah Data Panen'}
                                </h2>

                                <p>
                                    Catat hasil produksi
                                    tanaman.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="modal-close"
                                onClick={
                                    closeModal
                                }
                                disabled={
                                    saving
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

                            {error && (
                                <div className="alert alert-error">
                                    {error}
                                </div>
                            )}


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

                                                {crop.variety
                                                    ? ` - ${crop.variety}`
                                                    : ''}

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* TANGGAL */}

                            <div className="form-group">

                                <label htmlFor="harvest_date">
                                    Tanggal Panen
                                </label>

                                <input
                                    id="harvest_date"
                                    type="date"
                                    name="harvest_date"
                                    value={
                                        form.harvest_date
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>


                            {/* JUMLAH + SATUAN */}

                            <div className="form-row">

                                <div className="form-group">

                                    <label htmlFor="quantity">
                                        Jumlah
                                    </label>

                                    <input
                                        id="quantity"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        name="quantity"
                                        value={
                                            form.quantity
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Contoh: 250"
                                        required
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
                                        required
                                    >

                                        <option value="">
                                            Pilih satuan
                                        </option>

                                        <option value="kg">
                                            Kilogram (kg)
                                        </option>

                                        <option value="ton">
                                            Ton
                                        </option>

                                        <option value="gram">
                                            Gram
                                        </option>

                                        <option value="ikat">
                                            Ikat
                                        </option>

                                        <option value="karung">
                                            Karung
                                        </option>

                                        <option value="peti">
                                            Peti
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


                            {/* GRADE + PRICE */}

                            <div className="form-row">

                                <div className="form-group">

                                    <label htmlFor="grade">
                                        Grade
                                    </label>

                                    <select
                                        id="grade"
                                        name="grade"
                                        value={
                                            form.grade
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="">
                                            Tidak ada grade
                                        </option>

                                        <option value="A">
                                            Grade A
                                        </option>

                                        <option value="B">
                                            Grade B
                                        </option>

                                        <option value="C">
                                            Grade C
                                        </option>

                                    </select>

                                </div>


                                <div className="form-group">

                                    <label htmlFor="price_per_unit">
                                        Harga / Satuan
                                    </label>

                                    <input
                                        id="price_per_unit"
                                        type="number"
                                        min="0"
                                        step="1"
                                        name="price_per_unit"
                                        value={
                                            form.price_per_unit
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Contoh: 8000"
                                    />

                                </div>

                            </div>


                            {/* TOTAL PREVIEW */}

                            <div className="harvest-total-preview">

                                <div>

                                    <span>
                                        ESTIMASI PENDAPATAN
                                    </span>

                                    <small>
                                        Jumlah × Harga / Satuan
                                    </small>

                                </div>


                                <strong>
                                    {
                                        formatRupiah(
                                            previewTotal
                                        )
                                    }
                                </strong>

                            </div>


                            {/* NOTES */}

                            <div className="form-group">

                                <label htmlFor="notes">
                                    Catatan
                                </label>

                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={
                                        form.notes
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows="4"
                                    placeholder="Contoh: Hasil panen cukup baik, sebagian dijual langsung..."
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
                                        saving
                                    }
                                >
                                    Batal
                                </button>


                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={
                                        saving
                                    }
                                >

                                    {saving
                                        ? 'Menyimpan...'
                                        : editingId
                                            ? 'Simpan Perubahan'
                                            : 'Simpan Panen'}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};

export default Harvests;