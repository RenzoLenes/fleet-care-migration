// Common types used across the application

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  created_at: string;
}

export interface DataSimulationConfig {
  vehicles: Array<string>;
  interval: number; // in seconds
  duration: number; // in seconds
  errorProbability?: number; // 0 to 1 - Probability multiplier for errors/alerts (0 = no errors, 1 = maximum errors)
}

export interface Vehicle {
  id: string;
  tenant_id: string;
  vehicle_id: string;
  plate: string;
  model: string;
  year: number;
  status: 'active' | 'maintenance' | 'critical' | 'inactive';
  driver?: string;
  route?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  mileage?: number;
  created_at: string;
  updated_at: string;
}

export interface VehicleIoTData {
  id?: string;
  tenant_id: string;
  vehicle_id: string;
  timestamp: string;
  rpm?: number;
  speed?: number;
  engine_temp?: number;
  battery_voltage?: number;
  fuel_level?: number;
  brake_status?: string;
  dtc_codes?: string[];
  gps?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  created_at?: string;
}

export interface Alert {
  id: string;
  tenant_id: string;
  vehicle_id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  alert_type: string;
  description: string;
  recommendation: string;
  status: 'pending' | 'acknowledged' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
}

export interface AlertStats {
  critical: number;
  medium: number;
  pending: number;
  resolvedToday: number;
  totalActive: number;
}

export interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  criticalAlerts: number;
  maintenanceDue: number;
  avgUptime: number;
}

export interface SimulationState {
  active: boolean;
  activeSensors: number;
  totalSensors: number;
  connectionProgress: number;
  isConnecting: boolean;
  dataFlow: boolean;
  lastUpdate?: string | null;
}

// Payload types for n8n webhook
export interface N8nVehicleDataPayload {
  tenant_id: string;
  vehicle_id: string;
  timestamp: string;
  data: {
    rpm: number;
    engine_temp: number;
    battery_voltage: number;
    speed: number;
    fuel_level: number;
    dtc_codes: string[];
    brake_status: string;
    gps?: {
      lat: number;
      lng: number;
    };
  };
}

// WebSocket message types
export interface WSMessage {
  type: 'vehicle_data' | 'alert' | 'simulation_status' | 'error';
  payload: unknown;
  timestamp: string;
}

// Store action types
export interface StoreActions<T> {
  reset: () => void;
  hydrate: (state: Partial<T>) => void;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}