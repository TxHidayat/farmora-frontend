import { useEffect, useMemo, useState } from 'react';

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from 'recharts';

import api from '../services/api';
import Sidebar from '../components/Sidebar';


const Analytics = () => {

    // =========================================
    // STATE
    // =========================================

    const [summary, setSummary] = useState(null);
    const [productivity, setProductivity] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [farms, setFarms] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


    // =========================================
    // FORMAT RUPIAH
    // =========================================

    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(value) || 0);
    };


    // =========================================
    // FORMAT NUMBER
    // =========================================

    const formatNumber = (value, maximumFractionDigits = 2) => {
        return new Intl.NumberFormat('id-ID', {
            maximumFractionDigits,
        }).format(Number(value) || 0);
    };


    // =========================================
    // FETCH ANALYTICS
    // =========================================

    const fetchAnalytics = async () => {

        try {

            setLoading(true);
            setError('');

            const [
                summaryResponse,
                productivityResponse,
                expensesResponse,
                farmsResponse,
            ] = await Promise.all([

                api.get('/analytics/summary'),

                api.get('/analytics/productivity'),

                api.get('/analytics/expenses'),

                api.get('/analytics/farms'),

            ]);


            // SUMMARY

            if (summaryResponse.data.success) {

                setSummary(
                    summaryResponse.data.data
                );

            }


            // PRODUCTIVITY

            if (productivityResponse.data.success) {

                setProductivity(
                    productivityResponse.data.data || []
                );

            }


            // EXPENSES

            if (expensesResponse.data.success) {

                setExpenses(
                    expensesResponse.data.data || []
                );

            }


            // FARMS

            if (farmsResponse.data.success) {

                setFarms(
                    farmsResponse.data.data || []
                );

            }

        } catch (error) {

            console.error(
                'Analytics error:',
                error
            );

            setError(
                error.response?.data?.message ||
                'Gagal mengambil data analytics.'
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================================
    // INITIAL LOAD
    // =========================================

    useEffect(() => {

        fetchAnalytics();

    }, []);


    // =========================================
    // SUMMARY VALUES
    // =========================================

    const totalIncome =
        Number(summary?.total_income) || 0;

    const totalExpenses =
        Number(summary?.total_expenses) || 0;

    const estimatedProfit =
        Number(summary?.estimated_profit) || 0;

    const totalHarvest =
        Number(summary?.total_harvest) || 0;


    // =========================================
    // CALCULATED ANALYTICS
    // =========================================

    const calculated = useMemo(() => {

        // TOTAL TANAMAN

        const totalPlants =
            productivity.reduce(
                (total, crop) =>
                    total +
                    Number(crop.plant_count || 0),
                0
            );


        // MARGIN

        const profitMargin =
            totalIncome > 0
                ? (estimatedProfit / totalIncome) * 100
                : 0;


        // COST PER KG

        const costPerKg =
            totalHarvest > 0
                ? totalExpenses / totalHarvest
                : 0;


        // INCOME PER KG

        const incomePerKg =
            totalHarvest > 0
                ? totalIncome / totalHarvest
                : 0;


        // PROFIT PER KG

        const profitPerKg =
            totalHarvest > 0
                ? estimatedProfit / totalHarvest
                : 0;


        // TOTAL CROP CYCLES

        const totalCropCycles =
            productivity.length;


        return {
            totalPlants,
            profitMargin,
            costPerKg,
            incomePerKg,
            profitPerKg,
            totalCropCycles,
        };

    }, [
        productivity,
        totalIncome,
        totalExpenses,
        estimatedProfit,
        totalHarvest,
    ]);


    // =========================================
    // PRODUCTIVITY CHART
    // =========================================

    const productivityChartData = useMemo(() => {

        return productivity.map((crop) => ({
            name: crop.crop_name || 'Tanaman',
            productivity:
                Number(crop.productivity) || 0,
        }));

    }, [productivity]);


    // =========================================
    // EXPENSE CHART
    // =========================================

    const expenseChartData = useMemo(() => {

        return expenses
            .filter(
                (expense) =>
                    Number(expense.total_amount || 0) > 0
            )
            .map((expense) => ({
                name: expense.category,
                value:
                    Number(expense.total_amount) || 0,
            }));

    }, [expenses]);


    // =========================================
    // EXPENSE COLORS
    // =========================================

    const expenseColors = [
        '#35A95A',
        '#4F8EDC',
        '#E6A23C',
        '#D9534F',
    ];


    // =========================================
    // INSIGHT TANAMAN TERBAIK
    // =========================================

    const bestCrop = useMemo(() => {

        if (productivity.length === 0) {
            return null;
        }

        return [...productivity].sort(
            (a, b) =>
                Number(b.total_income || 0) -
                Number(a.total_income || 0)
        )[0];

    }, [productivity]);


    // =========================================
    // PENGELUARAN TERBESAR
    // =========================================

    const highestExpense = useMemo(() => {

        if (expenses.length === 0) {
            return null;
        }

        return [...expenses].sort(
            (a, b) =>
                Number(b.total_amount || 0) -
                Number(a.total_amount || 0)
        )[0];

    }, [expenses]);


    // =========================================
    // KEBUN DENGAN PROFIT TERBESAR
    // =========================================

    const bestFarm = useMemo(() => {

        if (farms.length === 0) {
            return null;
        }

        return [...farms].sort(
            (a, b) =>
                Number(b.estimated_profit || 0) -
                Number(a.estimated_profit || 0)
        )[0];

    }, [farms]);


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
                    Memuat analytics FARMORA...
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
                        Gagal memuat Analytics
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={fetchAnalytics}
                    >
                        Coba Lagi
                    </button>

                </div>

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
                activePage="analytics"
            />


            {/* MAIN */}

            <main className="dashboard-main">

                {/* =================================
                    HEADER
                ================================= */}

                <header className="dashboard-header">

                    <div>

                        <span className="header-label">
                            ANALYTICS
                        </span>

                        <h1>
                            Analytics
                        </h1>

                        <p>
                            Analisis performa pertanian
                            berdasarkan data FARMORA.
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
                    FINANCIAL SUMMARY
                ================================= */}

                <section className="analytics-summary-grid">

                    {/* PENDAPATAN */}

                    <div className="analytics-summary-card income">

                        <div className="analytics-card-top">

                            <span>
                                Total Pendapatan
                            </span>

                            <div className="analytics-card-icon">
                                ↑
                            </div>

                        </div>

                        <strong>
                            {formatRupiah(totalIncome)}
                        </strong>

                        <small>
                            Pendapatan dari hasil panen
                        </small>

                    </div>


                    {/* PENGELUARAN */}

                    <div className="analytics-summary-card expense">

                        <div className="analytics-card-top">

                            <span>
                                Total Pengeluaran
                            </span>

                            <div className="analytics-card-icon">
                                ↓
                            </div>

                        </div>

                        <strong>
                            {formatRupiah(totalExpenses)}
                        </strong>

                        <small>
                            Total biaya operasional
                        </small>

                    </div>


                    {/* PROFIT */}

                    <div className="analytics-summary-card profit">

                        <div className="analytics-card-top">

                            <span>
                                Estimasi Profit
                            </span>

                            <div className="analytics-card-icon">
                                Rp
                            </div>

                        </div>

                        <strong>
                            {formatRupiah(estimatedProfit)}
                        </strong>

                        <small>
                            Pendapatan dikurangi pengeluaran
                        </small>

                    </div>


                    {/* PANEN */}

                    <div className="analytics-summary-card harvest">

                        <div className="analytics-card-top">

                            <span>
                                Total Panen
                            </span>

                            <div className="analytics-card-icon">
                                ✓
                            </div>

                        </div>

                        <strong>
                            {formatNumber(totalHarvest)} kg
                        </strong>

                        <small>
                            Akumulasi hasil panen
                        </small>

                    </div>

                </section>


                {/* =================================
                    PRODUCTION METRICS
                ================================= */}

                <section className="analytics-metrics-grid">

                    <div className="analytics-metric-card">

                        <span>
                            TOTAL TANAMAN
                        </span>

                        <strong>
                            {formatNumber(
                                calculated.totalPlants,
                                0
                            )}
                        </strong>

                        <small>
                            tanaman tercatat
                        </small>

                    </div>


                    <div className="analytics-metric-card">

                        <span>
                            SIKLUS TANAMAN
                        </span>

                        <strong>
                            {calculated.totalCropCycles}
                        </strong>

                        <small>
                            siklus tercatat
                        </small>

                    </div>


                    <div className="analytics-metric-card">

                        <span>
                            BIAYA / KG
                        </span>

                        <strong>
                            {formatRupiah(
                                calculated.costPerKg
                            )}
                        </strong>

                        <small>
                            rata-rata biaya per kg
                        </small>

                    </div>


                    <div className="analytics-metric-card">

                        <span>
                            PENDAPATAN / KG
                        </span>

                        <strong>
                            {formatRupiah(
                                calculated.incomePerKg
                            )}
                        </strong>

                        <small>
                            rata-rata pendapatan per kg
                        </small>

                    </div>


                    <div className="analytics-metric-card">

                        <span>
                            PROFIT / KG
                        </span>

                        <strong>
                            {formatRupiah(
                                calculated.profitPerKg
                            )}
                        </strong>

                        <small>
                            estimasi profit per kg
                        </small>

                    </div>


                    <div className="analytics-metric-card">

                        <span>
                            MARGIN PROFIT
                        </span>

                        <strong>
                            {formatNumber(
                                calculated.profitMargin
                            )}%
                        </strong>

                        <small>
                            estimasi margin
                        </small>

                    </div>

                </section>


                {/* =================================
                    CHARTS
                ================================= */}

                <section className="analytics-chart-grid">

                    {/* PRODUCTIVITY */}

                    <div className="analytics-panel">

                        <div className="analytics-panel-header">

                            <div>

                                <span>
                                    PRODUCTIVITY
                                </span>

                                <h2>
                                    Produktivitas Tanaman
                                </h2>

                                <p>
                                    Perbandingan hasil panen
                                    berdasarkan jumlah tanaman.
                                </p>

                            </div>

                        </div>


                        {productivityChartData.length === 0 ? (

                            <div className="analytics-empty">
                                Belum ada data produktivitas.
                            </div>

                        ) : (

                            <div className="analytics-chart">

                                <ResponsiveContainer
                                    width="100%"
                                    height={300}
                                >

                                    <BarChart
                                        data={
                                            productivityChartData
                                        }
                                        margin={{
                                            top: 20,
                                            right: 20,
                                            left: 0,
                                            bottom: 20,
                                        }}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                        />

                                        <XAxis
                                            dataKey="name"
                                        />

                                        <YAxis />

                                        <Tooltip
                                            formatter={(
                                                value
                                            ) => [
                                                    `${formatNumber(value)} kg/tanaman`,
                                                    'Produktivitas',
                                                ]}
                                        />

                                        <Legend />

                                        <Bar
                                            dataKey="productivity"
                                            name="Produktivitas"
                                            fill="#35A95A"
                                            radius={[
                                                5,
                                                5,
                                                0,
                                                0,
                                            ]}
                                        />

                                    </BarChart>

                                </ResponsiveContainer>

                            </div>

                        )}

                    </div>


                    {/* EXPENSE */}

                    <div className="analytics-panel">

                        <div className="analytics-panel-header">

                            <div>

                                <span>
                                    EXPENSE ANALYTICS
                                </span>

                                <h2>
                                    Pengeluaran
                                </h2>

                                <p>
                                    Distribusi biaya berdasarkan
                                    kategori.
                                </p>

                            </div>

                        </div>


                        {expenseChartData.length === 0 ? (

                            <div className="analytics-empty">
                                Belum ada data pengeluaran.
                            </div>

                        ) : (

                            <div className="analytics-chart analytics-pie-chart">

                                <ResponsiveContainer
                                    width="100%"
                                    height={300}
                                >

                                    <PieChart>

                                        <Pie
                                            data={
                                                expenseChartData
                                            }
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="45%"
                                            innerRadius={65}
                                            outerRadius={105}
                                            paddingAngle={2}
                                        >

                                            {expenseChartData.map(
                                                (
                                                    entry,
                                                    index
                                                ) => (

                                                    <Cell
                                                        key={
                                                            `${entry.name}-${index}`
                                                        }
                                                        fill={
                                                            expenseColors[
                                                            index %
                                                            expenseColors.length
                                                            ]
                                                        }
                                                    />

                                                )
                                            )}

                                        </Pie>

                                        <Tooltip
                                            formatter={(
                                                value
                                            ) => [
                                                    formatRupiah(value),
                                                    'Pengeluaran',
                                                ]}
                                        />

                                        <Legend />

                                    </PieChart>

                                </ResponsiveContainer>

                            </div>

                        )}

                    </div>

                </section>


                {/* =================================
                    INSIGHT
                ================================= */}

                <section className="analytics-insight-panel">

                    <div className="analytics-insight-header">

                        <div>

                            <span>
                                FARM INSIGHT
                            </span>

                            <h2>
                                Ringkasan Performa
                            </h2>

                            <p>
                                Informasi turunan dari data
                                pertanian yang tercatat.
                            </p>

                        </div>

                    </div>


                    <div className="analytics-insight-grid">

                        {/* TOTAL TANAMAN */}

                        <div className="analytics-insight-item">

                            <div className="analytics-insight-icon">
                                🌱
                            </div>

                            <div>

                                <span>
                                    Total Tanaman
                                </span>

                                <strong>
                                    {formatNumber(
                                        calculated.totalPlants,
                                        0
                                    )}
                                </strong>

                                <p>
                                    Dari{' '}
                                    {
                                        calculated.totalCropCycles
                                    }{' '}
                                    siklus tanaman.
                                </p>

                            </div>

                        </div>


                        {/* TANAMAN TERBESAR */}

                        <div className="analytics-insight-item">

                            <div className="analytics-insight-icon">
                                🌾
                            </div>

                            <div>

                                <span>
                                    Kontribusi Pendapatan
                                </span>

                                <strong>
                                    {bestCrop
                                        ?.crop_name ||
                                        '-'}
                                </strong>

                                <p>
                                    {bestCrop
                                        ? formatRupiah(
                                            bestCrop.total_income
                                        )
                                        : 'Belum tersedia'}
                                </p>

                            </div>

                        </div>


                        {/* PENGELUARAN */}

                        <div className="analytics-insight-item">

                            <div className="analytics-insight-icon">
                                Rp
                            </div>

                            <div>

                                <span>
                                    Pengeluaran Terbesar
                                </span>

                                <strong>
                                    {highestExpense
                                        ?.category ||
                                        '-'}
                                </strong>

                                <p>
                                    {highestExpense
                                        ? formatRupiah(
                                            highestExpense.total_amount
                                        )
                                        : 'Belum tersedia'}
                                </p>

                            </div>

                        </div>


                        {/* KEBUN */}

                        <div className="analytics-insight-item">

                            <div className="analytics-insight-icon">
                                🌿
                            </div>

                            <div>

                                <span>
                                    Performa Kebun
                                </span>

                                <strong>
                                    {bestFarm
                                        ?.farm_name ||
                                        '-'}
                                </strong>

                                <p>
                                    {bestFarm
                                        ? `Profit ${formatRupiah(
                                            bestFarm.estimated_profit
                                        )}`
                                        : 'Belum tersedia'}
                                </p>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================
                    CROP PERFORMANCE
                ================================= */}

                <section className="analytics-detail-panel">

                    <div className="analytics-panel-header">

                        <div>

                            <span>
                                CROP PERFORMANCE
                            </span>

                            <h2>
                                Detail Produktivitas
                            </h2>

                            <p>
                                Performa setiap siklus tanaman.
                            </p>

                        </div>

                    </div>


                    {productivity.length === 0 ? (

                        <div className="analytics-empty">
                            Belum ada data tanaman.
                        </div>

                    ) : (

                        <div className="table-wrapper">

                            <table className="data-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Tanaman
                                        </th>

                                        <th>
                                            Varietas
                                        </th>

                                        <th>
                                            Kebun
                                        </th>

                                        <th>
                                            Lahan
                                        </th>

                                        <th>
                                            Jumlah Tanaman
                                        </th>

                                        <th>
                                            Total Panen
                                        </th>

                                        <th>
                                            Produktivitas
                                        </th>

                                        <th>
                                            Pendapatan
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {productivity.map(
                                        (crop) => (

                                            <tr
                                                key={
                                                    crop.crop_cycle_id
                                                }
                                            >

                                                <td>
                                                    <strong>
                                                        {
                                                            crop.crop_name
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        crop.variety ||
                                                        '-'
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        crop.farm_name ||
                                                        '-'
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        crop.field_name ||
                                                        '-'
                                                    }
                                                </td>

                                                <td>
                                                    {formatNumber(
                                                        crop.plant_count,
                                                        0
                                                    )}
                                                </td>

                                                <td>
                                                    {formatNumber(
                                                        crop.total_harvest
                                                    )}{' '}
                                                    kg
                                                </td>

                                                <td>
                                                    {formatNumber(
                                                        crop.productivity
                                                    )}{' '}
                                                    kg/tanaman
                                                </td>

                                                <td>
                                                    {formatRupiah(
                                                        crop.total_income
                                                    )}
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>


                {/* =================================
                    FARM PERFORMANCE
                ================================= */}

                <section className="analytics-detail-panel">

                    <div className="analytics-panel-header">

                        <div>

                            <span>
                                FARM PERFORMANCE
                            </span>

                            <h2>
                                Performa Kebun
                            </h2>

                            <p>
                                Ringkasan performa setiap kebun.
                            </p>

                        </div>

                    </div>


                    {farms.length === 0 ? (

                        <div className="analytics-empty">
                            Belum ada data kebun.
                        </div>

                    ) : (

                        <div className="table-wrapper">

                            <table className="data-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Kebun
                                        </th>

                                        <th>
                                            Total Lahan
                                        </th>

                                        <th>
                                            Siklus Tanaman
                                        </th>

                                        <th>
                                            Pendapatan
                                        </th>

                                        <th>
                                            Pengeluaran
                                        </th>

                                        <th>
                                            Estimasi Profit
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {farms.map(
                                        (farm) => (

                                            <tr
                                                key={
                                                    farm.farm_id
                                                }
                                            >

                                                <td>
                                                    <strong>
                                                        {
                                                            farm.farm_name
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        farm.total_fields
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        farm.total_crop_cycles
                                                    }
                                                </td>

                                                <td>
                                                    {formatRupiah(
                                                        farm.total_income
                                                    )}
                                                </td>

                                                <td>
                                                    {formatRupiah(
                                                        farm.total_expenses
                                                    )}
                                                </td>

                                                <td
                                                    className={
                                                        Number(
                                                            farm.estimated_profit
                                                        ) >= 0
                                                            ? 'analytics-profit-positive'
                                                            : 'analytics-profit-negative'
                                                    }
                                                >
                                                    {formatRupiah(
                                                        farm.estimated_profit
                                                    )}
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>


                {/* =================================
                    EXPENSE DETAIL
                ================================= */}

                <section className="analytics-detail-panel">

                    <div className="analytics-panel-header">

                        <div>

                            <span>
                                EXPENSE BREAKDOWN
                            </span>

                            <h2>
                                Detail Pengeluaran
                            </h2>

                            <p>
                                Jumlah transaksi dan total
                                biaya setiap kategori.
                            </p>

                        </div>

                    </div>


                    {expenses.length === 0 ? (

                        <div className="analytics-empty">
                            Belum ada data pengeluaran.
                        </div>

                    ) : (

                        <div className="table-wrapper">

                            <table className="data-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Kategori
                                        </th>

                                        <th>
                                            Jumlah Transaksi
                                        </th>

                                        <th>
                                            Total Pengeluaran
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {expenses.map(
                                        (expense) => (

                                            <tr
                                                key={
                                                    expense.category
                                                }
                                            >

                                                <td>
                                                    <strong>
                                                        {expense.category}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        expense.transaction_count
                                                    }
                                                </td>

                                                <td>
                                                    {formatRupiah(
                                                        expense.total_amount
                                                    )}
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
};


export default Analytics;