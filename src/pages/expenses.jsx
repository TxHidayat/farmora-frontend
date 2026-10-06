import { useEffect, useState } from 'react';

import api from '../services/api';
import Sidebar from '../components/Sidebar';

const initialForm = {
    farm_id: '',
    crop_cycle_id: '',
    expense_date: '',
    category: '',
    amount: '',
    description: '',
    notes: '',
};

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [farms, setFarms] = useState([]);
    const [fields, setFields] = useState([]);
    const [cropCycles, setCropCycles] = useState([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingExpense, setEditingExpense] =
        useState(null);

    const [form, setForm] = useState(initialForm);

    // =========================================
    // FETCH DATA
    // =========================================

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');

            const [
                expensesResponse,
                farmsResponse,
                fieldsResponse,
                cropsResponse,
            ] = await Promise.all([
                api.get('/expenses'),
                api.get('/farms'),
                api.get('/fields'),
                api.get('/crop-cycles'),
            ]);

            if (expensesResponse.data.success) {
                setExpenses(
                    expensesResponse.data.data || []
                );
            }

            if (farmsResponse.data.success) {
                setFarms(
                    farmsResponse.data.data || []
                );
            }

            if (fieldsResponse.data.success) {
                setFields(
                    fieldsResponse.data.data || []
                );
            }

            if (cropsResponse.data.success) {
                setCropCycles(
                    cropsResponse.data.data || []
                );
            }
        } catch (error) {
            console.error(
                'Fetch expenses error:',
                error
            );

            setError(
                error.response?.data?.message ||
                'Gagal mengambil data pengeluaran.'
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
    // RESET
    // =========================================

    const resetForm = () => {
        setForm(initialForm);
        setEditingExpense(null);
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

    const openEditModal = (expense) => {
        setEditingExpense(expense);

        setForm({
            farm_id:
                expense.farm_id || '',

            crop_cycle_id:
                expense.crop_cycle_id || '',

            expense_date:
                expense.expense_date || '',

            category:
                expense.category || '',

            amount:
                expense.amount ?? '',

            description:
                expense.description || '',

            notes:
                expense.notes || '',
        });

        setError('');
        setSuccess('');

        setShowModal(true);
    };

    // =========================================
    // CLOSE MODAL
    // =========================================

    const closeModal = () => {
        if (submitting) {
            return;
        }

        setShowModal(false);
        resetForm();

        setError('');
    };

    // =========================================
    // SUBMIT
    // =========================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            if (!form.farm_id) {
                throw new Error(
                    'Kebun wajib dipilih.'
                );
            }

            if (!form.expense_date) {
                throw new Error(
                    'Tanggal pengeluaran wajib diisi.'
                );
            }

            if (!form.category) {
                throw new Error(
                    'Kategori wajib dipilih.'
                );
            }

            const amount =
                Number(form.amount);

            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {
                throw new Error(
                    'Jumlah pengeluaran harus lebih dari 0.'
                );
            }

            const payload = {
                farm_id:
                    Number(form.farm_id),

                crop_cycle_id:
                    form.crop_cycle_id
                        ? Number(
                            form.crop_cycle_id
                        )
                        : null,

                expense_date:
                    form.expense_date,

                category:
                    form.category,

                amount,

                description:
                    form.description.trim(),

                notes:
                    form.notes.trim(),
            };

            let response;

            if (editingExpense) {
                response =
                    await api.put(
                        `/expenses/${editingExpense.id}`,
                        payload
                    );
            } else {
                response =
                    await api.post(
                        '/expenses',
                        payload
                    );
            }

            if (
                !response.data.success
            ) {
                throw new Error(
                    response.data.message ||
                    'Gagal menyimpan pengeluaran.'
                );
            }

            setShowModal(false);
            resetForm();

            setSuccess(
                editingExpense
                    ? 'Pengeluaran berhasil diperbarui.'
                    : 'Pengeluaran berhasil ditambahkan.'
            );

            await fetchData();
        } catch (error) {
            console.error(
                'Save expense error:',
                error
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                'Gagal menyimpan pengeluaran.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    // =========================================
    // DELETE
    // =========================================

    const handleDelete = async (
        expense
    ) => {
        const confirmed =
            window.confirm(
                `Hapus pengeluaran ${formatRupiah(
                    expense.amount
                )}?\n\nData ini akan dihapus permanen.`
            );

        if (!confirmed) {
            return;
        }

        try {
            setError('');
            setSuccess('');

            const response =
                await api.delete(
                    `/expenses/${expense.id}`
                );

            if (
                !response.data.success
            ) {
                throw new Error(
                    response.data.message ||
                    'Gagal menghapus pengeluaran.'
                );
            }

            setSuccess(
                'Pengeluaran berhasil dihapus.'
            );

            await fetchData();
        } catch (error) {
            console.error(
                'Delete expense error:',
                error
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                'Gagal menghapus pengeluaran.'
            );
        }
    };

    // =========================================
    // HELPERS
    // =========================================

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

    const getCategoryLabel = (
        category
    ) => {
        const labels = {
            bibit: 'Bibit',
            pupuk: 'Pupuk',
            pestisida: 'Pestisida',
            tenaga_kerja: 'Tenaga Kerja',
        };

        return (
            labels[category] ||
            category ||
            'Lainnya'
        );
    };

    const getCategoryClass = (
        category
    ) => {
        const classes = {
            bibit: 'expense-badge bibit',
            pupuk: 'expense-badge pupuk',
            pestisida:
                'expense-badge pestisida',
            tenaga_kerja:
                'expense-badge tenaga',
        };

        return (
            classes[category] ||
            'expense-badge'
        );
    };

    const getField = (
        fieldId
    ) => {
        return fields.find(
            (field) =>
                Number(field.id) ===
                Number(fieldId)
        );
    };

    const getCropFarmId = (
        crop
    ) => {
        const field = getField(
            crop.field_id
        );

        return field?.farm_id;
    };

    const getCropName = (
        cropId
    ) => {
        const crop =
            cropCycles.find(
                (item) =>
                    Number(item.id) ===
                    Number(cropId)
            );

        if (!crop) {
            return 'Tanaman tidak ditemukan';
        }

        return `${crop.crop_name}${crop.variety
            ? ` - ${crop.variety}`
            : ''
            }`;
    };

    const getFarmName = (
        farmId
    ) => {
        const farm =
            farms.find(
                (item) =>
                    Number(item.id) ===
                    Number(farmId)
            );

        return (
            farm?.name ||
            'Kebun tidak ditemukan'
        );
    };

    const getExpenseTotal = (
        expense
    ) => {
        return Number(
            expense.amount || 0
        );
    };

    // =========================================
    // FILTER CROP BY FARM
    // =========================================

    const availableCropCycles =
        form.farm_id
            ? cropCycles.filter(
                (crop) =>
                    Number(
                        getCropFarmId(
                            crop
                        )
                    ) ===
                    Number(
                        form.farm_id
                    )
            )
            : [];

    // =========================================
    // SUMMARY
    // =========================================

    const totalExpenses =
        expenses.reduce(
            (total, expense) =>
                total +
                getExpenseTotal(
                    expense
                ),
            0
        );

    const totalTransactions =
        expenses.length;

    const averageExpense =
        totalTransactions > 0
            ? totalExpenses /
            totalTransactions
            : 0;

    const uniqueCategories =
        new Set(
            expenses.map(
                (expense) =>
                    expense.category
            )
        ).size;

    const sortedExpenses =
        [...expenses].sort(
            (a, b) =>
                new Date(
                    `${b.expense_date}T00:00:00`
                ) -
                new Date(
                    `${a.expense_date}T00:00:00`
                )
        );

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
                    Memuat data pengeluaran...
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
                activePage="expenses"
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
                            Pengeluaran
                        </h1>

                        <p>
                            Kelola seluruh biaya
                            operasional pertanian.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="primary-button"
                        onClick={
                            openCreateModal
                        }
                    >
                        + Tambah Pengeluaran
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

                    {/* TOTAL */}

                    <div className="stat-card">

                        <div className="stat-icon farm">
                            Rp
                        </div>

                        <div>

                            <span>
                                Total Pengeluaran
                            </span>

                            <strong>
                                {
                                    formatRupiah(
                                        totalExpenses
                                    )
                                }
                            </strong>

                        </div>

                    </div>


                    {/* TRANSAKSI */}

                    <div className="stat-card">

                        <div className="stat-icon activity">
                            #
                        </div>

                        <div>

                            <span>
                                Jumlah Transaksi
                            </span>

                            <strong>
                                {
                                    totalTransactions
                                }
                            </strong>

                        </div>

                    </div>


                    {/* RATA-RATA */}

                    <div className="stat-card">

                        <div className="stat-icon crop">
                            Rp
                        </div>

                        <div>

                            <span>
                                Rata-rata Transaksi
                            </span>

                            <strong>
                                {
                                    formatRupiah(
                                        averageExpense
                                    )
                                }
                            </strong>

                        </div>

                    </div>


                    {/* KATEGORI */}

                    <div className="stat-card">

                        <div className="stat-icon farm">
                            %
                        </div>

                        <div>

                            <span>
                                Kategori Aktif
                            </span>

                            <strong>
                                {
                                    uniqueCategories
                                }
                            </strong>

                        </div>

                    </div>

                </section>


                {/* EXPENSE LOG */}

                <section className="section-heading">

                    <div>

                        <span>
                            EXPENSE LOG
                        </span>

                        <h2>
                            Riwayat Pengeluaran
                        </h2>

                    </div>

                </section>


                {/* EMPTY */}

                {expenses.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            Rp
                        </div>

                        <h3>
                            Belum ada pengeluaran
                        </h3>

                        <p>
                            Tambahkan biaya operasional
                            pertama untuk mulai
                            mencatat keuangan.
                        </p>

                        <button
                            type="button"
                            className="primary-button"
                            onClick={
                                openCreateModal
                            }
                        >
                            + Tambah Pengeluaran
                        </button>

                    </div>

                ) : (

                    <div className="farm-grid">

                        {sortedExpenses.map(
                            (expense) => (

                                <div
                                    className="farm-card expense-card"
                                    key={
                                        expense.id
                                    }
                                >

                                    {/* TOP */}

                                    <div className="farm-card-top">

                                        <div className="farm-icon">
                                            Rp
                                        </div>


                                        <div className="farm-actions">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openEditModal(
                                                        expense
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
                                                        expense
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
                                                    getCategoryLabel(
                                                        expense.category
                                                    )
                                                }
                                            </h3>

                                            <span className="farm-location">
                                                {
                                                    expense.farm_name ||
                                                    getFarmName(
                                                        expense.farm_id
                                                    )
                                                }
                                            </span>

                                        </div>


                                        <span className="crop-status status-growing">
                                            {
                                                formatDate(
                                                    expense.expense_date
                                                )
                                            }
                                        </span>

                                    </div>


                                    {/* CATEGORY */}

                                    <div className="expense-category-row">

                                        <span
                                            className={getCategoryClass(
                                                expense.category
                                            )}
                                        >
                                            {
                                                getCategoryLabel(
                                                    expense.category
                                                )
                                            }
                                        </span>

                                        {expense.crop_name && (
                                            <span className="expense-crop-label">
                                                {
                                                    expense.crop_name
                                                }
                                            </span>
                                        )}

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
                                                        expense.expense_date
                                                    )
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Jumlah
                                            </span>

                                            <strong className="expense-amount">
                                                {
                                                    formatRupiah(
                                                        expense.amount
                                                    )
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    {/* DESCRIPTION */}

                                    <div className="expense-description">

                                        <span>
                                            DESKRIPSI
                                        </span>

                                        <p>
                                            {
                                                expense.description ||
                                                'Tidak ada deskripsi.'
                                            }
                                        </p>

                                    </div>


                                    {/* NOTES */}

                                    {expense.notes && (

                                        <div className="activity-notes">

                                            <span>
                                                CATATAN
                                            </span>

                                            <p>
                                                {
                                                    expense.notes
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
                        onMouseDown={(
                            event
                        ) =>
                            event.stopPropagation()
                        }
                    >

                        {/* MODAL HEADER */}

                        <div className="modal-header">

                            <div>

                                <span>
                                    FARM OPERATIONS
                                </span>

                                <h2>
                                    {editingExpense
                                        ? 'Edit Pengeluaran'
                                        : 'Tambah Pengeluaran'}
                                </h2>

                                <p>
                                    Catat biaya operasional
                                    pertanian.
                                </p>

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

                            {error && (
                                <div className="alert alert-error">
                                    {error}
                                </div>
                            )}


                            {/* KEBUN */}

                            <div className="form-group">

                                <label htmlFor="farm_id">
                                    Kebun
                                </label>

                                <select
                                    id="farm_id"
                                    name="farm_id"
                                    value={
                                        form.farm_id
                                    }
                                    onChange={(
                                        event
                                    ) => {

                                        const value =
                                            event
                                                .target
                                                .value;

                                        setForm(
                                            (previous) => ({
                                                ...previous,
                                                farm_id:
                                                    value,
                                                crop_cycle_id:
                                                    '',
                                            })
                                        );
                                    }}
                                    required
                                >

                                    <option value="">
                                        Pilih kebun
                                    </option>

                                    {farms.map(
                                        (
                                            farm
                                        ) => (

                                            <option
                                                key={
                                                    farm.id
                                                }
                                                value={
                                                    farm.id
                                                }
                                            >
                                                {
                                                    farm.name
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* TANAMAN */}

                            <div className="form-group">

                                <label htmlFor="crop_cycle_id">

                                    Tanaman

                                    <span className="optional-label">
                                        {' '}
                                        (opsional)
                                    </span>

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
                                    disabled={
                                        !form.farm_id
                                    }
                                >

                                    <option value="">
                                        Pengeluaran umum kebun
                                    </option>

                                    {availableCropCycles.map(
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

                                {!form.farm_id && (
                                    <small className="form-hint">
                                        Pilih kebun terlebih dahulu.
                                    </small>
                                )}

                                {form.farm_id &&
                                    availableCropCycles.length ===
                                    0 && (
                                        <small className="form-hint">
                                            Belum ada tanaman
                                            pada kebun ini.
                                        </small>
                                    )}

                            </div>


                            {/* DATE + CATEGORY */}

                            <div className="form-row">

                                <div className="form-group">

                                    <label htmlFor="expense_date">
                                        Tanggal
                                    </label>

                                    <input
                                        id="expense_date"
                                        name="expense_date"
                                        type="date"
                                        value={
                                            form.expense_date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label htmlFor="category">
                                        Kategori
                                    </label>

                                    <select
                                        id="category"
                                        name="category"
                                        value={
                                            form.category
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Pilih kategori
                                        </option>

                                        <option value="bibit">
                                            Bibit
                                        </option>

                                        <option value="pupuk">
                                            Pupuk
                                        </option>

                                        <option value="pestisida">
                                            Pestisida
                                        </option>

                                        <option value="tenaga_kerja">
                                            Tenaga Kerja
                                        </option>

                                    </select>

                                </div>

                            </div>


                            {/* AMOUNT */}

                            <div className="form-group">

                                <label htmlFor="amount">
                                    Jumlah Pengeluaran
                                </label>

                                <input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    min="1"
                                    step="1"
                                    placeholder="Contoh: 150000"
                                    value={
                                        form.amount
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                                {form.amount && (
                                    <small className="form-hint">
                                        {
                                            formatRupiah(
                                                form.amount
                                            )
                                        }
                                    </small>
                                )}

                            </div>


                            {/* DESCRIPTION */}

                            <div className="form-group">

                                <label htmlFor="description">
                                    Deskripsi
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    rows="3"
                                    placeholder="Contoh: Pembelian pupuk NPK 50 kg..."
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            {/* NOTES */}

                            <div className="form-group">

                                <label htmlFor="notes">
                                    Catatan
                                </label>

                                <textarea
                                    id="notes"
                                    name="notes"
                                    rows="3"
                                    placeholder="Catatan tambahan..."
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
                                        : editingExpense
                                            ? 'Simpan Perubahan'
                                            : 'Tambah Pengeluaran'}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};

export default Expenses;