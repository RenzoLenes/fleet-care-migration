import { pgTable, text, uuid, timestamp, integer, numeric, jsonb, varchar } from 'drizzle-orm/pg-core';

// Tabla tenants
export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone_number: varchar('phone_number', { length: 20 }).notNull(), // nuevo campo
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Tabla app_users
export const appUsers = pgTable('app_users', {
  id: text('id').primaryKey(),  // Clerk user ID (UUID string)
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Tabla vehicle_stats
export const vehicleStats = pgTable('vehicle_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  vehicle_id: text('vehicle_id').notNull(),
  timestamp: timestamp('timestamp').notNull(),
  rpm: integer('rpm'),
  speed: integer('speed'),
  engine_temp: integer('engine_temp'),
  dtc_codes: jsonb('dtc_codes'), // Usamos jsonb para array de strings
  battery_voltage: numeric('battery_voltage', { precision: 5, scale: 2 }),
  brake_status: text('brake_status'),
  fuel_level: integer('fuel_level'), // Porcentaje 0-100
  gps_lat: numeric('gps_lat', { precision: 10, scale: 7 }), // Latitud
  gps_lng: numeric('gps_lng', { precision: 10, scale: 7 }), // Longitud
  gps_accuracy: numeric('gps_accuracy', { precision: 6, scale: 2 }), // Precisión en metros
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Tabla alerts
export const alerts = pgTable('alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  vehicle_id: text('vehicle_id').notNull(),
  timestamp: timestamp('timestamp').notNull(),
  severity: text('severity').notNull(),
  alert_type: text('alert_type').notNull(),
  description: text('description').notNull(),
  recomendation: text('recomendation').notNull(),
  status: text('status').notNull().default('pending'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Tabla maintenance_logs
export const maintenanceLogs = pgTable('maintenance_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  vehicle_id: text('vehicle_id').notNull(),
  maintenance_date: timestamp('maintenance_date').notNull(),
  description: text('description').notNull(),
  performed_by: text('performed_by'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});
