import { z } from 'zod';

// Vehicle schemas
export const vehicleSchema = z.object({
  id: z.string().uuid().optional(),
  tenant_id: z.string().uuid(),
  vehicle_id: z.string().min(1, 'Vehicle ID is required'),
  plate: z.string().min(1, 'Plate is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900).max(2030),
  status: z.enum(['active', 'maintenance', 'critical', 'inactive']),
  driver: z.string().optional(),
  route: z.string().optional(),
  last_maintenance: z.string().optional(),
  next_maintenance: z.string().optional(),
  mileage: z.number().min(0).optional(),
});

// IoT Data schemas
export const gpsSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().min(0).optional(),
});

export const vehicleIoTDataSchema = z.object({
  tenant_id: z.string().uuid(),
  vehicle_id: z.string().min(1),
  timestamp: z.string().datetime(),
  rpm: z.number().min(0).max(10000).optional(),
  speed: z.number().min(0).max(200).optional(),
  engine_temp: z.number().min(-50).max(200).optional(),
  battery_voltage: z.number().min(0).max(24).optional(),
  fuel_level: z.number().min(0).max(100).optional(),
  brake_status: z.enum(['normal', 'warning', 'critical']).optional(),
  dtc_codes: z.array(z.string()).optional(),
  gps: gpsSchema.optional(),
});

// N8n webhook payload schema
export const n8nVehicleDataPayloadSchema = z.object({
  tenant_id: z.string().uuid(),
  vehicle_id: z.string().min(1),
  timestamp: z.string().datetime(),
  data: z.object({
    rpm: z.number().min(0).max(10000),
    engine_temp: z.number().min(-50).max(200),
    battery_voltage: z.number().min(0).max(24),
    speed: z.number().min(0).max(200),
    fuel_level: z.number().min(0).max(100),
    dtc_codes: z.array(z.string()),
    brake_status: z.enum(['normal', 'warning', 'critical']),
    gps: gpsSchema.optional(),
  }),
});

// Alert schemas
export const alertSchema = z.object({
  id: z.string().uuid().optional(),
  tenant_id: z.string().uuid(),
  vehicle_id: z.string().min(1),
  timestamp: z.string().datetime(),
  severity: z.enum(['low', 'medium', 'high']),
  alert_type: z.string().min(1),
  description: z.string().min(1),
  recommendation: z.string().min(1),
  status: z.enum(['pending', 'acknowledged', 'in_progress', 'resolved']),
});

export const updateAlertSchema = z.object({
  status: z.enum(['pending', 'acknowledged', 'in_progress', 'resolved']).optional(),
  recommendation: z.string().optional(),
});

// Simulation schemas
export const simulationRequestSchema = z.object({
  status: z.enum(['activado', 'desactivado']),
  sensor_count: z.number().min(0).max(1000).optional(),
  tenant: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    phone_number: z.string(),
    created_at: z.string(),
  }),
});

// WebSocket message schema
export const wsMessageSchema = z.object({
  type: z.enum(['vehicle_data', 'alert', 'simulation_status', 'error']),
  payload: z.any(),
  timestamp: z.string().datetime(),
});

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const alertFiltersSchema = z.object({
  severity: z.enum(['low', 'medium', 'high', 'all']).default('all'),
  status: z.enum(['pending', 'acknowledged', 'in_progress', 'resolved', 'all']).default('all'),
  vehicle_id: z.string().optional(),
}).merge(paginationSchema);

export const vehicleFiltersSchema = z.object({
  status: z.enum(['active', 'maintenance', 'critical', 'inactive', 'all']).default('all'),
  search: z.string().optional(),
}).merge(paginationSchema);

// Validation helper functions
export const validateOrThrow = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.message}`);
  }
  return result.data;
};

export const validateOrNull = <T>(schema: z.ZodSchema<T>, data: unknown): T | null => {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
};