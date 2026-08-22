import { User, Device, PairingCode, AuthToken } from '../types/index';
declare class APIClient {
    private client;
    constructor();
    getHealth(): Promise<import("axios").AxiosResponse<any, any, {}, any>>;
    register(email: string, password: string, fullName: string): Promise<User>;
    login(email: string, password: string): Promise<AuthToken>;
    getCurrentUser(): Promise<User>;
    logout(): Promise<void>;
    getDevices(): Promise<Device[]>;
    createDevice(device: Partial<Device>): Promise<Device>;
    updateDevice(deviceId: number, updates: Partial<Device>): Promise<Device>;
    deleteDevice(deviceId: number): Promise<void>;
    requestPairingCode(): Promise<PairingCode>;
    confirmPairing(pairingCode: string, deviceData: any): Promise<any>;
    submitTelemetry(metrics: any): Promise<any>;
    getCurrentTelemetry(): Promise<any>;
    getTelemetryHistory(deviceId: number, hours?: number): Promise<any>;
    getDailyAnalytics(deviceId: number, days?: number): Promise<any>;
    getPredictions(): Promise<any>;
    getAnomalies(): Promise<any>;
    getRecommendations(): Promise<any>;
    getAlerts(): Promise<any>;
    resolveAlert(alertId: number): Promise<any>;
}
export declare const api: APIClient;
export {};
//# sourceMappingURL=api.d.ts.map