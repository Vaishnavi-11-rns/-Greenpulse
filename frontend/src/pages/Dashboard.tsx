import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, Plus, Leaf, Zap, Gauge, BatteryCharging, ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Device } from '../types/index';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

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
    } catch (error) {
      console.error('Failed to load devices', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTelemetry = async () => {
    if (!selectedDevice) return;
    try {
      const response = await api.getTelemetryHistory(selectedDevice.id, 1);
      if (response.records.length > 0) {
        setHistory(response.records);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to load telemetry', error);
    }
  };

  const loadAnalytics = async () => {
    if (!selectedDevice) return;
    try {
      const response = await api.getDailyAnalytics(selectedDevice.id, 7);
      setAnalytics(response);
    } catch (error) {
      console.error('Failed to load analytics', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen dashboard-bg">
        <div className="animate-spin">
          <div className="h-12 w-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full"></div>
        </div>
      </div>
    );
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

  return (
    <div className="min-h-screen dashboard-bg text-white">
      <div className="floating-orb orb-one" />
      <div className="floating-orb orb-two" />
      <div className="floating-orb orb-three" />

      <nav className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10 bg-sky-950/35">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-400/20 border border-emerald-300/30">
              <Leaf className="w-5 h-5 text-emerald-300" />
            </div>
            <h1 className="text-2xl font-bold text-white">GreenPulse</h1>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sky-100/80 hidden sm:inline">{user?.full_name}</span>
            <button onClick={() => navigate('/devices')} className="nav-button" aria-label="Settings">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} className="nav-button danger" aria-label="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="dashboard-hero mb-8">
          <div className="hero-copy">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-300/25 text-emerald-200 text-sm font-medium mb-4">
              <Leaf className="w-4 h-4" />
              Live energy intelligence
            </div>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-3">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.full_name?.split(' ')[0] || 'friend'}
            </h2>
            <p className="text-sky-100/70 max-w-xl mb-6">
              Your device footprint is staying efficient. Track CO₂ impact, power draw, and clean energy usage in real time.
            </p>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate('/pair-device')} className="primary-btn">
                <Plus className="w-4 h-4" /> Connect Device
              </button>
              <button className="secondary-btn">
                View report <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-card">
              <div className="hero-image" />
              <div className="hero-card-badge">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                {selectedDevice?.device_name || 'Laptop'}
              </div>
              <div className="hero-mini-metric">
                <div>
                  <p className="text-xs text-sky-100/70">Carbon saved</p>
                  <p className="text-2xl font-bold text-white">18.4%</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-8 flex flex-wrap items-center gap-3">
          {devices.map((device) => (
            <button
              key={device.id}
              onClick={() => setSelectedDevice(device)}
              className={`device-pill ${selectedDevice?.id === device.id ? 'active' : ''}`}
            >
              {device.device_name}
              <span className={`dot ${device.is_active ? 'online' : 'offline'}`} />
            </button>
          ))}
        </div>

        {!selectedDevice ? (
          <div className="text-center py-12 rounded-3xl border border-white/10 bg-sky-950/20 backdrop-blur-sm">
            <p className="text-sky-100/80 text-lg mb-4">No devices connected</p>
            <button onClick={() => navigate('/pair-device')} className="primary-btn">Connect Your Laptop</button>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              {metricCards.map(({ label, value, unit, icon: Icon, color }) => (
                <div key={label} className={`metric-card ${color}`}>
                  <div className="metric-header">
                    <span className="metric-label">{label}</span>
                    <div className="metric-icon-wrap">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="metric-value">
                    {Number(value).toFixed(1)}
                    <span>{unit}</span>
                  </div>
                  <div className="metric-trend positive">
                    <ArrowUpRight className="w-3 h-3" /> 12.4%
                  </div>
                </div>
              ))}
            </section>

            {latestTelemetry?.battery_percent !== null && latestTelemetry?.battery_percent !== undefined && (
              <section className="panel mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Battery health</h3>
                  <span className={`status-badge ${latestTelemetry.is_charging ? 'success' : 'warning'}`}>
                    {latestTelemetry.is_charging ? 'Charging' : 'Discharging'}
                  </span>
                </div>
                <div className="w-full bg-sky-900/80 rounded-full h-3 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-green-400 to-cyan-400 transition-all duration-300" style={{ width: `${latestTelemetry.battery_percent}%` }} />
                </div>
                <p className="mt-3 text-sky-100/70 text-sm">{latestTelemetry.battery_percent}% remaining</p>
              </section>
            )}

            <section className="grid xl:grid-cols-2 gap-6 mb-8">
              <div className="panel">
                <div className="panel-header">
                  <h3>Power usage</h3>
                  <span>Live</span>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData}>
                    <CartesianGrid stroke="rgba(148, 163, 184, 0.18)" strokeDasharray="5 5" />
                    <XAxis dataKey="timestamp" stroke="#bfdbfe" tickLine={false} axisLine={false} />
                    <YAxis stroke="#bfdbfe" tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#082f49', border: '1px solid rgba(125,211,252,0.25)', borderRadius: 12 }} />
                    <Line type="monotone" dataKey="estimated_power_w" stroke="#34d399" strokeWidth={3} dot={{ r: 3, fill: '#34d399' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <h3>Estimated carbon impact</h3>
                  <span>7 days</span>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={analytics?.analytics || [
                    { date: 'Mon', co2e_g: 18 },
                    { date: 'Tue', co2e_g: 22 },
                    { date: 'Wed', co2e_g: 19 },
                    { date: 'Thu', co2e_g: 25 },
                    { date: 'Fri', co2e_g: 17 },
                    { date: 'Sat', co2e_g: 20 },
                  ]}>
                    <CartesianGrid stroke="rgba(148, 163, 184, 0.18)" strokeDasharray="5 5" />
                    <XAxis dataKey="date" stroke="#bfdbfe" tickLine={false} axisLine={false} />
                    <YAxis stroke="#bfdbfe" tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#082f49', border: '1px solid rgba(125,211,252,0.25)', borderRadius: 12 }} />
                    <Bar dataKey="co2e_g" radius={[10, 10, 0, 0]} fill="url(#carbonBarGradient)" />
                    <defs>
                      <linearGradient id="carbonBarGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#7dd3fc" />
                        <stop offset="100%" stopColor="#34d399" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <h3>Eco summary</h3>
                <span>Updated {lastUpdate?.toLocaleTimeString() || 'just now'}</span>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="mini-card">
                  <p className="text-sky-100/70 text-sm">Carbon saved</p>
                  <strong className="text-2xl text-white">18.4%</strong>
                </div>
                <div className="mini-card">
                  <p className="text-sky-100/70 text-sm">Grid efficiency</p>
                  <strong className="text-2xl text-white">91.2%</strong>
                </div>
                <div className="mini-card">
                  <p className="text-sky-100/70 text-sm">Renewables</p>
                  <strong className="text-2xl text-white">64%</strong>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
