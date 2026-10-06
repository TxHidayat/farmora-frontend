import { useEffect, useState } from 'react';

import {
    MapContainer,
    Marker,
    TileLayer,
    useMap,
    useMapEvents,
} from 'react-leaflet';

import L from 'leaflet';

import api from '../services/api';

import Sidebar from '../components/Sidebar';

import 'leaflet/dist/leaflet.css';


// ============================================================
// LEAFLET MARKER
// ============================================================

const markerIcon = new L.Icon({
    iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',

    iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',

    shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',

    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});


// ============================================================
// MAP CLICK HANDLER
// ============================================================

const LocationPicker = ({ onSelect }) => {

    useMapEvents({
        click(event) {
            onSelect(
                event.latlng.lat,
                event.latlng.lng
            );
        },
    });

    return null;
};


// ============================================================
// MAP CENTER
// ============================================================

const MapCenter = ({ position }) => {

    const map = useMap();

    useEffect(() => {

        if (!position) {
            return;
        }

        map.setView(
            position,
            Math.max(map.getZoom(), 15)
        );

    }, [map, position]);

    return null;
};


// ============================================================
// DEFAULT MAP LOCATION
// ============================================================

const DEFAULT_POSITION = [
    -6.5944,
    110.6674,
];


const Farms = () => {
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [editingFarm, setEditingFarm] = useState(null);
    const [locating, setLocating] = useState(false);

    const [form, setForm] = useState({
        name: '',
        location: '',
        latitude: '',
        longitude: '',
        description: '',
    });

    // =========================================
    // FETCH FARMS
    // =========================================

    useEffect(() => {
        fetchFarms();
    }, []);

    const fetchFarms = async () => {
        try {
            setLoading(true);
            setError('');

            // Delay sementara agar loading screen terlihat saat testing
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const response = await api.get('/farms');

            if (response.data.success) {
                setFarms(response.data.data || []);
            }

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                'Gagal mengambil data kebun.'
            );

        } finally {
            setLoading(false);
        }
    };


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
    // CREATE
    // =========================================

    const openCreateForm = () => {
        setEditingFarm(null);

        setForm({
            name: '',
            location: '',
            latitude: '',
            longitude: '',
            description: '',
        });

        setError('');
        setSuccess('');
        setShowMap(false);
        setShowForm(true);
    };


    // =========================================
    // EDIT
    // =========================================

    const openEditForm = (farm) => {
        setEditingFarm(farm);

        setForm({
            name: farm.name || '',
            location: farm.location || '',
            latitude:
                farm.latitude !== null &&
                    farm.latitude !== undefined
                    ? String(farm.latitude)
                    : '',
            longitude:
                farm.longitude !== null &&
                    farm.longitude !== undefined
                    ? String(farm.longitude)
                    : '',
            description: farm.description || '',
        });

        setError('');
        setSuccess('');
        setShowMap(false);
        setShowForm(true);
    };


    // =========================================
    // CLOSE FORM
    // =========================================

    const closeForm = () => {
        if (saving) return;

        setShowForm(false);
        setShowMap(false);
        setEditingFarm(null);
    };


    // =========================================
    // SELECT LOCATION FROM MAP
    // =========================================

    const selectLocation = (
        latitude,
        longitude
    ) => {

        setForm((previous) => ({

            ...previous,

            latitude:
                Number(latitude).toFixed(7),

            longitude:
                Number(longitude).toFixed(7),

        }));

    };


    // =========================================
    // USE CURRENT DEVICE LOCATION
    // =========================================

    const useCurrentLocation = () => {

        if (!navigator.geolocation) {

            setError(
                'Browser tidak mendukung lokasi perangkat.'
            );

            return;

        }

        setLocating(true);
        setError('');

        navigator.geolocation.getCurrentPosition(

            (position) => {

                selectLocation(
                    position.coords.latitude,
                    position.coords.longitude
                );

                setShowMap(true);
                setLocating(false);

            },

            (locationError) => {

                console.error(
                    'Location error:',
                    locationError
                );

                setLocating(false);

                setError(
                    'Lokasi perangkat tidak dapat diambil. Pastikan izin lokasi browser diberikan.'
                );

            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }

        );

    };


    // =========================================
    // VALIDATE COORDINATES
    // =========================================

    const validateCoordinates = () => {
        const latitude =
            form.latitude === ''
                ? null
                : Number(form.latitude);

        const longitude =
            form.longitude === ''
                ? null
                : Number(form.longitude);


        // Latitude
        if (
            latitude !== null &&
            (
                Number.isNaN(latitude) ||
                latitude < -90 ||
                latitude > 90
            )
        ) {
            setError(
                'Latitude harus berada antara -90 dan 90.'
            );

            return false;
        }


        // Longitude
        if (
            longitude !== null &&
            (
                Number.isNaN(longitude) ||
                longitude < -180 ||
                longitude > 180
            )
        ) {
            setError(
                'Longitude harus berada antara -180 dan 180.'
            );

            return false;
        }

        return true;
    };


    // =========================================
    // SUBMIT
    // =========================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError('');
        setSuccess('');

        // Validasi koordinat
        if (!validateCoordinates()) {
            return;
        }

        setSaving(true);

        try {
            const payload = {
                name: form.name,
                location: form.location,
                latitude:
                    form.latitude === ''
                        ? null
                        : Number(
                            Number(form.latitude).toFixed(7)
                        ),
                longitude:
                    form.longitude === ''
                        ? null
                        : Number(
                            Number(form.longitude).toFixed(7)
                        ),
                description: form.description,
            };


            // UPDATE
            if (editingFarm) {
                const response = await api.put(
                    `/farms/${editingFarm.id}`,
                    payload
                );

                if (response.data.success) {
                    setSuccess(
                        'Data kebun berhasil diperbarui.'
                    );
                }

                // CREATE
            } else {
                const response = await api.post(
                    '/farms',
                    payload
                );

                if (response.data.success) {
                    setSuccess(
                        'Kebun berhasil ditambahkan.'
                    );
                }
            }


            // Tutup form
            setShowForm(false);
            setShowMap(false);
            setEditingFarm(null);

            setForm({
                name: '',
                location: '',
                latitude: '',
                longitude: '',
                description: '',
            });


            // Refresh data
            await fetchFarms();

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                'Gagal menyimpan data kebun.'
            );

        } finally {
            setSaving(false);
        }
    };


    // =========================================
    // DELETE
    // =========================================

    const handleDelete = async (farm) => {
        const confirmed = window.confirm(
            `Hapus kebun "${farm.name}"?\n\nData yang memiliki hubungan dengan kebun ini dapat ikut terhapus.`
        );

        if (!confirmed) return;

        try {
            setError('');
            setSuccess('');

            const response = await api.delete(
                `/farms/${farm.id}`
            );

            if (response.data.success) {
                setSuccess(
                    'Kebun berhasil dihapus.'
                );

                await fetchFarms();
            }

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                'Gagal menghapus kebun.'
            );
        }
    };


    // =========================================
    // FORMAT COORDINATE
    // =========================================

    const formatCoordinate = (value) => {
        if (
            value === null ||
            value === undefined ||
            value === ''
        ) {
            return '-';
        }

        return Number(value).toFixed(6);
    };


    // =========================================
    // MAP POSITION
    // =========================================

    const selectedPosition =
        form.latitude !== '' &&
            form.longitude !== ''
            ? [
                Number(form.latitude),
                Number(form.longitude),
            ]
            : DEFAULT_POSITION;


    // =========================================
    // RENDER LOADING SCREEN
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
                    Memuat data kebun...
                </p>
            </div>
        );
    }


    // =========================================
    // RENDER MAIN CONTENT
    // =========================================

    return (
        <div className="dashboard-layout">

            {/* =================================
                SIDEBAR
            ================================= */}

            <Sidebar activePage="farms" />


            {/* =================================
                MAIN
            ================================= */}

            <main className="dashboard-main">

                {/* HEADER */}

                <header className="page-header">

                    <div>

                        <span className="header-label">
                            FARM MANAGEMENT
                        </span>

                        <h1>
                            Kebun
                        </h1>

                        <p>
                            Kelola data kebun yang kamu miliki.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="primary-button"
                        onClick={openCreateForm}
                    >
                        + Tambah Kebun
                    </button>

                </header>


                {/* ALERT ERROR */}

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}


                {/* ALERT SUCCESS */}

                {success && (
                    <div className="alert alert-success">
                        {success}
                    </div>
                )}


                {/* CONTENT */}

                <section className="farm-content">

                    {/* SUMMARY */}

                    <div className="farm-summary">

                        <div>

                            <span>
                                TOTAL KEBUN
                            </span>

                            <strong>
                                {farms.length}
                            </strong>

                        </div>


                        <div>

                            <span>
                                STATUS
                            </span>

                            <strong className="status-active">
                                Aktif
                            </strong>

                        </div>

                    </div>


                    {/* LIST OR EMPTY STATE */}

                    {farms.length === 0 ? (

                        <div className="empty-panel">

                            <div className="empty-icon">
                                🌱
                            </div>

                            <h2>
                                Belum ada kebun
                            </h2>

                            <p>
                                Tambahkan kebun pertama
                                untuk mulai mengelola FARMORA.
                            </p>

                            <button
                                type="button"
                                className="primary-button"
                                onClick={openCreateForm}
                            >
                                + Tambah Kebun
                            </button>

                        </div>

                    ) : (

                        <div className="farm-grid">

                            {farms.map((farm) => (

                                <div
                                    className="farm-card"
                                    key={farm.id}
                                >

                                    <div className="farm-card-top">

                                        <div className="farm-card-icon">
                                            🌾
                                        </div>

                                        <div className="farm-actions">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openEditForm(farm)
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="danger-text"
                                                onClick={() =>
                                                    handleDelete(farm)
                                                }
                                            >
                                                Hapus
                                            </button>

                                        </div>

                                    </div>


                                    <h2>
                                        {farm.name}
                                    </h2>


                                    {/* LOKASI */}

                                    <div className="farm-location">

                                        <span>
                                            ⌖
                                        </span>

                                        <span>
                                            {farm.location ||
                                                'Lokasi belum diisi'}
                                        </span>

                                    </div>


                                    {/* KOORDINAT */}

                                    {(farm.latitude !== null &&
                                        farm.latitude !== undefined) ||
                                        (farm.longitude !== null &&
                                            farm.longitude !== undefined) ? (

                                        <div className="farm-coordinates">

                                            <div>
                                                <span>Latitude</span>
                                                <strong>
                                                    {formatCoordinate(farm.latitude)}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Longitude</span>
                                                <strong>
                                                    {formatCoordinate(farm.longitude)}
                                                </strong>
                                            </div>

                                        </div>

                                    ) : (

                                        <div className="farm-no-coordinates">
                                            Koordinat belum diatur
                                        </div>

                                    )}


                                    {/* DESKRIPSI */}

                                    {farm.description && (
                                        <p className="farm-description">
                                            {farm.description}
                                        </p>
                                    )}


                                    {/* FOOTER */}

                                    <div className="farm-card-footer">

                                        <span>
                                            Farm ID
                                        </span>

                                        <strong>
                                            #{farm.id}
                                        </strong>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

            </main>


            {/* =================================
                MODAL
            ================================= */}

            {showForm && (

                <div className="modal-overlay">

                    <div className="modal">

                        <div className="modal-header">

                            <div>

                                <span>
                                    FARM MANAGEMENT
                                </span>

                                <h2>
                                    {editingFarm
                                        ? 'Edit Kebun'
                                        : 'Tambah Kebun'}
                                </h2>

                            </div>


                            <button
                                type="button"
                                className="modal-close"
                                onClick={closeForm}
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>


                        <form onSubmit={handleSubmit}>

                            {/* NAMA */}

                            <div className="form-group">

                                <label htmlFor="name">
                                    Nama Kebun
                                </label>

                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="Contoh: Kebun Cabai Utama"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            {/* LOKASI */}

                            <div className="form-group">

                                <label htmlFor="location">
                                    Lokasi
                                </label>

                                <input
                                    id="location"
                                    type="text"
                                    name="location"
                                    placeholder="Contoh: Pangkep, Sulawesi Selatan"
                                    value={form.location}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* LOKASI GPS */}

                            <div className="form-group">

                                <label>
                                    Lokasi GPS
                                </label>

                                <div className="location-picker-actions">

                                    <button
                                        type="button"
                                        className="secondary-button location-picker-button"
                                        onClick={() =>
                                            setShowMap((previous) => !previous)
                                        }
                                    >
                                        📍 Pilih Lokasi di Peta
                                    </button>

                                    <button
                                        type="button"
                                        className="secondary-button location-current-button"
                                        onClick={useCurrentLocation}
                                        disabled={locating}
                                    >
                                        {locating
                                            ? 'Mengambil lokasi...'
                                            : '⌖ Gunakan Lokasi Saya'}
                                    </button>

                                </div>

                                <small>
                                    Klik titik kebun pada peta atau gunakan lokasi perangkat.
                                </small>

                                {showMap && (
                                    <div className="farm-map-wrapper">

                                        <MapContainer
                                            center={selectedPosition}
                                            zoom={15}
                                            scrollWheelZoom={true}
                                            className="farm-location-map"
                                        >
                                            <TileLayer
                                                attribution="&copy; OpenStreetMap contributors"
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />

                                            <LocationPicker
                                                onSelect={selectLocation}
                                            />

                                            <MapCenter
                                                position={selectedPosition}
                                            />

                                            {form.latitude !== '' &&
                                                form.longitude !== '' && (
                                                    <Marker
                                                        position={selectedPosition}
                                                        icon={markerIcon}
                                                    />
                                                )}
                                        </MapContainer>

                                        <div className="map-hint">
                                            Klik pada peta untuk menentukan titik kebun.
                                        </div>

                                    </div>
                                )}

                                <div className="farm-coordinates form-coordinates">

                                    <div>
                                        <span>Latitude</span>
                                        <strong>
                                            {form.latitude || '-'}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Longitude</span>
                                        <strong>
                                            {form.longitude || '-'}
                                        </strong>
                                    </div>

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
                                    placeholder="Deskripsi singkat tentang kebun..."
                                    value={form.description}
                                    onChange={handleChange}
                                    rows="4"
                                />

                            </div>


                            {/* ACTION */}

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Batal
                                </button>


                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? 'Menyimpan...'
                                        : editingFarm
                                            ? 'Simpan Perubahan'
                                            : 'Tambah Kebun'}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};

export default Farms;