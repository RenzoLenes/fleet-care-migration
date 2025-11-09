# 🔧 Migración de Base de Datos - GPS y Fuel Level

## Cambios Realizados

Se actualizó el schema y endpoint de ingesta de datos para soportar:
- ✅ **Nivel de combustible** (`fuel_level`)
- ✅ **Datos GPS** (`gps_lat`, `gps_lng`, `gps_accuracy`)

---

## 📦 Archivos Modificados

### 1. Schema de Base de Datos (`db/schema.ts`)
```typescript
export const vehicleStats = pgTable('vehicle_stats', {
  // ... campos existentes ...
  fuel_level: integer('fuel_level'),              // Nuevo
  gps_lat: numeric('gps_lat', { precision: 10, scale: 7 }),    // Nuevo
  gps_lng: numeric('gps_lng', { precision: 10, scale: 7 }),    // Nuevo
  gps_accuracy: numeric('gps_accuracy', { precision: 6, scale: 2 }), // Nuevo
});
```

### 2. Endpoint de Ingesta (`app/api/ingest-data/route.ts`)
Ahora maneja correctamente:
- `fuel_level` → Integer (0-100%)
- `gps.lat` → Numeric (latitud)
- `gps.lng` → Numeric (longitud)
- `gps.accuracy` → Numeric (precisión en metros)

### 3. Migración SQL (`supabase/migrations/0001_add_gps_fuel_to_vehicle_stats.sql`)
Archivo de migración listo para aplicar.

---

## 🚀 Cómo Aplicar la Migración

### Opción 1: Usando Supabase Dashboard (Recomendado)

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Click en **SQL Editor**
3. Copia y pega el contenido de:
   ```
   supabase/migrations/0001_add_gps_fuel_to_vehicle_stats.sql
   ```
4. Click en **Run**

### Opción 2: Usando CLI de Supabase

```bash
npx supabase db push
```

### Opción 3: Ejecutar SQL directamente

```sql
-- Add GPS and fuel_level columns to vehicle_stats table
ALTER TABLE "vehicle_stats" ADD COLUMN "fuel_level" integer;
ALTER TABLE "vehicle_stats" ADD COLUMN "gps_lat" numeric(10, 7);
ALTER TABLE "vehicle_stats" ADD COLUMN "gps_lng" numeric(10, 7);
ALTER TABLE "vehicle_stats" ADD COLUMN "gps_accuracy" numeric(6, 2);

-- Add missing columns to alerts table (si no existen)
ALTER TABLE "alerts" ADD COLUMN IF NOT EXISTS "alert_type" text NOT NULL DEFAULT 'unknown';
ALTER TABLE "alerts" ADD COLUMN IF NOT EXISTS "recomendation" text NOT NULL DEFAULT '';
```

---

## ✅ Verificar que la Migración Funcionó

Ejecuta en SQL Editor:

```sql
-- Ver estructura actualizada de vehicle_stats
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'vehicle_stats';

-- Deberías ver:
-- fuel_level | integer
-- gps_lat | numeric
-- gps_lng | numeric
-- gps_accuracy | numeric
```

---

## 🧪 Probar el Simulador

Una vez aplicada la migración:

1. **Inicia el servidor**
   ```bash
   npm run dev
   ```

2. **Activa la simulación** desde el dashboard

3. **Verifica los datos en Supabase**
   ```sql
   SELECT
     vehicle_id,
     timestamp,
     fuel_level,
     gps_lat,
     gps_lng,
     engine_temp,
     battery_voltage
   FROM vehicle_stats
   ORDER BY timestamp DESC
   LIMIT 10;
   ```

   Deberías ver datos como:
   ```
   vehicle_id | fuel_level | gps_lat    | gps_lng
   -----------|------------|------------|------------
   BUS-001    | 75         | 4.711089   | -74.072345
   BUS-002    | 82         | 6.247600   | -75.565800
   ...
   ```

4. **Verifica las alertas**
   ```sql
   SELECT
     vehicle_id,
     alert_type,
     severity,
     description,
     timestamp
   FROM alerts
   ORDER BY timestamp DESC
   LIMIT 10;
   ```

---

## 🔍 Flujo Completo de Datos

```
Simulador IoT (cada 5s)
  ↓
Genera datos con GPS + fuel_level
  ↓
POST /api/ingest-data
  ↓
Valida autenticación Basic Auth
  ↓
Inserta en vehicle_stats (Supabase)
  {
    vehicle_id: "BUS-001",
    fuel_level: 75,
    gps_lat: 4.711089,
    gps_lng: -74.072345,
    gps_accuracy: 8.5,
    rpm: 2450,
    speed: 65,
    engine_temp: 88,
    battery_voltage: 13.7,
    brake_status: "ok"
  }
  ↓
Supabase Realtime notifica
  ↓
UI actualiza en tiempo real
```

---

## 🐛 Troubleshooting

### Error: "column does not exist"
**Solución:** Ejecuta la migración SQL en Supabase Dashboard.

### Error: "Unauthorized" en /api/ingest-data
**Solución:** Verifica que `.env` tenga:
```env
NEXT_PUBLIC_WEBHOOK_USERNAME=tu_username
NEXT_PUBLIC_WEBHOOK_PASSWORD=tu_password
```

### No se guardan datos GPS
**Solución:**
1. Verifica que la migración se aplicó correctamente
2. Revisa logs en consola del servidor: `[Ingest] Vehicle data saved: BUS-001`
3. Verifica formato de datos enviados por el simulador

### Datos no aparecen en tiempo real
**Solución:**
1. Verifica que Supabase Realtime esté habilitado para la tabla `vehicle_stats`
2. En Supabase Dashboard → Database → Replication → Habilita para `vehicle_stats`

---

## 📝 Notas Importantes

1. **Precisión GPS**: Usamos `numeric(10, 7)` para lat/lng
   - Rango válido: -90 a 90 (latitud), -180 a 180 (longitud)
   - 7 decimales = precisión ~1.1 cm

2. **Fuel Level**: Integer 0-100 (porcentaje)

3. **Compatibilidad**: Si tienes datos antiguos sin GPS, los campos son opcionales (nullable)

4. **Índices**: Considera agregar índices si tienes muchos datos:
   ```sql
   CREATE INDEX idx_vehicle_stats_gps ON vehicle_stats(gps_lat, gps_lng);
   CREATE INDEX idx_vehicle_stats_timestamp ON vehicle_stats(timestamp DESC);
   ```

---

## 🎯 Próximos Pasos

Una vez que la migración esté aplicada y los datos fluyan:
1. ✅ Implementar componente de mapa (Leaflet/Mapbox)
2. ✅ Visualizar vehículos en tiempo real
3. ✅ Mostrar nivel de combustible en UI
4. ✅ Implementar geofencing
5. ✅ Crear agente IA para orquestación

---

**¿Listo para ver el mapa? 🗺️**
