export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface Device {
  id: number;
  user_id: number;
  device_name: string;
  device_id: string;
  os_name: string;
  os_version: string;
  cpu_model: string;
  gpu_model?: string;
  total_ram_gb: number;
  is_active: boolean;
  last_seen: string;
  created_at: string;
}

export interface Telemetry {
  id: number;
  timestamp: string;
  cpu_usage_percent: number;
  gpu_usage_percent?: number;
  ram_usage_percent: number;
  ram_used_gb: number;
  ram_available_gb: number;
  battery_percent?: number;
  is_charging?: boolean;
  estimated_power_w: number;
  estimated_co2e_g: number;
}

export interface Prediction {
  id: number;
  prediction_type: string;
  predicted_value: number;
  confidence_percent: number;
  time_window_minutes: number;
  model_type: string;
  mae?: number;
  rmse?: number;
  r2_score?: number;
  created_at: string;
}

export interface Anomaly {
  id: number;
  anomaly_type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  value: number;
  baseline: number;
  deviation_percent: number;
  is_resolved: boolean;
  created_at: string;
}

export interface Recommendation {
  id: number;
  category: string;
  title: string;
  description: string;
  reason: string;
  action: string;
  estimated_saving_percent?: number;
  estimated_saving_g_co2e?: number;
  is_dismissed: boolean;
  created_at: string;
}

export interface Alert {
  id: number;
  alert_type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  recommended_action?: string;
  is_resolved: boolean;
  created_at: string;
}

export interface PairingCode {
  code: string;
  expires_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}
