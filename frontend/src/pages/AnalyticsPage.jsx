import { useState, useEffect } from 'react';
import {
    BarChart,
    LineChart,
    PieChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Bar,
    Line,
    Pie,
    Cell,
    ResponsiveContainer
} from 'recharts';
import { RefreshCw, ArrowLeftIcon, InfoIcon, ArrowRightIcon } from 'lucide-react';
import { useParams, useNavigate, Link } from "react-router-dom";
import { useProductStore } from "../store/useProductStore";
import { useGoogleAuthContext } from '../contexts/GoogleAuthContext';

// Simplified dummy data generator
const generateData = (platforms = ['Facebook', 'Instagram', 'Threads']) =>
    platforms.map(platform => {
        const myObj = {
            likes: Math.floor(Math.random() * 1000),
            comments: Math.floor(Math.random() * 500),
            shares: Math.floor(Math.random() * 200),
            impressions: Math.floor(Math.random() * 5000),
        }
        return {
            platform,
            ...myObj
        }
    }
    );

const CustomPieTooltip = ({ actualData, active, payload }) => {
    console.log({ actualData, payload })
    if (active && payload && payload.length) {
        const total = actualData.map((elem, i) => (elem.likes)).reduce((elem, i, accum) => (elem + i), 0);
        console.log({ total })

        const percentage = ((payload[0].value / total) * 100).toFixed(1);

        return (
            <div className="bg-base-100 p-3 rounded-lg shadow-md border border-base-300">
                <p className="font-bold">{payload[0].payload.platform}</p>
                <p>Likes: {payload[0].value.toLocaleString()}</p>
                <p>{percentage}% of total</p>
            </div>
        );
    }
    return null;
};

const FunnelChart = ({ data, colors }) => {
    const total = data.reduce((acc, cur) => acc + cur.value, 0);

    return (
        <div className="w-full space-y-4">
            {data.map((stage, index) => {
                const prevValue = index > 0 ? data[index - 1].value : total;
                const percentage = ((stage.value / prevValue) * 100).toFixed(1);
                const widthPercentage = (stage.value / total * 100).toFixed(1);

                return (
                    <div key={stage.name} className="group relative">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{stage.name}</span>
                            <span className="text-sm opacity-75">{stage.value.toLocaleString()}</span>
                        </div>
                        <div
                            className="h-8 rounded-lg transition-all duration-300"
                            style={{
                                width: `${widthPercentage}%`,
                                backgroundColor: colors[index % colors.length]
                            }}
                        >
                            <div className="absolute right-0 top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-base-100 p-2 rounded shadow-lg text-sm">
                                {`${percentage}% conversion from ${index > 0 ? data[index - 1].name : 'start'}`}
                            </div>
                        </div>
                        {index > 0 && (
                            <div className="text-right text-sm text-neutral-content">
                                {`${100 - percentage}% drop-off`}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const AnalyticsDashboard = () => {
    // ... existing state and effects ...
    const [timeRange, setTimeRange] = useState('7');
    const [barData, setBarData] = useState(() => generateData());
    const [lineData, setLineData] = useState(() =>
        Array.from({ length: 7 }, (_, i) => ({
            date: `Day ${i + 1}`,
            likes: Math.floor(Math.random() * 1000),
            clicks: Math.floor(Math.random() * 500),
            purchases: Math.floor(Math.random() * 400)
        }))
    );

    const navigate = useNavigate();
    const {gapi} = useGoogleAuthContext();


    const { fetchProduct, product, loading, error, resetFormData } = useProductStore();
    const { id } = useParams();
    console.log({productId: id});

    useEffect(() => {
        fetchProduct(id, gapi);
    }, [fetchProduct, id]);


    const refreshData = () => {
        setBarData(generateData());
        setLineData(Array.from({ length: Number(timeRange) }, (_, i) => ({
            date: `Day ${i + 1}`,
            likes: Math.floor(Math.random() * 1000),
            clicks: Math.floor(Math.random() * 500),
            purchases: Math.floor(Math.random() * 400)
        })));
    };

    const funnelColors = [
        "oklch(var(--er))",
        "oklch(var(--wa))",
        "oklch(var(--su))"
    ];

    const calculateFunnelData = () => {
        const totalImpressions = barData.reduce((acc, cur) => acc + cur.impressions, 0);
        const totalClicks = lineData.reduce((acc, cur) => acc + cur.clicks, 0);
        const totalPurchases = lineData.reduce((acc, cur) => acc + cur.purchases, 0);

        return [
            { name: 'Impressions', value: totalImpressions },
            { name: 'Clicks', value: totalClicks },
            { name: 'Purchases', value: totalPurchases }
        ];
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="alert alert-error">{error}</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    const calculateConversionRates = () => {
        const funnel = calculateFunnelData();
        const impressions = funnel[0].value;
        const clicks = funnel[1].value;
        const purchases = funnel[2].value;

        return {
            clickRate: impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : 0,
            purchaseRate: clicks > 0 ? ((purchases / clicks) * 100).toFixed(2) : 0,
            overallConversion: impressions > 0 ? ((purchases / impressions) * 100).toFixed(2) : 0
        };
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* ... existing header ... */}
            <button
                onClick={() => {
                    resetFormData();
                    navigate("/");
                }}
                className="btn btn-ghost mb-8"
            >
                <ArrowLeftIcon className="size-5 mr-2" />
                Back to Products
            </button>
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <h1 className="text-3xl font-bold">{product?.name} Analytics</h1>
                <div className="flex gap-2">
                    <select
                        className="select select-bordered"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                    >
                        <option value="7">Last 7 days</option>
                        <option value="14">Last 14 days</option>
                        <option value="30">Last 30 days</option>
                    </select>
                    <button
                        onClick={refreshData}
                        className="btn btn-primary gap-2"
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                </div>
            </div>
            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ... existing charts ... */}
                {/* Bar Chart */}
                <div className="card bg-base-100 p-4 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Platform Comparison</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="platform" />
                                <YAxis />
                                <Tooltip className="text-base-content" />
                                <Legend />
                                <Bar dataKey="likes"
                                    stroke={"oklch(var(--erc))"}
                                    fill={"oklch(var(--er))"}
                                />
                                <Bar dataKey="comments"
                                    stroke={"oklch(var(--wac))"}
                                    fill={"oklch(var(--wa))"}
                                />
                                <Bar dataKey="shares" fill={"oklch(var(--su))"}
                                    stroke='oklch(var(--suc))'
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Line Chart */}
                <div className="card bg-base-100 p-4 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Engagement Over Time</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="likes"
                                    strokeWidth={2}
                                    stroke={"oklch(var(--er))"}
                                    fill={"oklch(var(--erc))"}
                                />
                                <Line
                                    stroke={"oklch(var(--wa))"}
                                    fill={"oklch(var(--wac))"}
                                    type="monotone"
                                    dataKey="clicks"
                                    strokeWidth={2}
                                />
                                <Line
                                    fill={"oklch(var(--suc))"}
                                    stroke='oklch(var(--su))'
                                    type="monotone"
                                    dataKey="purchases"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="card bg-base-100 p-4 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Engagement Breakdown</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={barData}
                                    dataKey="likes"
                                    nameKey="platform"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    stroke={"oklch(var(--erc))"}
                                    fill={"oklch(var(--er))"}
                                    display={"likes"}
                                >
                                    {barData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={[
                                                "oklch(var(--in))",
                                                "oklch(var(--er))",
                                                "oklch(var(--a))"
                                            ][index % 3]}
                                            stroke={[
                                                "oklch(var(--inc))",
                                                "oklch(var(--erc))",
                                                "oklch(var(--ac))"
                                            ]}

                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomPieTooltip actualData={barData} />} />
                                <Legend
                                    formatter={(_, __, index) => (
                                        <span>
                                            {barData[index]?.platform} - {barData[index]?.likes.toLocaleString()}
                                        </span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {/* Funnel Chart */}
                <div className="card bg-base-100 p-4 shadow-sm md:col-span-2">
                    <h2 className="text-xl font-semibold mb-2">Conversion Funnel</h2>
                    <Link
                        to="/info/charts-learn-more"
                        className="group flex items-center space-x-1.5 transition-all duration-300 hover:opacity-80 mb-2"
                        // onClick={(e) => {
                        //     e.preventDefault();
                        //     navigate("/charts-learn-more");
                        // }}
                    >
                        <span className="relative font-medium text-primary/90 transition-all duration-300 before:absolute before:-bottom-0.5 before:left-0 before:h-px before:w-0 before:bg-primary/80 before:transition-all before:duration-300 group-hover:before:w-full">
                            Funnel Insights Guide
                        </span>
                        <div className="relative -mr-1.5 mt-0.5">
                            <ArrowRightIcon className="h-4 w-4 translate-x-0 text-primary/80 transition-all duration-300 group-hover:translate-x-1" />
                            <ArrowRightIcon className="absolute -right-1.5 top-0 h-4 w-4 text-primary/30 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-0" />
                        </div>
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <select
                            className="select select-bordered select-sm"
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <option value="7">Last 7 days</option>
                            <option value="14">Last 14 days</option>
                            <option value="30">Last 30 days</option>
                        </select>
                        <div className="text-sm">
                            Filtering by: {timeRange} days
                        </div>
                    </div>
                    <div className="h-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <FunnelChart
                                data={calculateFunnelData()}
                                colors={funnelColors}
                            />
                            <div className="mt-8">
                                <div className="stats stats-vertical md:stats-horizontal shadow w-full">
                                    {calculateFunnelData().map((stage, index) => (
                                        <div
                                            key={stage.name}
                                            className="stat"
                                            style={{ borderLeft: `4px solid ${funnelColors[index]}` }}
                                        >
                                            <div className="stat-title">{stage.name}</div>
                                            <div className="stat-value">{stage.value.toLocaleString()}</div>
                                            {index > 0 && (
                                                <div className="stat-desc">
                                                    {calculateConversionRates()[index === 1 ? 'clickRate' : 'purchaseRate']}%
                                                    conversion from {calculateFunnelData()[index - 1].name}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <div className="stat">
                                        <div className="stat-title">Overall Conversion</div>
                                        <div className="stat-value text-primary">
                                            {calculateConversionRates().overallConversion}%
                                        </div>
                                        <div className="stat-desc">
                                            From {calculateFunnelData()[0].name} to {calculateFunnelData()[2].name}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;