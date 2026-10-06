import { useEffect, useState } from 'react';

import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from 'recharts';

import api from '../services/api';
import Sidebar from '../components/Sidebar';


const Dashboard = () => {

    const [dashboard, setDashboard] = useState(null);

    const [cropCycles, setCropCycles] = useState([]);

    const [activities, setActivities] = useState([]);

    const [financeChart, setFinanceChart] = useState([]);

    const [weather, setWeather] = useState(null);

    const [alerts, setAlerts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState('');


    // =========================================
    // FETCH DASHBOARD
    // =========================================

    const fetchDashboard = async () => {

        try {

            setLoading(true);

            setError('');


            const [
                dashboardResponse,
                cropResponse,
                activityResponse,
                financeChartResponse,
                farmsResponse,
                alertsResponse,
            ] = await Promise.all([

                api.get('/dashboard'),

                api.get('/crop-cycles'),

                api.get('/activities'),

                api.get('/dashboard/finance-chart'),

                api.get('/farms'),

                api.get('/alerts'),

            ]);


            // ==============================
            // WEATHER
            // ==============================

            try {

                const farms = farmsResponse.data.success
                    ? farmsResponse.data.data || []
                    : [];


                const farmWithLocation = farms.find(
                    (farm) =>
                        farm.latitude !== null &&
                        farm.longitude !== null &&
                        farm.latitude !== undefined &&
                        farm.longitude !== undefined
                );


                if (farmWithLocation) {

                    const weatherResponse = await api.get(
                        `/weather?lat=${farmWithLocation.latitude}&lon=${farmWithLocation.longitude}`
                    );


                    if (weatherResponse.data.success) {

                        setWeather({
                            ...weatherResponse.data.data,
                            farm_name: farmWithLocation.name,
                        });

                    } else {

                        setWeather(null);

                    }

                } else {

                    setWeather(null);

                }

            } catch (weatherError) {

                console.error(
                    'Weather error:',
                    weatherError
                );

                setWeather(null);

            }


            // ==============================
            // DASHBOARD
            // ==============================

            if (dashboardResponse.data.success) {

                setDashboard(
                    dashboardResponse.data.data
                );

            }


            // ==============================
            // CROP CYCLES
            // ==============================

            if (cropResponse.data.success) {

                setCropCycles(
                    cropResponse.data.data || []
                );

            }


            // ==============================
            // ACTIVITIES
            // ==============================

            if (activityResponse.data.success) {

                setActivities(
                    activityResponse.data.data || []
                );

            }


            // ==============================
            // FINANCE CHART
            // ==============================

            if (financeChartResponse.data.success) {

                setFinanceChart(
                    financeChartResponse.data.data || []
                );

            }


            // ==============================
            // ALERTS
            // ==============================

            if (alertsResponse.data.success) {

                setAlerts(
                    alertsResponse.data.data?.alerts || []
                );

            } else {

                setAlerts([]);

            }


        } catch (error) {

            console.error(
                'Dashboard error:',
                error
            );


            setError(
                error.response?.data?.message ||
                'Gagal mengambil data dashboard.'
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchDashboard();

    }, []);


    // =========================================
    // FORMAT RUPIAH
    // =========================================

    const formatRupiah = (value) => {

        return new Intl.NumberFormat('id-ID', {

            style: 'currency',

            currency: 'IDR',

            maximumFractionDigits: 0,

        }).format(
            Number(value || 0)
        );

    };


    // =========================================
    // FORMAT CHART AXIS
    // =========================================

    const formatChartValue = (value) => {

        const number = Number(value || 0);


        if (number >= 1000000) {

            return `Rp ${(number / 1000000)
                .toFixed(1)} jt`;

        }


        if (number >= 1000) {

            return `Rp ${(number / 1000)
                .toFixed(0)} rb`;

        }


        return `Rp ${number}`;

    };


    // =========================================
    // FORMAT DATE
    // =========================================

    const formatDate = (date) => {

        if (!date) return '-';


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
    // LOADING
    // =========================================

    if (loading) {

        return (

            <div className="loading-screen">

                <div className="loading-logo">
                    <img src="/img/green1.png" alt="FARMORA" />
                </div>

                <p>
                    Memuat FARMORA...
                </p>

            </div>

        );

    }


    // =========================================
    // ERROR
    // =========================================

    if (error) {

        return (

            <div className="error-screen">

                <div className="error-box">

                    <h2>
                        Gagal memuat dashboard
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={fetchDashboard}
                    >
                        Coba Lagi
                    </button>

                </div>

            </div>

        );

    }


    // =========================================
    // ACTIVE CROPS
    // =========================================

    const activeCrops = cropCycles

        .filter(
            (crop) =>
                crop.status === 'tumbuh'
        )

        .slice(0, 5);


    // =========================================
    // RECENT ACTIVITIES
    // =========================================

    const recentActivities = [...activities]

        .sort(

            (a, b) =>

                new Date(
                    b.activity_date
                ) -

                new Date(
                    a.activity_date
                )

        )

        .slice(0, 5);


    // =========================================
    // WEATHER INTELLIGENCE
    // =========================================

    const getWeatherInsight = () => {

        if (!weather) {
            return null;
        }


        const temperature =
            Number(weather.temperature);

        const feelsLike =
            Number(weather.feels_like);

        const humidity =
            Number(weather.humidity);

        const weatherMain =
            String(
                weather.weather_main || ''
            ).toLowerCase();

        const weatherDescription =
            String(
                weather.weather || ''
            ).toLowerCase();


        // =====================================
        // HUJAN / GERIMIS / BADAI
        // =====================================

        if (

            weatherMain.includes('rain') ||
            weatherMain.includes('drizzle') ||
            weatherMain.includes('thunderstorm') ||
            weatherDescription.includes('hujan') ||
            weatherDescription.includes('gerimis') ||
            weatherDescription.includes('badai')

        ) {

            return {

                type: 'rain',

                title: 'Kondisi hujan',

                message:
                    'Pertimbangkan mengurangi penyiraman tambahan dan pantau kondisi lahan.',

            };

        }


        // =====================================
        // FEELS LIKE TINGGI
        // =====================================

        if (

            Number.isFinite(feelsLike) &&
            feelsLike >= 35

        ) {

            return {

                type: 'hot',

                title: 'Kondisi terasa panas',

                message:
                    `Suhu terasa seperti ${Math.round(feelsLike)}°C. Perhatikan kebutuhan air tanaman, terutama pada siang hari.`,

            };

        }


        // =====================================
        // SUHU AKTUAL TINGGI
        // =====================================

        if (

            Number.isFinite(temperature) &&
            temperature >= 33

        ) {

            return {

                type: 'hot',

                title: 'Suhu cukup tinggi',

                message:
                    `Suhu mencapai ${Math.round(temperature)}°C. Perhatikan kebutuhan air tanaman, terutama pada siang hari.`,

            };

        }


        // =====================================
        // KELEMBAPAN TINGGI
        // =====================================

        if (

            Number.isFinite(humidity) &&
            humidity >= 80

        ) {

            return {

                type: 'humid',

                title: 'Kelembapan cukup tinggi',

                message:
                    `Kelembapan mencapai ${Math.round(humidity)}%. Pantau sirkulasi udara dan kondisi daun.`,

            };

        }


        // =====================================
        // SUHU RENDAH
        // =====================================

        if (

            Number.isFinite(temperature) &&
            temperature <= 20

        ) {

            return {

                type: 'cold',

                title: 'Suhu relatif rendah',

                message:
                    `Suhu berada pada ${Math.round(temperature)}°C. Pantau kondisi tanaman terhadap suhu yang lebih rendah.`,

            };

        }


        // =====================================
        // NORMAL
        // =====================================

        return {

            type: 'normal',

            title: 'Kondisi cuaca relatif normal',

            message:
                'Tidak ada kondisi cuaca utama yang perlu diperhatikan saat ini.',

        };

    };


    const weatherInsight =
        getWeatherInsight();


    // =========================================
    // ALERT HELPERS
    // =========================================

    const getAlertIcon = (type) => {

        if (type === 'danger') {
            return '!';
        }

        if (type === 'warning') {
            return '!';
        }

        return 'i';

    };


    const getAlertClass = (type) => {

        if (type === 'danger') {
            return 'danger';
        }

        if (type === 'warning') {
            return 'warning';
        }

        return 'info';

    };


    // =========================================
    // DASHBOARD
    // =========================================

    return (

        <div className="dashboard-layout">


            {/* =================================
                SIDEBAR
            ================================= */}

            <Sidebar
                activePage="dashboard"
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
                            OVERVIEW
                        </span>

                        <h1>
                            Dashboard
                        </h1>

                        <p>
                            Pantau kondisi kebun dan
                            performa pertanianmu.
                        </p>

                    </div>


                    <div className="header-date">

                        <span>
                            FARMORA
                        </span>

                        <strong>

                            {new Date().toLocaleDateString(

                                'id-ID',

                                {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                }

                            )}

                        </strong>

                    </div>

                </header>


                {/* =================================
                    STATISTICS
                ================================= */}

                <section className="stats-grid">


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

                                {
                                    dashboard?.farms
                                        ?.total || 0
                                }

                            </strong>

                        </div>

                    </div>


                    {/* TOTAL LAHAN */}

                    <div className="stat-card">

                        <div className="stat-icon field">
                            ▦
                        </div>

                        <div>

                            <span>
                                Total Lahan
                            </span>

                            <strong>

                                {
                                    dashboard?.fields
                                        ?.total || 0
                                }

                            </strong>

                        </div>

                    </div>


                    {/* TOTAL TANAMAN */}

                    <div className="stat-card">

                        <div className="stat-icon crop">
                            🌱
                        </div>

                        <div>

                            <span>
                                Total Tanaman
                            </span>

                            <strong>

                                {
                                    dashboard?.crops
                                        ?.total || 0
                                }

                            </strong>

                        </div>

                    </div>


                    {/* TANAMAN AKTIF */}

                    <div className="stat-card">

                        <div className="stat-icon crop">
                            🌿
                        </div>

                        <div>

                            <span>
                                Tanaman Aktif
                            </span>

                            <strong>

                                {
                                    dashboard?.crops
                                        ?.active || 0
                                }

                            </strong>

                        </div>

                    </div>


                    {/* AKTIVITAS */}

                    <div className="stat-card">

                        <div className="stat-icon activity">
                            ✓
                        </div>

                        <div>

                            <span>
                                Aktivitas
                            </span>

                            <strong>

                                {
                                    dashboard?.activities
                                        ?.total || 0
                                }

                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================
                    FINANCIAL OVERVIEW
                ================================= */}

                <section className="section-heading">

                    <div>

                        <span>
                            FINANCIAL OVERVIEW
                        </span>

                        <h2>
                            Performa Keuangan
                        </h2>

                    </div>

                </section>


                <section className="finance-grid">


                    {/* PENDAPATAN */}

                    <div className="finance-card income">

                        <div className="finance-top">

                            <span>
                                Total Pendapatan
                            </span>

                            <div className="finance-icon">
                                ↑
                            </div>

                        </div>

                        <strong>

                            {formatRupiah(
                                dashboard?.harvest
                                    ?.total_income
                            )}

                        </strong>

                        <small>
                            Dari hasil panen
                        </small>

                    </div>


                    {/* PENGELUARAN */}

                    <div className="finance-card expense">

                        <div className="finance-top">

                            <span>
                                Total Pengeluaran
                            </span>

                            <div className="finance-icon">
                                ↓
                            </div>

                        </div>

                        <strong>

                            {formatRupiah(
                                dashboard?.finances
                                    ?.total_expenses
                            )}

                        </strong>

                        <small>
                            Biaya operasional
                        </small>

                    </div>


                    {/* KEUNTUNGAN */}

                    <div className="finance-card profit">

                        <div className="finance-top">

                            <span>
                                Estimasi Keuntungan
                            </span>

                            <div className="finance-icon">
                                ◆
                            </div>

                        </div>

                        <strong>

                            {formatRupiah(
                                dashboard?.finances
                                    ?.estimated_profit
                            )}

                        </strong>

                        <small>
                            Pendapatan dikurangi
                            pengeluaran
                        </small>

                    </div>

                </section>


                {/* =================================
                    WEATHER
                ================================= */}

                <section className="panel weather-panel">

                    <div className="panel-header">

                        <div>

                            <span>
                                FARM WEATHER
                            </span>

                            <h2>
                                Kondisi Cuaca
                            </h2>

                        </div>

                    </div>


                    {weather ? (

                        <div className="weather-content">

                            <div className="weather-main">

                                <div className="weather-icon">
                                    ☁️
                                </div>

                                <div>

                                    <strong>
                                        {Math.round(
                                            weather.temperature
                                        )}°C
                                    </strong>

                                    <span>
                                        {weather.weather}
                                    </span>

                                </div>

                            </div>


                            <div className="weather-location">

                                <strong>
                                    {weather.farm_name ||
                                        weather.location}
                                </strong>

                                <span>
                                    Lokasi kebun
                                </span>

                            </div>


                            <div className="weather-details">

                                <div>

                                    <span>
                                        Kelembapan
                                    </span>

                                    <strong>
                                        {weather.humidity}%
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Terasa seperti
                                    </span>

                                    <strong>
                                        {Math.round(
                                            weather.feels_like
                                        )}°C
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Angin
                                    </span>

                                    <strong>
                                        {weather.wind_speed} m/s
                                    </strong>

                                </div>

                            </div>


                            {weatherInsight && (

                                <div
                                    className={`weather-insight weather-insight-${weatherInsight.type}`}
                                >

                                    <div className="weather-insight-icon">

                                        {weatherInsight.type === 'rain'
                                            ? '☔'
                                            : weatherInsight.type === 'hot'
                                                ? '☀'
                                                : weatherInsight.type === 'humid'
                                                    ? '💧'
                                                    : weatherInsight.type === 'cold'
                                                        ? '❄'
                                                        : '✓'}

                                    </div>

                                    <div>

                                        <strong>
                                            {weatherInsight.title}
                                        </strong>

                                        <p>
                                            {weatherInsight.message}
                                        </p>

                                    </div>

                                </div>

                            )}

                        </div>

                    ) : (

                        <div className="weather-loading">

                            Data cuaca belum tersedia.

                        </div>

                    )}

                </section>


                {/* =================================
                    FARMORA ALERT
                ================================= */}

                <section className="panel alerts-panel">

                    <div className="panel-header">

                        <div>

                            <span>
                                FARMORA ALERT
                            </span>

                            <h2>
                                Peringatan
                            </h2>

                            <p>
                                Informasi kondisi tanaman yang perlu diperhatikan.
                            </p>

                        </div>

                        <div className="alerts-count">
                            {alerts.length}
                        </div>

                    </div>


                    {alerts.length === 0 ? (

                        <div className="alerts-empty">

                            <div className="alerts-empty-icon">
                                ✓
                            </div>

                            <div>

                                <strong>
                                    Tidak ada peringatan saat ini
                                </strong>

                                <span>
                                    Belum ada kondisi yang memerlukan perhatian.
                                </span>

                            </div>

                        </div>

                    ) : (

                        <div className="alerts-list">

                            {alerts.map((alert, index) => (

                                <div
                                    className={`alert-item ${getAlertClass(alert.type)}`}
                                    key={`${alert.type}-${alert.crop_name}-${index}`}
                                >

                                    <div className="alert-icon">
                                        {getAlertIcon(alert.type)}
                                    </div>

                                    <div className="alert-content">

                                        <strong>
                                            {alert.title}
                                        </strong>

                                        <p>
                                            {alert.message}
                                        </p>

                                        <small>
                                            {alert.farm_name || '-'}
                                            {' · '}
                                            {alert.field_name || '-'}
                                        </small>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>


                {/* =================================
                    FINANCE CHART
                ================================= */}

                <section className="panel finance-chart-panel">

                    <div className="panel-header">

                        <div>

                            <span>
                                FINANCIAL ANALYTICS
                            </span>

                            <h2>
                                Pendapatan & Pengeluaran
                            </h2>

                        </div>

                    </div>


                    <div className="finance-chart">

                        <ResponsiveContainer
                            width="100%"
                            height={320}
                        >

                            <LineChart
                                data={financeChart}
                                margin={{
                                    top: 10,
                                    right: 20,
                                    left: 10,
                                    bottom: 10,
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                />


                                <XAxis
                                    dataKey="month"
                                />


                                <YAxis
                                    tickFormatter={
                                        formatChartValue
                                    }
                                />


                                <Tooltip
                                    formatter={(
                                        value,
                                        name
                                    ) => [

                                            formatRupiah(
                                                value
                                            ),

                                            name,

                                        ]}
                                />


                                <Legend />


                                <Line
                                    type="monotone"
                                    dataKey="income"
                                    name="Pendapatan"
                                    stroke="#3f7d4a"
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />


                                <Line
                                    type="monotone"
                                    dataKey="expenses"
                                    name="Pengeluaran"
                                    stroke="#b7791f"
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />

                            </LineChart>

                        </ResponsiveContainer>

                    </div>

                </section>


                {/* =================================
                    HARVEST + CROP
                ================================= */}

                <section className="content-grid">


                    {/* PANEN */}

                    <div className="panel">

                        <div className="panel-header">

                            <div>

                                <span>
                                    HARVEST
                                </span>

                                <h2>
                                    Ringkasan Panen
                                </h2>

                            </div>

                        </div>


                        <div className="harvest-summary">

                            <div>

                                <strong>

                                    {
                                        dashboard?.harvest
                                            ?.total_quantity ||
                                        0
                                    }

                                </strong>

                                <span>
                                    kg total panen
                                </span>

                            </div>


                            <div className="harvest-divider" />


                            <div>

                                <strong>

                                    {formatRupiah(
                                        dashboard?.harvest
                                            ?.total_income
                                    )}

                                </strong>

                                <span>
                                    nilai hasil panen
                                </span>

                            </div>

                        </div>

                    </div>


                    {/* CROP */}

                    <div className="panel">

                        <div className="panel-header">

                            <div>

                                <span>
                                    CROP CYCLE
                                </span>

                                <h2>
                                    Tanaman
                                </h2>

                            </div>

                        </div>


                        <div className="crop-summary">

                            <div className="crop-number">

                                {
                                    dashboard?.crops
                                        ?.total || 0
                                }

                            </div>


                            <div>

                                <strong>
                                    Crop Cycle
                                </strong>

                                <p>

                                    {
                                        dashboard?.crops
                                            ?.active || 0
                                    }{' '}

                                    tanaman masih aktif

                                </p>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================
                    ACTIVE CROPS + RECENT ACTIVITIES
                ================================= */}

                <section className="content-grid">


                    {/* TANAMAN AKTIF */}

                    <div className="panel">

                        <div className="panel-header">

                            <div>

                                <span>
                                    ACTIVE CROPS
                                </span>

                                <h2>
                                    Tanaman Aktif
                                </h2>

                            </div>

                        </div>


                        {activeCrops.length === 0 ? (

                            <div className="dashboard-empty">
                                Belum ada tanaman aktif.
                            </div>

                        ) : (

                            <div className="dashboard-list">

                                {activeCrops.map(
                                    (crop) => (

                                        <div
                                            className="dashboard-list-item"
                                            key={crop.id}
                                        >

                                            <div>

                                                <strong>

                                                    {
                                                        crop.crop_name
                                                    }

                                                </strong>

                                                <span>

                                                    {
                                                        crop.variety ||
                                                        'Tanpa varietas'
                                                    }

                                                </span>

                                            </div>


                                            <div>

                                                <span>

                                                    {
                                                        crop.plant_count ||
                                                        0
                                                    }{' '}

                                                    tanaman

                                                </span>

                                                <small>
                                                    Tumbuh
                                                </small>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>


                    {/* AKTIVITAS TERBARU */}

                    <div className="panel">

                        <div className="panel-header">

                            <div>

                                <span>
                                    RECENT ACTIVITY
                                </span>

                                <h2>
                                    Aktivitas Terbaru
                                </h2>

                            </div>

                        </div>


                        {recentActivities.length === 0 ? (

                            <div className="dashboard-empty">
                                Belum ada aktivitas.
                            </div>

                        ) : (

                            <div className="dashboard-list">

                                {recentActivities.map(
                                    (activity) => (

                                        <div
                                            className="dashboard-list-item"
                                            key={activity.id}
                                        >

                                            <div>

                                                <strong>

                                                    {
                                                        activity.activity_type
                                                    }

                                                </strong>

                                                <span>

                                                    {
                                                        activity.description ||
                                                        'Tidak ada deskripsi'
                                                    }

                                                </span>

                                            </div>


                                            <div>

                                                <span>

                                                    {formatDate(
                                                        activity.activity_date
                                                    )}

                                                </span>

                                                <small>

                                                    {formatRupiah(
                                                        activity.cost
                                                    )}

                                                </small>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>

                </section>


            </main>

        </div>

    );

};


export default Dashboard;