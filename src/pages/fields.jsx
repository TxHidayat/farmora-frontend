import { useEffect, useState } from 'react';

import api from '../services/api';
import Sidebar from '../components/Sidebar';


const Fields = () => {

    const [fields, setFields] = useState([]);
    const [farms, setFarms] = useState([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingField, setEditingField] = useState(null);

    const [form, setForm] = useState({
        farm_id: '',
        name: '',
        area: '',
        area_unit: 'm2',
        soil_type: '',
        location: '',
        description: '',
    });


    // =========================================
    // FETCH DATA
    // =========================================

    const fetchData = async () => {

        try {

            setLoading(true);
            setError('');

            const [
                fieldsResponse,
                farmsResponse
            ] = await Promise.all([

                api.get('/fields'),

                api.get('/farms'),

            ]);


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
                'Fetch fields error:',
                error
            );

            setError(
                error.response?.data?.message ||
                'Gagal mengambil data lahan.'
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
            farm_id: '',
            name: '',
            area: '',
            area_unit: 'm2',
            soil_type: '',
            location: '',
            description: '',
        });

        setEditingField(null);

    };


    // =========================================
    // CREATE MODAL
    // =========================================

    const openCreateModal = () => {

        resetForm();

        setShowModal(true);

        setError('');

        setSuccess('');

    };


    // =========================================
    // EDIT MODAL
    // =========================================

    const openEditModal = (field) => {

        setEditingField(field);

        setForm({

            farm_id:
                field.farm_id || '',

            name:
                field.name || '',

            area:
                field.area || '',

            area_unit:
                field.area_unit || 'm2',

            soil_type:
                field.soil_type || '',

            location:
                field.location || '',

            description:
                field.description ||
                field.notes ||
                '',

        });


        setShowModal(true);

        setError('');

        setSuccess('');

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

            if (!form.farm_id) {

                throw new Error(
                    'Silakan pilih kebun terlebih dahulu.'
                );

            }


            if (!form.name.trim()) {

                throw new Error(
                    'Nama lahan wajib diisi.'
                );

            }


            if (
                form.area === '' ||
                Number(form.area) <= 0
            ) {

                throw new Error(
                    'Luas lahan harus lebih dari 0.'
                );

            }


            const payload = {

                farm_id:
                    Number(form.farm_id),

                name:
                    form.name.trim(),

                area:
                    Number(form.area),

                area_unit:
                    form.area_unit,

                soil_type:
                    form.soil_type.trim(),

                location:
                    form.location.trim(),

                description:
                    form.description.trim(),

            };


            let response;


            if (editingField) {

                response = await api.put(

                    `/fields/${editingField.id}`,

                    payload

                );

            } else {

                response = await api.post(

                    '/fields',

                    payload

                );

            }


            if (!response.data.success) {

                throw new Error(

                    response.data.message ||

                    'Gagal menyimpan data lahan.'

                );

            }


            setShowModal(false);

            resetForm();


            setSuccess(

                editingField

                    ? 'Lahan berhasil diperbarui.'

                    : 'Lahan berhasil ditambahkan.'

            );


            await fetchData();


        } catch (error) {

            console.error(
                'Save field error:',
                error
            );


            setError(

                error.response?.data?.message ||

                error.message ||

                'Gagal menyimpan data lahan.'

            );

        } finally {

            setSubmitting(false);

        }

    };


    // =========================================
    // DELETE
    // =========================================

    const handleDelete = async (field) => {

        const confirmed =
            window.confirm(

                `Hapus lahan "${field.name}"?\n\nData crop cycle yang berhubungan dengan lahan ini dapat ikut terhapus.`

            );


        if (!confirmed) {
            return;
        }


        try {

            setError('');

            setSuccess('');


            const response = await api.delete(

                `/fields/${field.id}`

            );


            if (!response.data.success) {

                throw new Error(

                    response.data.message ||

                    'Gagal menghapus lahan.'

                );

            }


            setSuccess(
                'Lahan berhasil dihapus.'
            );


            await fetchData();


        } catch (error) {

            console.error(
                'Delete field error:',
                error
            );


            setError(

                error.response?.data?.message ||

                error.message ||

                'Gagal menghapus lahan.'

            );

        }

    };


    // =========================================
    // HELPER
    // =========================================

    const getFarmName = (farmId) => {

        const farm = farms.find(

            (item) =>

                Number(item.id) ===
                Number(farmId)

        );


        return (
            farm?.name ||
            'Kebun tidak ditemukan'
        );

    };


    const formatArea = (area, unit) => {

        if (
            area === null ||
            area === undefined ||
            area === ''
        ) {

            return '-';

        }


        return `${area} ${unit || 'm2'}`;

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
                    Memuat data lahan...
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
                activePage="fields"
            />


            {/* =================================
                MAIN CONTENT
            ================================= */}

            <main className="dashboard-main">


                {/* =================================
                    HEADER
                ================================= */}

                <header className="dashboard-header">

                    <div>

                        <span className="header-label">
                            FIELD MANAGEMENT
                        </span>

                        <h1>
                            Lahan
                        </h1>

                        <p>
                            Kelola seluruh lahan
                            yang berada di dalam
                            kebunmu.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="primary-button"
                        onClick={openCreateModal}
                    >
                        + Tambah Lahan
                    </button>

                </header>


                {/* =================================
                    ALERT ERROR
                ================================= */}

                {error && (

                    <div className="alert alert-error">

                        {error}

                    </div>

                )}


                {/* =================================
                    ALERT SUCCESS
                ================================= */}

                {success && (

                    <div className="alert alert-success">

                        {success}

                    </div>

                )}


                {/* =================================
                    SUMMARY
                ================================= */}

                <section className="stats-grid">


                    {/* TOTAL LAHAN */}

                    <div className="stat-card">

                        <div className="stat-icon field">
                            □
                        </div>

                        <div>

                            <span>
                                Total Lahan
                            </span>

                            <strong>
                                {fields.length}
                            </strong>

                        </div>

                    </div>


                    {/* TOTAL KEBUN */}

                    <div className="stat-card">

                        <div className="stat-icon farm">
                            🌾
                        </div>

                        <div>

                            <span>
                                Total Kebun
                            </span>

                            <strong>
                                {farms.length}
                            </strong>

                        </div>

                    </div>


                </section>


                {/* =================================
                    FIELD LIST HEADER
                ================================= */}

                <section className="section-heading">

                    <div>

                        <span>
                            FIELD LIST
                        </span>

                        <h2>
                            Daftar Lahan
                        </h2>

                    </div>

                </section>


                {/* =================================
                    EMPTY STATE
                ================================= */}

                {fields.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            □
                        </div>

                        <h3>
                            Belum ada lahan
                        </h3>

                        <p>
                            Tambahkan lahan pertama
                            untuk mulai mengelola
                            tanamanmu.
                        </p>

                        <button
                            type="button"
                            className="primary-button"
                            onClick={
                                openCreateModal
                            }
                        >
                            + Tambah Lahan
                        </button>

                    </div>

                ) : (


                    /* =================================
                        FIELD CARDS
                    ================================= */

                    <div className="farm-grid">

                        {fields.map(
                            (field) => (

                                <div
                                    className="farm-card"
                                    key={field.id}
                                >


                                    {/* TOP */}

                                    <div className="farm-card-top">

                                        <div className="farm-icon">
                                            □
                                        </div>


                                        <div className="farm-actions">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openEditModal(
                                                        field
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
                                                        field
                                                    )
                                                }
                                            >
                                                Hapus
                                            </button>

                                        </div>

                                    </div>


                                    {/* NAME */}

                                    <h3>
                                        {field.name}
                                    </h3>


                                    {/* FARM */}

                                    <span className="farm-location">

                                        {getFarmName(
                                            field.farm_id
                                        )}

                                    </span>


                                    {/* DETAILS */}

                                    <div className="farm-details">


                                        {/* AREA */}

                                        <div>

                                            <span>
                                                Luas
                                            </span>

                                            <strong>

                                                {formatArea(
                                                    field.area,
                                                    field.area_unit
                                                )}

                                            </strong>

                                        </div>


                                        {/* SOIL */}

                                        <div>

                                            <span>
                                                Jenis Tanah
                                            </span>

                                            <strong>

                                                {field.soil_type ||
                                                    '-'}

                                            </strong>

                                        </div>


                                        {/* LOCATION */}

                                        <div>

                                            <span>
                                                Lokasi
                                            </span>

                                            <strong>

                                                {field.location ||
                                                    '-'}

                                            </strong>

                                        </div>


                                    </div>


                                    {/* DESCRIPTION */}

                                    {(field.description ||
                                        field.notes) && (

                                            <p className="farm-description">

                                                {
                                                    field.description ||
                                                    field.notes
                                                }

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
                    onMouseDown={closeModal}
                >

                    <div
                        className="modal"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >


                        {/* MODAL HEADER */}

                        <div className="modal-header">

                            <div>

                                <span>
                                    FIELD MANAGEMENT
                                </span>

                                <h2>

                                    {editingField
                                        ? 'Edit Lahan'
                                        : 'Tambah Lahan'}

                                </h2>

                            </div>


                            <button
                                type="button"
                                className="modal-close"
                                onClick={closeModal}
                                disabled={submitting}
                            >
                                ×
                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            className="modal-form"
                            onSubmit={handleSubmit}
                        >


                            {/* KEBUN */}

                            <div className="form-group">

                                <label htmlFor="farm_id">
                                    Kebun
                                </label>


                                <select
                                    id="farm_id"
                                    name="farm_id"
                                    value={form.farm_id}
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Pilih kebun
                                    </option>


                                    {farms.map(
                                        (farm) => (

                                            <option
                                                key={
                                                    farm.id
                                                }
                                                value={
                                                    farm.id
                                                }
                                            >

                                                {farm.name}

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* NAMA LAHAN */}

                            <div className="form-group">

                                <label htmlFor="name">
                                    Nama Lahan
                                </label>


                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Contoh: Lahan Cabai Utama"
                                    value={form.name}
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>


                            {/* AREA + UNIT */}

                            <div className="form-row">


                                {/* AREA */}

                                <div className="form-group">

                                    <label htmlFor="area">
                                        Luas Lahan
                                    </label>


                                    <input
                                        id="area"
                                        name="area"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Contoh: 500"
                                        value={form.area}
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                {/* UNIT */}

                                <div className="form-group">

                                    <label htmlFor="area_unit">
                                        Satuan
                                    </label>


                                    <select
                                        id="area_unit"
                                        name="area_unit"
                                        value={
                                            form.area_unit
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >

                                        <option value="m2">
                                            Meter persegi (m²)
                                        </option>

                                        <option value="ha">
                                            Hektare (ha)
                                        </option>

                                    </select>

                                </div>

                            </div>


                            {/* SOIL TYPE */}

                            <div className="form-group">

                                <label htmlFor="soil_type">
                                    Jenis Tanah
                                </label>


                                <input
                                    id="soil_type"
                                    name="soil_type"
                                    type="text"
                                    placeholder="Contoh: Lempung"
                                    value={
                                        form.soil_type
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            {/* LOCATION */}

                            <div className="form-group">

                                <label htmlFor="location">
                                    Lokasi
                                </label>


                                <input
                                    id="location"
                                    name="location"
                                    type="text"
                                    placeholder="Contoh: Blok Timur"
                                    value={
                                        form.location
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div className="form-group">

                                <label htmlFor="description">
                                    Deskripsi
                                </label>


                                <textarea
                                    id="description"
                                    name="description"
                                    rows="4"
                                    placeholder="Keterangan tambahan mengenai lahan..."
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            {/* ACTIONS */}

                            <div className="modal-actions">


                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={closeModal}
                                    disabled={submitting}
                                >
                                    Batal
                                </button>


                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={submitting}
                                >

                                    {submitting

                                        ? 'Menyimpan...'

                                        : editingField

                                            ? 'Simpan Perubahan'

                                            : 'Tambah Lahan'

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


export default Fields;