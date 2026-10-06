import { useEffect, useState } from 'react';

import api from '../services/api';
import Sidebar from '../components/Sidebar';


const CropCycles = () => {

    const [crops, setCrops] = useState([]);
    const [fields, setFields] = useState([]);
    const [farms, setFarms] = useState([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingCrop, setEditingCrop] = useState(null);

    const [form, setForm] = useState({
        field_id: '',
        crop_name: '',
        variety: '',
        planting_date: '',
        plant_count: '',
        status: 'tumbuh',
        estimated_harvest_date: '',
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
                cropsResponse,
                fieldsResponse,
                farmsResponse
            ] = await Promise.all([

                api.get('/crop-cycles'),

                api.get('/fields'),

                api.get('/farms'),

            ]);


            if (cropsResponse.data.success) {

                setCrops(
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
                'Fetch crop cycles error:',
                error
            );

            setError(
                error.response?.data?.message ||
                'Gagal mengambil data tanaman.'
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
            value
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

            field_id: '',

            crop_name: '',

            variety: '',

            planting_date: '',

            plant_count: '',

            status: 'tumbuh',

            estimated_harvest_date: '',

            notes: '',

        });


        setEditingCrop(null);

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

    const openEditModal = (crop) => {

        setEditingCrop(crop);


        setForm({

            field_id:
                crop.field_id || '',

            crop_name:
                crop.crop_name || '',

            variety:
                crop.variety || '',

            planting_date:
                crop.planting_date || '',

            plant_count:
                crop.plant_count || '',

            status:
                crop.status || 'tumbuh',

            estimated_harvest_date:
                crop.estimated_harvest_date || '',

            notes:
                crop.notes || '',

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

            if (!form.field_id) {

                throw new Error(
                    'Silakan pilih lahan terlebih dahulu.'
                );

            }


            if (!form.crop_name.trim()) {

                throw new Error(
                    'Nama tanaman wajib diisi.'
                );

            }


            if (!form.planting_date) {

                throw new Error(
                    'Tanggal tanam wajib diisi.'
                );

            }


            if (
                form.plant_count === '' ||
                Number(form.plant_count) <= 0
            ) {

                throw new Error(
                    'Jumlah tanaman harus lebih dari 0.'
                );

            }


            if (
                form.estimated_harvest_date &&
                form.estimated_harvest_date <
                form.planting_date
            ) {

                throw new Error(
                    'Estimasi panen tidak boleh sebelum tanggal tanam.'
                );

            }


            const payload = {

                field_id:
                    Number(form.field_id),

                crop_name:
                    form.crop_name.trim(),

                variety:
                    form.variety.trim(),

                planting_date:
                    form.planting_date,

                plant_count:
                    Number(form.plant_count),

                status:
                    form.status,

                estimated_harvest_date:
                    form.estimated_harvest_date ||
                    null,

                notes:
                    form.notes.trim(),

            };


            let response;


            if (editingCrop) {

                response = await api.put(

                    `/crop-cycles/${editingCrop.id}`,

                    payload

                );

            } else {

                response = await api.post(

                    '/crop-cycles',

                    payload

                );

            }


            if (!response.data.success) {

                throw new Error(

                    response.data.message ||

                    'Gagal menyimpan data tanaman.'

                );

            }


            setShowModal(false);

            resetForm();


            setSuccess(

                editingCrop

                    ? 'Data tanaman berhasil diperbarui.'

                    : 'Data tanaman berhasil ditambahkan.'

            );


            await fetchData();


        } catch (error) {

            console.error(
                'Save crop cycle error:',
                error
            );


            setError(

                error.response?.data?.message ||

                error.message ||

                'Gagal menyimpan data tanaman.'

            );

        } finally {

            setSubmitting(false);

        }

    };


    // =========================================
    // DELETE
    // =========================================

    const handleDelete = async (crop) => {

        const confirmed =
            window.confirm(

                `Hapus tanaman "${crop.crop_name}"?\n\nData aktivitas, panen, atau pengeluaran yang memiliki hubungan dengan siklus ini dapat ikut terpengaruh.`

            );


        if (!confirmed) {
            return;
        }


        try {

            setError('');

            setSuccess('');


            const response =
                await api.delete(

                    `/crop-cycles/${crop.id}`

                );


            if (!response.data.success) {

                throw new Error(

                    response.data.message ||

                    'Gagal menghapus tanaman.'

                );

            }


            setSuccess(
                'Data tanaman berhasil dihapus.'
            );


            await fetchData();


        } catch (error) {

            console.error(
                'Delete crop cycle error:',
                error
            );


            setError(

                error.response?.data?.message ||

                error.message ||

                'Gagal menghapus data tanaman.'

            );

        }

    };


    // =========================================
    // HELPER
    // =========================================

    const getField = (fieldId) => {

        return fields.find(

            (field) =>

                Number(field.id) ===
                Number(fieldId)

        );

    };


    const getFieldName = (fieldId) => {

        const field =
            getField(fieldId);


        return (

            field?.name ||

            'Lahan tidak ditemukan'

        );

    };


    const getFarmName = (fieldId) => {

        const field =
            getField(fieldId);


        if (!field) {
            return '-';
        }


        const farm =
            farms.find(

                (item) =>

                    Number(item.id) ===
                    Number(field.farm_id)

            );


        return (
            farm?.name ||
            'Kebun tidak ditemukan'
        );

    };


    const getStatusLabel = (status) => {

        const labels = {

            persiapan:
                'Persiapan',

            tumbuh:
                'Tumbuh',

            panen:
                'Siap Panen',

            selesai:
                'Selesai',

        };


        return (

            labels[status] ||

            status ||

            '-'

        );

    };


    const getStatusClass = (status) => {

        const classes = {

            persiapan:
                'status-preparation',

            tumbuh:
                'status-growing',

            panen:
                'status-harvest',

            selesai:
                'status-completed',

        };


        return (

            classes[status] ||

            'status-default'

        );

    };


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
                    Memuat data tanaman...
                </p>

            </div>

        );

    }


    // =========================================
    // RENDER
    // =========================================

    return (

        <div className="dashboard-layout">


            {/* =================================
                SIDEBAR
            ================================= */}

            <Sidebar
                activePage="crop-cycles"
            />


            {/* =================================
                MAIN
            ================================= */}

            <main className="dashboard-main">


                {/* =================================
                    HEADER
                ================================= */}

                <header className="dashboard-header">

                    <div>

                        <span className="header-label">
                            CROP MANAGEMENT
                        </span>

                        <h1>
                            Tanaman
                        </h1>

                        <p>
                            Kelola siklus tanaman,
                            varietas, jumlah tanaman,
                            dan estimasi panen.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="primary-button"
                        onClick={
                            openCreateModal
                        }
                    >
                        + Tambah Tanaman
                    </button>

                </header>


                {/* =================================
                    ALERT
                ================================= */}

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


                {/* =================================
                    SUMMARY
                ================================= */}

                <section className="stats-grid">


                    {/* TOTAL */}

                    <div className="stat-card">

                        <div className="stat-icon crop">
                            🌱
                        </div>

                        <div>

                            <span>
                                Total Tanaman
                            </span>

                            <strong>
                                {crops.length}
                            </strong>

                        </div>

                    </div>


                    {/* TUMBUH */}

                    <div className="stat-card">

                        <div className="stat-icon activity">
                            ✓
                        </div>

                        <div>

                            <span>
                                Sedang Tumbuh
                            </span>

                            <strong>

                                {
                                    crops.filter(

                                        (crop) =>

                                            crop.status ===
                                            'tumbuh'

                                    ).length

                                }

                            </strong>

                        </div>

                    </div>


                    {/* PANEN */}

                    <div className="stat-card">

                        <div className="stat-icon farm">
                            ▣
                        </div>

                        <div>

                            <span>
                                Siap Panen
                            </span>

                            <strong>

                                {
                                    crops.filter(

                                        (crop) =>

                                            crop.status ===
                                            'panen'

                                    ).length

                                }

                            </strong>

                        </div>

                    </div>


                </section>


                {/* =================================
                    LIST HEADER
                ================================= */}

                <section className="section-heading">

                    <div>

                        <span>
                            CROP CYCLE
                        </span>

                        <h2>
                            Daftar Tanaman
                        </h2>

                    </div>

                </section>


                {/* =================================
                    EMPTY
                ================================= */}

                {crops.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            🌱
                        </div>

                        <h3>
                            Belum ada tanaman
                        </h3>

                        <p>
                            Tambahkan tanaman pertama
                            untuk mulai mencatat siklus
                            budidaya.
                        </p>

                        <button
                            type="button"
                            className="primary-button"
                            onClick={
                                openCreateModal
                            }
                        >
                            + Tambah Tanaman
                        </button>

                    </div>

                ) : (


                    /* =================================
                        CARDS
                    ================================= */

                    <div className="farm-grid">

                        {crops.map(
                            (crop) => (

                                <div
                                    className="farm-card"
                                    key={crop.id}
                                >


                                    {/* TOP */}

                                    <div className="farm-card-top">

                                        <div className="farm-icon">
                                            🌱
                                        </div>


                                        <div className="farm-actions">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openEditModal(
                                                        crop
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
                                                        crop
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
                                                {crop.crop_name}
                                            </h3>

                                            <span className="farm-location">

                                                {crop.variety ||
                                                    'Varietas tidak dicatat'}

                                            </span>

                                        </div>


                                        <span
                                            className={`crop-status ${getStatusClass(
                                                crop.status
                                            )}`}
                                        >

                                            {getStatusLabel(
                                                crop.status
                                            )}

                                        </span>

                                    </div>


                                    {/* FIELD */}

                                    <div className="crop-location-info">

                                        <strong>

                                            {getFieldName(
                                                crop.field_id
                                            )}

                                        </strong>

                                        <span>

                                            {getFarmName(
                                                crop.field_id
                                            )}

                                        </span>

                                    </div>


                                    {/* DETAILS */}

                                    <div className="farm-details">


                                        <div>

                                            <span>
                                                Tanggal Tanam
                                            </span>

                                            <strong>

                                                {
                                                    crop.planting_date ||
                                                    '-'
                                                }

                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Jumlah
                                            </span>

                                            <strong>

                                                {
                                                    crop.plant_count ||
                                                    0
                                                }{' '}

                                                tanaman

                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Estimasi Panen
                                            </span>

                                            <strong>

                                                {
                                                    crop.estimated_harvest_date ||
                                                    '-'
                                                }

                                            </strong>

                                        </div>

                                    </div>


                                    {/* NOTES */}

                                    {crop.notes && (

                                        <p className="farm-description">

                                            {crop.notes}

                                        </p>

                                    )}

                                </div>

                            )
                        )}

                    </div>

                )}


            </main>


            {/* =================================
                MODAL
            ================================= */}

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
                                    CROP CYCLE
                                </span>

                                <h2>

                                    {editingCrop

                                        ? 'Edit Tanaman'

                                        : 'Tambah Tanaman'

                                    }

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


                            {/* LAHAN */}

                            <div className="form-group">

                                <label htmlFor="field_id">
                                    Lahan
                                </label>


                                <select
                                    id="field_id"
                                    name="field_id"
                                    value={
                                        form.field_id
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Pilih lahan
                                    </option>


                                    {fields.map(
                                        (field) => (

                                            <option
                                                key={
                                                    field.id
                                                }
                                                value={
                                                    field.id
                                                }
                                            >

                                                {field.name}
                                                {' - '}
                                                {
                                                    getFarmName(
                                                        field.id
                                                    )
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* NAMA TANAMAN */}

                            <div className="form-group">

                                <label htmlFor="crop_name">
                                    Nama Tanaman
                                </label>


                                <input
                                    id="crop_name"
                                    name="crop_name"
                                    type="text"
                                    placeholder="Contoh: Cabai"
                                    value={
                                        form.crop_name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>


                            {/* VARIETAS */}

                            <div className="form-group">

                                <label htmlFor="variety">
                                    Varietas
                                </label>


                                <input
                                    id="variety"
                                    name="variety"
                                    type="text"
                                    placeholder="Contoh: Cabai Rawit"
                                    value={
                                        form.variety
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            {/* TANGGAL */}

                            <div className="form-row">


                                <div className="form-group">

                                    <label htmlFor="planting_date">
                                        Tanggal Tanam
                                    </label>


                                    <input
                                        id="planting_date"
                                        name="planting_date"
                                        type="date"
                                        value={
                                            form.planting_date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label htmlFor="estimated_harvest_date">
                                        Estimasi Panen
                                    </label>


                                    <input
                                        id="estimated_harvest_date"
                                        name="estimated_harvest_date"
                                        type="date"
                                        value={
                                            form.estimated_harvest_date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                            </div>


                            {/* JUMLAH */}

                            <div className="form-group">

                                <label htmlFor="plant_count">
                                    Jumlah Tanaman
                                </label>


                                <input
                                    id="plant_count"
                                    name="plant_count"
                                    type="number"
                                    min="1"
                                    step="1"
                                    placeholder="Contoh: 500"
                                    value={
                                        form.plant_count
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>


                            {/* STATUS */}

                            <div className="form-group">

                                <label htmlFor="status">
                                    Status
                                </label>


                                <select
                                    id="status"
                                    name="status"
                                    value={
                                        form.status
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >

                                    <option value="persiapan">
                                        Persiapan
                                    </option>

                                    <option value="tumbuh">
                                        Tumbuh
                                    </option>

                                    <option value="panen">
                                        Siap Panen
                                    </option>

                                    <option value="selesai">
                                        Selesai
                                    </option>

                                </select>

                            </div>


                            {/* CATATAN */}

                            <div className="form-group">

                                <label htmlFor="notes">
                                    Catatan
                                </label>


                                <textarea
                                    id="notes"
                                    name="notes"
                                    rows="4"
                                    placeholder="Catatan mengenai kondisi tanaman..."
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

                                        : editingCrop

                                            ? 'Simpan Perubahan'

                                            : 'Tambah Tanaman'

                                    }

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

};


export default CropCycles;