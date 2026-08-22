import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2 } from 'lucide-react';
import { api } from '../services/api';
export default function Devices() {
    const navigate = useNavigate();
    const [devices, setDevices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [editingName, setEditingName] = useState('');
    useEffect(() => {
        loadDevices();
    }, []);
    const loadDevices = async () => {
        try {
            const deviceList = await api.getDevices();
            setDevices(deviceList);
        }
        catch (error) {
            console.error('Failed to load devices', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleDeleteDevice = async (deviceId) => {
        if (window.confirm('Are you sure you want to disconnect this device?')) {
            try {
                await api.deleteDevice(deviceId);
                setDevices(devices.filter(d => d.id !== deviceId));
                setSelectedDevice(null);
            }
            catch (error) {
                console.error('Failed to delete device', error);
            }
        }
    };
    const handleUpdateDevice = async (deviceId) => {
        if (editingName.trim()) {
            try {
                await api.updateDevice(deviceId, { device_name: editingName });
                loadDevices();
                setSelectedDevice(null);
                setEditingName('');
            }
            catch (error) {
                console.error('Failed to update device', error);
            }
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950", children: [_jsx("nav", { className: "sticky top-0 z-40 border-b border-slate-800 bg-black/40 backdrop-blur-xl", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16", children: [_jsxs("button", { onClick: () => navigate('/dashboard'), className: "flex items-center gap-2 text-slate-400 hover:text-white transition", children: [_jsx(ArrowLeft, { className: "w-5 h-5" }), "Back to Dashboard"] }), _jsx("h1", { className: "text-2xl font-bold text-white", children: "Device Management" }), _jsx("div", { className: "w-20" })] }) }), _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsx("div", { className: "lg:col-span-1", children: _jsxs("div", { className: "card", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-white", children: "Connected Devices" }), _jsx("button", { onClick: () => navigate('/pair-device'), className: "p-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition text-white", children: _jsx(Plus, { className: "w-5 h-5" }) })] }), _jsx("div", { className: "space-y-2", children: isLoading ? (_jsx("p", { className: "text-slate-400 text-center py-4", children: "Loading devices..." })) : devices.length === 0 ? (_jsx("p", { className: "text-slate-400 text-center py-4", children: "No devices connected" })) : (devices.map((device) => (_jsxs("button", { onClick: () => setSelectedDevice(device), className: `w-full text-left p-3 rounded-lg transition ${selectedDevice?.id === device.id
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`, children: [_jsx("p", { className: "font-medium", children: device.device_name }), _jsx("p", { className: "text-sm opacity-75", children: device.os_name }), _jsx("p", { className: `text-xs mt-1 ${device.is_active ? 'text-green-400' : 'text-red-400'}`, children: device.is_active ? '🟢 Online' : '🔴 Offline' })] }, device.id)))) })] }) }), _jsx("div", { className: "lg:col-span-2", children: selectedDevice ? (_jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "card", children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-6", children: selectedDevice.device_name }), _jsxs("div", { className: "space-y-4 mb-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-400 mb-2", children: "Device Name" }), editingName !== '' ? (_jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: editingName, onChange: (e) => setEditingName(e.target.value), className: "input-field flex-1" }), _jsx("button", { onClick: () => handleUpdateDevice(selectedDevice.id), className: "btn-primary px-4", children: "Save" }), _jsx("button", { onClick: () => setEditingName(''), className: "btn-secondary px-4", children: "Cancel" })] })) : (_jsxs("div", { className: "flex items-center justify-between p-3 bg-slate-800 rounded-lg", children: [_jsx("span", { className: "text-white", children: selectedDevice.device_name }), _jsx("button", { onClick: () => setEditingName(selectedDevice.device_name), className: "p-2 hover:bg-slate-700 rounded transition", children: _jsx(Edit2, { className: "w-4 h-4 text-slate-400" }) })] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-400 mb-2", children: "Operating System" }), _jsxs("div", { className: "p-3 bg-slate-800 rounded-lg text-white", children: [selectedDevice.os_name, " ", selectedDevice.os_version] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-400 mb-2", children: "CPU" }), _jsx("div", { className: "p-3 bg-slate-800 rounded-lg text-white text-sm", children: selectedDevice.cpu_model })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-400 mb-2", children: "GPU" }), _jsx("div", { className: "p-3 bg-slate-800 rounded-lg text-white text-sm", children: selectedDevice.gpu_model || 'Integrated Graphics' })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-400 mb-2", children: "Total RAM" }), _jsxs("div", { className: "p-3 bg-slate-800 rounded-lg text-white", children: [selectedDevice.total_ram_gb, " GB"] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-400 mb-2", children: "Status" }), _jsx("div", { className: `p-3 rounded-lg font-medium ${selectedDevice.is_active
                                                                ? 'bg-green-500/20 text-green-300'
                                                                : 'bg-red-500/20 text-red-300'}`, children: selectedDevice.is_active ? '🟢 Connected' : '🔴 Disconnected' })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-400 mb-2", children: "Last Seen" }), _jsx("div", { className: "p-3 bg-slate-800 rounded-lg text-white text-sm", children: new Date(selectedDevice.last_seen).toLocaleString() })] })] }), _jsxs("button", { onClick: () => handleDeleteDevice(selectedDevice.id), className: "w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2", children: [_jsx(Trash2, { className: "w-4 h-4" }), "Disconnect Device"] })] }) })) : (_jsx("div", { className: "card h-96 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-slate-400 text-lg mb-4", children: "Select a device to view details" }), _jsx("button", { onClick: () => navigate('/pair-device'), className: "btn-primary", children: "Connect New Device" })] }) })) })] }) })] }));
}
//# sourceMappingURL=Devices.js.map