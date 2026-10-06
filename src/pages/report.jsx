import { useEffect, useState } from 'react';

import api from '../services/api';
import Sidebar from '../components/Sidebar';

const Reports = () => {
    const getDefaultStartDate = () => {
        const date = new Date();

        return `${date.getFullYear()}-${String(
            date.getMonth() + 1
        ).padStart(2, '0')}-01`;
    };

    const getDefaultEndDate = () => {
        const date = new Date();

        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, '0'),
            String(date.getDate()).padStart(2, '0'),
        ].join('-');
    };

    const [startDate, setStartDate] = useState(
        getDefaultStartDate()
    );

    const [endDate, setEndDate] = useState(
        getDefaultEndDate()
    );

    const [summary, setSummary] = useState(null);

    const [harvests, setHarvests] = useState([]);

    const [expenses, setExpenses] = useState([]);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState('');

    // =========================================
    // FETCH REPORTS
    // =========================================

    const fetchReports = async () => {
        if (!startDate || !endDate) {
            return;
        }

        if (startDate > endDate) {
            setError(
                'Tanggal mulai tidak boleh lebih besar dari tanggal akhir.'
            );

            return;
        }

        try {
            setLoading(true);
            setError('');

            const params = {
                start_date: startDate,
                end_date: endDate,
            };

            const [
                summaryResponse,
                harvestResponse,
                expenseResponse,
            ] = await Promise.all([
                api.get(
                    '/reports/summary',
                    {
                        params,
                    }
                ),

                api.get(
                    '/reports/harvests',
                    {
                        params,
                    }
                ),

                api.get(
                    '/reports/expenses',
                    {
                        params,
                    }
                ),
            ]);

            if (
                summaryResponse.data.success
            ) {
                setSummary(
                    summaryResponse.data.data
                );
            }

            if (
                harvestResponse.data.success
            ) {
                setHarvests(
                    harvestResponse.data.data ||
                    []
                );
            }

            if (
                expenseResponse.data.success
            ) {
                setExpenses(
                    expenseResponse.data.data ||
                    []
                );
            }
        } catch (err) {
            console.error(
                'Fetch reports error:',
                err
            );

            setError(
                err.response?.data?.message ||
                'Gagal mengambil laporan.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    // =========================================
    // FORMAT
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

    // =========================================
    // HELPERS
    // =========================================

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

    const getHarvestIncome = (
        harvest
    ) => {
        if (
            harvest.total_income !==
            undefined
        ) {
            return Number(
                harvest.total_income || 0
            );
        }

        return (
            Number(
                harvest.quantity || 0
            ) *
            Number(
                harvest.price_per_unit || 0
            )
        );
    };

    // =========================================
    // SAFE SUMMARY VALUES
    // =========================================

    const totalHarvests =
        Number(
            summary?.harvest
                ?.total_harvests || 0
        );

    const totalActivities =
        Number(
            summary?.activities
                ?.total || 0
        );

    const totalIncome =
        Number(
            summary?.income
                ?.total || 0
        );

    const totalExpenses =
        Number(
            summary?.expenses
                ?.total || 0
        );

    const estimatedProfit =
        Number(
            summary?.profit
                ?.estimated || 0
        );

    const profitMargin =
        totalIncome > 0
            ? (
                estimatedProfit /
                totalIncome
            ) * 100
            : 0;

    // =========================================
    // EXPENSE BY CATEGORY
    // =========================================

    const expenseByCategory =
        expenses.reduce(
            (
                result,
                expense
            ) => {
                const category =
                    expense.category ||
                    'lainnya';

                const amount =
                    Number(
                        expense.amount ||
                        0
                    );

                if (
                    !result[category]
                ) {
                    result[category] = 0;
                }

                result[category] +=
                    amount;

                return result;
            },
            {}
        );

    const expenseCategoryList =
        Object.entries(
            expenseByCategory
        ).sort(
            (
                [, amountA],
                [, amountB]
            ) =>
                amountB -
                amountA
        );

    // =========================================
    // HIGHEST EXPENSE
    // =========================================

    const highestExpense =
        [...expenses].sort(
            (a, b) =>
                Number(
                    b.amount || 0
                ) -
                Number(
                    a.amount || 0
                )
        )[0];

    // =========================================
    // HIGHEST HARVEST INCOME
    // =========================================

    const highestHarvest =
        [...harvests].sort(
            (a, b) =>
                getHarvestIncome(b) -
                getHarvestIncome(a)
        )[0];

    // =========================================
    // LOADING
    // =========================================

    if (loading && !summary) {
        return (
            <div className="loading-screen">

                <div className="loading-logo">
                    <img src="/img/green1.png" alt="FARMORA" />
                </div>

                <p>
                    Menyiapkan laporan...
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
                activePage="reports"
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
                            Laporan
                        </h1>

                        <p>
                            Ringkasan operasional dan
                            keuangan FARMORA berdasarkan
                            periode yang dipilih.
                        </p>

                    </div>

                </header>


                {/* =================================
                    FILTER
                ================================= */}

                <section className="report-filter">

                    <div className="form-group">

                        <label>
                            Dari Tanggal
                        </label>

                        <input
                            type="date"
                            value={
                                startDate
                            }
                            onChange={(
                                event
                            ) =>
                                setStartDate(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Sampai Tanggal
                        </label>

                        <input
                            type="date"
                            value={
                                endDate
                            }
                            onChange={(
                                event
                            ) =>
                                setEndDate(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    <button
                        type="button"
                        className="primary-button report-button"
                        onClick={
                            fetchReports
                        }
                        disabled={
                            loading
                        }
                    >

                        {loading
                            ? 'Memuat...'
                            : 'Tampilkan Laporan'}

                    </button>

                </section>


                {/* ERROR */}

                {error && (

                    <div className="alert alert-error">
                        {error}
                    </div>

                )}


                {/* =================================
                    PERIOD
                ================================= */}

                <div className="report-period">

                    Periode:{' '}

                    <strong>
                        {
                            formatDate(
                                startDate
                            )
                        }
                    </strong>

                    {' '}sampai{' '}

                    <strong>
                        {
                            formatDate(
                                endDate
                            )
                        }
                    </strong>

                </div>


                {/* =================================
                    FINANCIAL SUMMARY
                ================================= */}

                <section className="stats-grid report-stats">

                    {/* TOTAL PANEN */}

                    <div className="stat-card">

                        <div className="stat-icon activity">
                            #
                        </div>

                        <div>

                            <span>
                                Data Panen
                            </span>

                            <strong>
                                {
                                    totalHarvests
                                }
                            </strong>

                            <small>
                                catatan panen
                            </small>

                        </div>

                    </div>


                    {/* PENDAPATAN */}

                    <div className="stat-card">

                        <div className="stat-icon income">
                            ↑
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


                    {/* PENGELUARAN */}

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


                    {/* PROFIT */}

                    <div className="stat-card">

                        <div className="stat-icon crop">
                            =
                        </div>

                        <div>

                            <span>
                                Selisih Pendapatan
                            </span>

                            <strong>
                                {
                                    formatRupiah(
                                        estimatedProfit
                                    )
                                }
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================
                    FINANCIAL OVERVIEW
                ================================= */}

                <section className="report-finance-card">

                    <div className="report-finance-header">

                        <div>

                            <span>
                                FINANCIAL OVERVIEW
                            </span>

                            <h2>
                                Performa Keuangan
                            </h2>

                            <p>
                                Perbandingan pendapatan
                                dan pengeluaran selama
                                periode laporan.
                            </p>

                        </div>

                    </div>


                    <div className="report-finance-grid">

                        <div className="report-finance-item income">

                            <span>
                                Pendapatan
                            </span>

                            <strong>
                                {
                                    formatRupiah(
                                        totalIncome
                                    )
                                }
                            </strong>

                        </div>


                        <div className="report-finance-item expense">

                            <span>
                                Pengeluaran
                            </span>

                            <strong>
                                {
                                    formatRupiah(
                                        totalExpenses
                                    )
                                }
                            </strong>

                        </div>


                        <div className="report-finance-item profit">

                            <span>
                                Selisih
                            </span>

                            <strong>
                                {
                                    formatRupiah(
                                        estimatedProfit
                                    )
                                }
                            </strong>

                        </div>


                        <div className="report-finance-item">

                            <span>
                                Margin
                            </span>

                            <strong>
                                {
                                    profitMargin.toFixed(
                                        1
                                    )
                                }
                                %
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================
                    OPERATIONAL SUMMARY
                ================================= */}

                <section className="report-grid">

                    <div className="content-card">

                        <div className="content-card-header">

                            <div>

                                <span className="report-card-label">
                                    OPERATIONS
                                </span>

                                <h2>
                                    Ringkasan Operasional
                                </h2>

                                <p>
                                    Aktivitas pertanian
                                    selama periode laporan.
                                </p>

                            </div>

                        </div>


                        <div className="summary-list">

                            <div className="summary-item">

                                <span>
                                    Jumlah Aktivitas
                                </span>

                                <strong>
                                    {
                                        totalActivities
                                    }
                                </strong>

                            </div>


                            <div className="summary-item">

                                <span>
                                    Data Panen
                                </span>

                                <strong>
                                    {
                                        totalHarvests
                                    }
                                </strong>

                            </div>


                            <div className="summary-item">

                                <span>
                                    Transaksi Pengeluaran
                                </span>

                                <strong>
                                    {
                                        expenses.length
                                    }
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* EXPENSE CATEGORY */}

                    <div className="content-card">

                        <div className="content-card-header">

                            <div>

                                <span className="report-card-label">
                                    EXPENSE BREAKDOWN
                                </span>

                                <h2>
                                    Biaya berdasarkan Kategori
                                </h2>

                                <p>
                                    Distribusi pengeluaran
                                    selama periode laporan.
                                </p>

                            </div>

                        </div>


                        {expenseCategoryList.length ===
                            0 ? (

                            <div className="empty-state compact">
                                Tidak ada pengeluaran.
                            </div>

                        ) : (

                            <div className="report-expense-list">

                                {expenseCategoryList.map(
                                    (
                                        [
                                            category,
                                            amount,
                                        ]
                                    ) => {

                                        const percentage =
                                            totalExpenses >
                                                0
                                                ? (
                                                    amount /
                                                    totalExpenses
                                                ) *
                                                100
                                                : 0;

                                        return (

                                            <div
                                                className="report-expense-item"
                                                key={
                                                    category
                                                }
                                            >

                                                <div className="report-expense-top">

                                                    <strong>
                                                        {
                                                            getCategoryLabel(
                                                                category
                                                            )
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            formatRupiah(
                                                                amount
                                                            )
                                                        }
                                                    </span>

                                                </div>


                                                <div className="report-progress">

                                                    <div
                                                        style={{
                                                            width: `${percentage}%`,
                                                        }}
                                                    />

                                                </div>


                                                <small>
                                                    {
                                                        percentage.toFixed(
                                                            1
                                                        )
                                                    }
                                                    % dari
                                                    total
                                                    pengeluaran
                                                </small>

                                            </div>

                                        );
                                    }
                                )}

                            </div>

                        )}

                    </div>

                </section>


                {/* =================================
                    DETAIL PANEN
                ================================= */}

                <section className="content-card">

                    <div className="content-card-header">

                        <div>

                            <span className="report-card-label">
                                HARVEST REPORT
                            </span>

                            <h2>
                                Detail Panen
                            </h2>

                            <p>
                                Hasil panen dalam periode
                                yang dipilih.
                            </p>

                        </div>

                    </div>


                    {harvests.length === 0 ? (

                        <div className="empty-state compact">

                            Tidak ada data panen pada
                            periode ini.

                        </div>

                    ) : (

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
                                            Pendapatan
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {harvests.map(
                                        (
                                            harvest
                                        ) => (

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
                                                            harvest.crop_name ||
                                                            '-'
                                                        }
                                                    </strong>

                                                    {harvest.variety && (

                                                        <small className="table-subtext">
                                                            {
                                                                harvest.variety
                                                            }
                                                        </small>

                                                    )}

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
                                                                getHarvestIncome(
                                                                    harvest
                                                                )
                                                            )
                                                        }
                                                    </strong>

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
                    DETAIL EXPENSES
                ================================= */}

                <section className="content-card">

                    <div className="content-card-header">

                        <div>

                            <span className="report-card-label">
                                EXPENSE REPORT
                            </span>

                            <h2>
                                Detail Pengeluaran
                            </h2>

                            <p>
                                Seluruh biaya operasional
                                dalam periode yang dipilih.
                            </p>

                        </div>

                    </div>


                    {expenses.length === 0 ? (

                        <div className="empty-state compact">

                            Tidak ada pengeluaran pada
                            periode ini.

                        </div>

                    ) : (

                        <div className="table-wrapper">

                            <table className="data-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Tanggal
                                        </th>

                                        <th>
                                            Kategori
                                        </th>

                                        <th>
                                            Tanaman
                                        </th>

                                        <th>
                                            Deskripsi
                                        </th>

                                        <th>
                                            Jumlah
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {expenses.map(
                                        (
                                            expense
                                        ) => (

                                            <tr
                                                key={
                                                    expense.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        formatDate(
                                                            expense.expense_date
                                                        )
                                                    }
                                                </td>


                                                <td>

                                                    <span className="expense-badge">
                                                        {
                                                            getCategoryLabel(
                                                                expense.category
                                                            )
                                                        }
                                                    </span>

                                                </td>


                                                <td>
                                                    {
                                                        expense.crop_name ||
                                                        'Umum kebun'
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        expense.description ||
                                                        '-'
                                                    }
                                                </td>


                                                <td>

                                                    <strong>
                                                        {
                                                            formatRupiah(
                                                                expense.amount
                                                            )
                                                        }
                                                    </strong>

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
                    INSIGHTS
                ================================= */}

                <section className="report-grid">

                    {/* HIGHEST HARVEST */}

                    <div className="content-card">

                        <div className="content-card-header">

                            <div>

                                <span className="report-card-label">
                                    HARVEST INSIGHT
                                </span>

                                <h2>
                                    Pendapatan Panen Terbesar
                                </h2>

                            </div>

                        </div>


                        {highestHarvest ? (

                            <div className="report-highlight">

                                <strong>
                                    {
                                        highestHarvest.crop_name ||
                                        'Tanaman'
                                    }
                                </strong>

                                <span>
                                    {
                                        highestHarvest.quantity
                                    }{' '}
                                    {
                                        highestHarvest.unit
                                    }
                                </span>

                                <b>
                                    {
                                        formatRupiah(
                                            getHarvestIncome(
                                                highestHarvest
                                            )
                                        )
                                    }
                                </b>

                                <small>
                                    {
                                        formatDate(
                                            highestHarvest.harvest_date
                                        )
                                    }
                                </small>

                            </div>

                        ) : (

                            <div className="empty-state compact">
                                Belum ada data panen.
                            </div>

                        )}

                    </div>


                    {/* HIGHEST EXPENSE */}

                    <div className="content-card">

                        <div className="content-card-header">

                            <div>

                                <span className="report-card-label">
                                    EXPENSE INSIGHT
                                </span>

                                <h2>
                                    Pengeluaran Terbesar
                                </h2>

                            </div>

                        </div>


                        {highestExpense ? (

                            <div className="report-highlight">

                                <strong>
                                    {
                                        getCategoryLabel(
                                            highestExpense.category
                                        )
                                    }
                                </strong>

                                <span>
                                    {
                                        highestExpense.description ||
                                        'Tanpa deskripsi'
                                    }
                                </span>

                                <b>
                                    {
                                        formatRupiah(
                                            highestExpense.amount
                                        )
                                    }
                                </b>

                                <small>
                                    {
                                        formatDate(
                                            highestExpense.expense_date
                                        )
                                    }
                                </small>

                            </div>

                        ) : (

                            <div className="empty-state compact">
                                Belum ada data pengeluaran.
                            </div>

                        )}

                    </div>

                </section>


                {/* =================================
                    FOOTNOTE
                ================================= */}

                <div className="report-note">

                    <strong>
                        Catatan:
                    </strong>

                    <span>
                        Nilai selisih merupakan
                        pendapatan dikurangi pengeluaran
                        yang tercatat dalam FARMORA pada
                        periode yang dipilih. Nilai ini
                        bukan laporan laba rugi akuntansi
                        formal.
                    </span>

                </div>

            </main>

        </div>
    );
};

export default Reports;