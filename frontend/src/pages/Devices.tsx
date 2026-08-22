import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2 } from 'lucide-react';
import { api } from '../services/api';
import { Device } from '../types/index';

export default function Devices() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const deviceList = await api.getDevices();
      setDevices(deviceList);
    } catch (error) {
      console.error('Failed to load devices', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDevice = async (deviceId: number) => {
    if (window.confirm('Are you sure you want to disconnect this device?')) {
      try {
        await api.deleteDevice(deviceId);
        setDevices(devices.filter(d => d.id !== deviceId));
        setSelectedDevice(null);
      } catch (error) {
        console.error('Failed to delete device', error);
      }
    }
  };

  const handleUpdateDevice = async (deviceId: number) => {
    if (editingName.trim()) {
      try {
        await api.updateDevice(deviceId, { device_name: editingName });
        loadDevices();
        setSelectedDevice(null);
        setEditingName('');
      } catch (error) {
        console.error('Failed to update device', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-slate-800 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-white">Device Management</h1>
          <div className="w-20"></div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Devices List */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Connected Devices</h2>
                <button
                  onClick={() => navigate('/pair-device')}
                  className="p-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition text-white"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {isLoading ? (
                  <p className="text-slate-400 text-center py-4">Loading devices...</p>
                ) : devices.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">No devices connected</p>
                ) : (
                  devices.map((device) => (
                    <button
                      key={device.id}
                      onClick={() => setSelectedDevice(device)}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        selectedDevice?.id === device.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <p className="font-medium">{device.device_name}</p>
                      <p className="text-sm opacity-75">{device.os_name}</p>
                      <p className={`text-xs mt-1 ${device.is_active ? 'text-green-400' : 'text-red-400'}`}>
                        {device.is_active ? '🟢 Online' : '🔴 Offline'}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Device Details */}
          <div className="lg:col-span-2">
            {selectedDevice ? (
              <div className="space-y-4">
                <div className="card">
                  <h2 className="text-2xl font-bold text-white mb-6">{selectedDevice.device_name}</h2>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Device Name</label>
                      {editingName !== '' ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="input-field flex-1"
                          />
                          <button
                            onClick={() => handleUpdateDevice(selectedDevice.id)}
                            className="btn-primary px-4"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingName('')}
                            className="btn-secondary px-4"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                          <span className="text-white">{selectedDevice.device_name}</span>
                          <button
                            onClick={() => setEditingName(selectedDevice.device_name)}
                            className="p-2 hover:bg-slate-700 rounded transition"
                          >
                            <Edit2 className="w-4 h-4 text-slate-400" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Operating System</label>
                      <div className="p-3 bg-slate-800 rounded-lg text-white">
                        {selectedDevice.os_name} {selectedDevice.os_version}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">CPU</label>
                      <div className="p-3 bg-slate-800 rounded-lg text-white text-sm">
                        {selectedDevice.cpu_model}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">GPU</label>
                      <div className="p-3 bg-slate-800 rounded-lg text-white text-sm">
                        {selectedDevice.gpu_model || 'Integrated Graphics'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Total RAM</label>
                      <div className="p-3 bg-slate-800 rounded-lg text-white">
                        {selectedDevice.total_ram_gb} GB
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                      <div className={`p-3 rounded-lg font-medium ${
                        selectedDevice.is_active
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {selectedDevice.is_active ? '🟢 Connected' : '🔴 Disconnected'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Last Seen</label>
                      <div className="p-3 bg-slate-800 rounded-lg text-white text-sm">
                        {new Date(selectedDevice.last_seen).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteDevice(selectedDevice.id)}
                    className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Disconnect Device
                  </button>
                </div>
              </div>
            ) : (
              <div className="card h-96 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-slate-400 text-lg mb-4">Select a device to view details</p>
                  <button
                    onClick={() => navigate('/pair-device')}
                    className="btn-primary"
                  >
                    Connect New Device
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
