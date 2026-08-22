import axios, { AxiosInstance } from 'axios';
import { User, Device, PairingCode, AuthToken } from '../types/index';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

class APIClient {
  private client: AxiosInstance;

  constructor() {
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
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Health
  async getHealth() {
    return this.client.get('/health');
  }

  // Authentication
  async register(email: string, password: string, fullName: string): Promise<User> {
    const response = await this.client.post<User>('/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthToken> {
    const response = await this.client.post<AuthToken>('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/auth/me');
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
  }

  // Devices
  async getDevices(): Promise<Device[]> {
    const response = await this.client.get<Device[]>('/devices');
    return response.data;
  }

  async createDevice(device: Partial<Device>): Promise<Device> {
    const response = await this.client.post<Device>('/devices', device);
    return response.data;
  }

  async updateDevice(deviceId: number, updates: Partial<Device>): Promise<Device> {
    const response = await this.client.put<Device>(`/devices/${deviceId}`, updates);
    return response.data;
  }

  async deleteDevice(deviceId: number): Promise<void> {
    await this.client.delete(`/devices/${deviceId}`);
  }

  // Device Pairing
  async requestPairingCode(): Promise<PairingCode> {
    const response = await this.client.post<PairingCode>('/pairing/request-code');
    return response.data;
  }

  async confirmPairing(pairingCode: string, deviceData: any): Promise<any> {
    const response = await this.client.post('/pairing/confirm', {
      pairing_code: pairingCode,
      ...deviceData,
    });
    return response.data;
  }

  // Telemetry
  async submitTelemetry(metrics: any): Promise<any> {
    const response = await this.client.post('/monitor/telemetry', metrics);
    return response.data;
  }

  async getCurrentTelemetry(): Promise<any> {
    const response = await this.client.get('/monitor/current');
    return response.data;
  }

  async getTelemetryHistory(deviceId: number, hours: number = 24): Promise<any> {
    const response = await this.client.get(`/monitor/history`, {
      params: { device_id: deviceId, hours },
    });
    return response.data;
  }

  // Analytics
  async getDailyAnalytics(deviceId: number, days: number = 7): Promise<any> {
    const response = await this.client.get('/analytics/daily', {
      params: { device_id: deviceId, days },
    });
    return response.data;
  }

  // Predictions
  async getPredictions(): Promise<any> {
    const response = await this.client.get('/predictions');
    return response.data;
  }

  // Anomalies
  async getAnomalies(): Promise<any> {
    const response = await this.client.get('/anomalies');
    return response.data;
  }

  // Recommendations
  async getRecommendations(): Promise<any> {
    const response = await this.client.get('/recommendations');
    return response.data;
  }

  // Alerts
  async getAlerts(): Promise<any> {
    const response = await this.client.get('/alerts');
    return response.data;
  }

  async resolveAlert(alertId: number): Promise<any> {
    const response = await this.client.put(`/alerts/${alertId}/resolve`);
    return response.data;
  }
}

export const api = new APIClient();
