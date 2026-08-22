import axios from 'axios';
const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000';
class APIClient {
    constructor() {
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        // Add token to requests
        this.client.interceptors.request.use((config) => {
            const token = localStorage.getItem('access_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
        // Handle responses
        this.client.interceptors.response.use((response) => response, (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        });
    }
    // Health
    async getHealth() {
        return this.client.get('/health');
    }
    // Authentication
    async register(email, password, fullName) {
        const response = await this.client.post('/auth/register', {
            email,
            password,
            full_name: fullName,
        });
        return response.data;
    }
    async login(email, password) {
        const response = await this.client.post('/auth/login', {
            email,
            password,
        });
        return response.data;
    }
    async getCurrentUser() {
        const response = await this.client.get('/auth/me');
        return response.data;
    }
    async logout() {
        await this.client.post('/auth/logout');
    }
    // Devices
    async getDevices() {
        const response = await this.client.get('/devices');
        return response.data;
    }
    async createDevice(device) {
        const response = await this.client.post('/devices', device);
        return response.data;
    }
    async updateDevice(deviceId, updates) {
        const response = await this.client.put(`/devices/${deviceId}`, updates);
        return response.data;
    }
    async deleteDevice(deviceId) {
        await this.client.delete(`/devices/${deviceId}`);
    }
    // Device Pairing
    async requestPairingCode() {
        const response = await this.client.post('/pairing/request-code');
        return response.data;
    }
    async confirmPairing(pairingCode, deviceData) {
        const response = await this.client.post('/pairing/confirm', {
            pairing_code: pairingCode,
            ...deviceData,
        });
        return response.data;
    }
    // Telemetry
    async submitTelemetry(metrics) {
        const response = await this.client.post('/monitor/telemetry', metrics);
        return response.data;
    }
    async getCurrentTelemetry() {
        const response = await this.client.get('/monitor/current');
        return response.data;
    }
    async getTelemetryHistory(deviceId, hours = 24) {
        const response = await this.client.get(`/monitor/history`, {
            params: { device_id: deviceId, hours },
        });
        return response.data;
    }
    // Analytics
    async getDailyAnalytics(deviceId, days = 7) {
        const response = await this.client.get('/analytics/daily', {
            params: { device_id: deviceId, days },
        });
        return response.data;
    }
    // Predictions
    async getPredictions() {
        const response = await this.client.get('/predictions');
        return response.data;
    }
    // Anomalies
    async getAnomalies() {
        const response = await this.client.get('/anomalies');
        return response.data;
    }
    // Recommendations
    async getRecommendations() {
        const response = await this.client.get('/recommendations');
        return response.data;
    }
    // Alerts
    async getAlerts() {
        const response = await this.client.get('/alerts');
        return response.data;
    }
    async resolveAlert(alertId) {
        const response = await this.client.put(`/alerts/${alertId}/resolve`);
        return response.data;
    }
}
export const api = new APIClient();
//# sourceMappingURL=api.js.map