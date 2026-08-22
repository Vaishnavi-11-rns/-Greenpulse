import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, Plus, Leaf, Zap, Gauge, BatteryCharging, ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
export default function Dashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [history, setHistory] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);
    useEffect(() => {
        loadDevices();
    }, []);
    useEffect(() => {
        if (selectedDevice) {
            loadTelemetry();
            loadAnalytics();
            const interval = setInterval(loadTelemetry, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedDevice]);
    const loadDevices = async () => {
        try {
            const deviceList = await api.getDevices();
            setDevices(deviceList);
            if (deviceList.length > 0) {
                setSelectedDevice(deviceList[0]);
            }
        }
        catch (error) {
            console.error('Failed to load devices', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const loadTelemetry = async () => {
        if (!selectedDevice)
            return;
        try {
            const response = await api.getTelemetryHistory(selectedDevice.id, 1);
            if (response.records.length > 0) {
                setHistory(response.records);
                setLastUpdate(new Date());
            }
        }
        catch (error) {
            console.error('Failed to load telemetry', error);
        }
    };
    const loadAnalytics = async () => {
        if (!selectedDevice)
            return;
        try {
            const response = await api.getDailyAnalytics(selectedDevice.id, 7);
            setAnalytics(response);
        }
        catch (error) {
            console.error('Failed to load analytics', error);
        }
    };
    const handleLogout = () => {
        logout();
        navigate('/');
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center h-screen dashboard-bg", children: _jsx("div", { className: "animate-spin", children: _jsx("div", { className: "h-12 w-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full" }) }) }));
    }
    const latestTelemetry = history[history.length - 1];
    const metricCards = [
        { label: 'CPU', value: latestTelemetry?.cpu_usage_percent ?? 0, unit: '%', icon: Gauge, color: 'cyan' },
        { label: 'RAM', value: latestTelemetry?.ram_usage_percent ?? 0, unit: '%', icon: Zap, color: 'purple' },
        { label: 'Power', value: latestTelemetry?.estimated_power_w ?? 0, unit: 'W', icon: BatteryCharging, color: 'amber' },
        { label: 'CO₂e', value: Math.round((latestTelemetry?.estimated_co2e_g ?? 0) * 10) / 10, unit: 'g/min', icon: Leaf, color: 'green' }
    ];
    const chartData = history.length > 0 ? history : [
        { timestamp: 'Mon', estimated_power_w: 42, estimated_co2e_g: 18 },
        { timestamp: 'Tue', estimated_power_w: 55, estimated_co2e_g: 24 },
        { timestamp: 'Wed', estimated_power_w: 48, estimated_co2e_g: 20 },
        { timestamp: 'Thu', estimated_power_w: 58, estimated_co2e_g: 28 },
        { timestamp: 'Fri', estimated_power_w: 52, estimated_co2e_g: 25 },
        { timestamp: 'Sat', estimated_power_w: 46, estimated_co2e_g: 19 },
    ];
    return (_jsxs("div", { className: "min-h-screen dashboard-bg text-white", children: [_jsx("div", { className: "floating-orb orb-one" }), _jsx("div", { className: "floating-orb orb-two" }), _jsx("div", { className: "floating-orb orb-three" }), _jsx("nav", { className: "sticky top-0 z-40 backdrop-blur-xl border-b border-white/10 bg-sky-950/35", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 rounded-xl bg-emerald-400/20 border border-emerald-300/30", children: _jsx(Leaf, { className: "w-5 h-5 text-emerald-300" }) }), _jsx("h1", { className: "text-2xl font-bold text-white", children: "GreenPulse" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("span", { className: "text-sky-100/80 hidden sm:inline", children: user?.full_name }), _jsx("button", { onClick: () => navigate('/devices'), className: "nav-button", "aria-label": "Settings", children: _jsx(Settings, { className: "w-4 h-4" }) }), _jsx("button", { onClick: handleLogout, className: "nav-button danger", "aria-label": "Logout", children: _jsx(LogOut, { className: "w-4 h-4" }) })] })] }) }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("section", { className: "dashboard-hero mb-8", children: [_jsxs("div", { className: "hero-copy", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-300/25 text-emerald-200 text-sm font-medium mb-4", children: [_jsx(Leaf, { className: "w-4 h-4" }), "Live energy intelligence"] }), _jsxs("h2", { className: "text-3xl md:text-5xl font-bold leading-tight mb-3", children: ["Good ", new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening', ", ", user?.full_name?.split(' ')[0] || 'friend'] }), _jsx("p", { className: "text-sky-100/70 max-w-xl mb-6", children: "Your device footprint is staying efficient. Track CO\u2082 impact, power draw, and clean energy usage in real time." }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsxs("button", { onClick: () => navigate('/pair-device'), className: "primary-btn", children: [_jsx(Plus, { className: "w-4 h-4" }), " Connect Device"] }), _jsxs("button", { className: "secondary-btn", children: ["View report ", _jsx(ArrowUpRight, { className: "w-4 h-4" })] })] })] }), _jsx("div", { className: "hero-visual", children: _jsxs("div", { className: "hero-image-card", children: [_jsx("div", { className: "hero-image" }), _jsxs("div", { className: "hero-card-badge", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400 inline-block" }), selectedDevice?.device_name || 'Laptop'] }), _jsx("div", { className: "hero-mini-metric", children: _jsxs("div", { children: [_jsx("p", { className: "text-xs text-sky-100/70", children: "Carbon saved" }), _jsx("p", { className: "text-2xl font-bold text-white", children: "18.4%" })] }) })] }) })] }), _jsx("div", { className: "mb-8 flex flex-wrap items-center gap-3", children: devices.map((device) => (_jsxs("button", { onClick: () => setSelectedDevice(device), className: `device-pill ${selectedDevice?.id === device.id ? 'active' : ''}`, children: [device.device_name, _jsx("span", { className: `dot ${device.is_active ? 'online' : 'offline'}` })] }, device.id))) }), !selectedDevice ? (_jsxs("div", { className: "text-center py-12 rounded-3xl border border-white/10 bg-sky-950/20 backdrop-blur-sm", children: [_jsx("p", { className: "text-sky-100/80 text-lg mb-4", children: "No devices connected" }), _jsx("button", { onClick: () => navigate('/pair-device'), className: "primary-btn", children: "Connect Your Laptop" })] })) : (_jsxs(_Fragment, { children: [_jsx("section", { className: "grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8", children: metricCards.map(({ label, value, unit, icon: Icon, color }) => (_jsxs("div", { className: `metric-card ${color}`, children: [_jsxs("div", { className: "metric-header", children: [_jsx("span", { className: "metric-label", children: label }), _jsx("div", { className: "metric-icon-wrap", children: _jsx(Icon, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "metric-value", children: [Number(value).toFixed(1), _jsx("span", { children: unit })] }), _jsxs("div", { className: "metric-trend positive", children: [_jsx(ArrowUpRight, { className: "w-3 h-3" }), " 12.4%"] })] }, label))) }), latestTelemetry?.battery_percent !== null && latestTelemetry?.battery_percent !== undefined && (_jsxs("section", { className: "panel mb-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-xl font-semibold text-white", children: "Battery health" }), _jsx("span", { className: `status-badge ${latestTelemetry.is_charging ? 'success' : 'warning'}`, children: latestTelemetry.is_charging ? 'Charging' : 'Discharging' })] }), _jsx("div", { className: "w-full bg-sky-900/80 rounded-full h-3 overflow-hidden", children: _jsx("div", { className: "h-full rounded-full bg-gradient-to-r from-emerald-400 via-green-400 to-cyan-400 transition-all duration-300", style: { width: `${latestTelemetry.battery_percent}%` } }) }), _jsxs("p", { className: "mt-3 text-sky-100/70 text-sm", children: [latestTelemetry.battery_percent, "% remaining"] })] })), _jsxs("section", { className: "grid xl:grid-cols-2 gap-6 mb-8", children: [_jsxs("div", { className: "panel", children: [_jsxs("div", { className: "panel-header", children: [_jsx("h3", { children: "Power usage" }), _jsx("span", { children: "Live" })] }), _jsx(ResponsiveContainer, { width: "100%", height: 280, children: _jsxs(LineChart, { data: chartData, children: [_jsx(CartesianGrid, { stroke: "rgba(148, 163, 184, 0.18)", strokeDasharray: "5 5" }), _jsx(XAxis, { dataKey: "timestamp", stroke: "#bfdbfe", tickLine: false, axisLine: false }), _jsx(YAxis, { stroke: "#bfdbfe", tickLine: false, axisLine: false }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#082f49', border: '1px solid rgba(125,211,252,0.25)', borderRadius: 12 } }), _jsx(Line, { type: "monotone", dataKey: "estimated_power_w", stroke: "#34d399", strokeWidth: 3, dot: { r: 3, fill: '#34d399' } })] }) })] }), _jsxs("div", { className: "panel", children: [_jsxs("div", { className: "panel-header", children: [_jsx("h3", { children: "Estimated carbon impact" }), _jsx("span", { children: "7 days" })] }), _jsx(ResponsiveContainer, { width: "100%", height: 280, children: _jsxs(BarChart, { data: analytics?.analytics || [
                                                        { date: 'Mon', co2e_g: 18 },
                                                        { date: 'Tue', co2e_g: 22 },
                                                        { date: 'Wed', co2e_g: 19 },
                                                        { date: 'Thu', co2e_g: 25 },
                                                        { date: 'Fri', co2e_g: 17 },
                                                        { date: 'Sat', co2e_g: 20 },
                                                    ], children: [_jsx(CartesianGrid, { stroke: "rgba(148, 163, 184, 0.18)", strokeDasharray: "5 5" }), _jsx(XAxis, { dataKey: "date", stroke: "#bfdbfe", tickLine: false, axisLine: false }), _jsx(YAxis, { stroke: "#bfdbfe", tickLine: false, axisLine: false }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#082f49', border: '1px solid rgba(125,211,252,0.25)', borderRadius: 12 } }), _jsx(Bar, { dataKey: "co2e_g", radius: [10, 10, 0, 0], fill: "url(#carbonBarGradient)" }), _jsx("defs", { children: _jsxs("linearGradient", { id: "carbonBarGradient", x1: "0", x2: "0", y1: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "#7dd3fc" }), _jsx("stop", { offset: "100%", stopColor: "#34d399" })] }) })] }) })] })] }), _jsxs("section", { className: "panel", children: [_jsxs("div", { className: "panel-header", children: [_jsx("h3", { children: "Eco summary" }), _jsxs("span", { children: ["Updated ", lastUpdate?.toLocaleTimeString() || 'just now'] })] }), _jsxs("div", { className: "grid md:grid-cols-3 gap-4 mt-4", children: [_jsxs("div", { className: "mini-card", children: [_jsx("p", { className: "text-sky-100/70 text-sm", children: "Carbon saved" }), _jsx("strong", { className: "text-2xl text-white", children: "18.4%" })] }), _jsxs("div", { className: "mini-card", children: [_jsx("p", { className: "text-sky-100/70 text-sm", children: "Grid efficiency" }), _jsx("strong", { className: "text-2xl text-white", children: "91.2%" })] }), _jsxs("div", { className: "mini-card", children: [_jsx("p", { className: "text-sky-100/70 text-sm", children: "Renewables" }), _jsx("strong", { className: "text-2xl text-white", children: "64%" })] })] })] })] }))] })] }));
}
//# sourceMappingURL=Dashboard.js.map