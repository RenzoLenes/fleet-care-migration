# 🎯 Plan de Simulación IoT - MVP

## Objetivo
Simular envío de datos IoT de vehículos de forma **realista** para el MVP.

---

## 📋 Características del MVP

✅ **Datos continuos** - Envía datos cada 5 segundos mientras esté activo
✅ **Dependiente del usuario** - Se detiene cuando cierra la página (comportamiento MVP)
✅ **Guarda en DB real** - Datos persisten en Supabase
✅ **Controlable** - Botón ON/OFF desde dashboard
✅ **Multi-tenant** - Cada organización tiene su propia simulación

---

## 🎬 Flujo de Funcionamiento

### **Caso 1: Usuario Activa Simulación**

```
1. Usuario abre dashboard
   ↓
2. Click "Activar Simulación"
   ↓
3. Frontend: POST /api/simulation { status: 'activado', config: {...} }
   ↓
4. Backend: simulationManager.startSimulation(tenantId, config)
   ↓
5. Servidor crea intervalo (cada 5 segundos):
   - Para cada vehículo (BUS-001, BUS-002, ...):
     a) IoTDataSimulator.generateData()
        → rpm, speed, engine_temp, battery, fuel_level, GPS, etc.
     b) db.insert(vehicleStats).values(...) → Guarda en Supabase
     c) Si hay condiciones de alerta:
        → db.insert(alerts).values(...) → Guarda alerta
   ↓
6. Supabase Realtime notifica a la UI
   ↓
7. Dashboard actualiza gráficos, alertas, etc. en tiempo real
   ↓
Usuario ve datos fluyendo ✅
```

### **Caso 2: Usuario Cierra la Página**

```
1. Usuario cierra pestaña / navega a otra ruta
   ↓
2. React ejecuta cleanup del useEffect
   ↓
3. Frontend: fetch('/api/simulation', {
     status: 'desactivado',
     keepalive: true  // ← Importante: asegura que se complete
   })
   ↓
4. Backend: simulationManager.stopSimulation(tenantId)
   ↓
5. Intervalos detenidos → No más generación de datos
   ↓
Simulación detenida ✅
```

### **Caso 3: Usuario Desactiva Manualmente**

```
1. Simulación activa (datos fluyendo)
   ↓
2. Click "Desactivar Simulación"
   ↓
3. Frontend: POST /api/simulation { status: 'desactivado' }
   ↓
4. Backend: simulationManager.stopSimulation(tenantId)
   ↓
5. Intervalos detenidos
   ↓
Simulación detenida ✅
```

---

## 🔧 Implementación Técnica

### **Frontend: simulation-control.tsx**

```typescript
// Cleanup automático al desmontar componente
useEffect(() => {
  return () => {
    if (active) {
      fetch('/api/simulation', {
        method: 'POST',
        body: JSON.stringify({
          status: 'desactivado',
          tenant: tenant,
          config: { vehicles: [], interval: 0, duration: 0 }
        }),
        keepalive: true  // ← Crucial para que funcione al cerrar página
      });
    }
  };
}, [active, tenant]);
```

**¿Por qué `keepalive: true`?**
- Normalmente, cuando cierras una página, las fetch requests se cancelan
- `keepalive: true` le dice al navegador: "completa esta request aunque cierre la página"
- Es perfecto para cleanup

### **Backend: SimulationManager**

```typescript
// Genera datos en intervalos
setInterval(async () => {
  for (const vehicleId of config.vehicles) {
    const iotData = simulator.generateData(vehicleId, tenantId);

    // Guarda DIRECTAMENTE en Supabase (sin HTTP)
    await db.insert(vehicleStats).values({
      tenant_id: iotData.tenant_id,
      vehicle_id: iotData.vehicle_id,
      fuel_level: iotData.fuel_level,
      gps_lat: iotData.gps?.lat?.toString(),
      gps_lng: iotData.gps?.lng?.toString(),
      // ... todos los sensores
    });
  }
}, interval * 1000);
```

---

## 📊 Datos Generados (Ejemplo Real)

### **Cada 5 segundos se inserta en `vehicle_stats`:**

```sql
INSERT INTO vehicle_stats (
  tenant_id, vehicle_id, timestamp,
  rpm, speed, engine_temp, battery_voltage,
  fuel_level, brake_status,
  gps_lat, gps_lng, gps_accuracy
) VALUES (
  'tenant-123', 'BUS-001', '2025-11-09 15:30:00',
  2450, 65, 88, 13.7,
  75, 'ok',
  4.711089, -74.072345, 8.5
);
```

### **Si hay condiciones de alerta, se inserta en `alerts`:**

```sql
INSERT INTO alerts (
  tenant_id, vehicle_id, timestamp,
  severity, alert_type, description, recomendation, status
) VALUES (
  'tenant-123', 'BUS-002', '2025-11-09 15:30:05',
  'high', 'engine_overheating',
  'Temperatura del motor elevada: 105°C',
  'Detener vehículo y revisar sistema de refrigeración',
  'pending'
);
```

---

## 🎯 Ventajas del Approach MVP

| Característica | Estado |
|----------------|--------|
| ✅ **Simple** | Solo modificamos 1 archivo (simulation-control.tsx) |
| ✅ **Funcional** | Datos reales en DB en tiempo real |
| ✅ **No requiere infraestructura extra** | No necesitamos cron jobs, workers, etc. |
| ✅ **Fácil de debuggear** | Logs claros en consola |
| ✅ **Cleanup automático** | Se detiene al cerrar página |
| ⚠️ **No persiste al reiniciar servidor** | OK para MVP, se puede mejorar después |

---

## 🧪 Cómo Probar

### **1. Aplicar migración en Supabase (OBLIGATORIO)**

```sql
-- Agregar columnas GPS y fuel_level
ALTER TABLE "vehicle_stats" ADD COLUMN "fuel_level" integer;
ALTER TABLE "vehicle_stats" ADD COLUMN "gps_lat" numeric(10, 7);
ALTER TABLE "vehicle_stats" ADD COLUMN "gps_lng" numeric(10, 7);
ALTER TABLE "vehicle_stats" ADD COLUMN "gps_accuracy" numeric(6, 2);

ALTER TABLE "alerts" ADD COLUMN IF NOT EXISTS "alert_type" text NOT NULL DEFAULT 'unknown';
ALTER TABLE "alerts" ADD COLUMN IF NOT EXISTS "recomendation" text NOT NULL DEFAULT '';
```

### **2. Iniciar servidor**

```bash
npm run dev
```

### **3. Activar simulación**

1. Abre dashboard
2. Click "Activar Simulación"
3. Verás en consola del servidor:
   ```
   [SimulationManager] Started simulation for tenant abc-123 with 5 vehicles
   [SimulationManager] Vehicle data saved: BUS-001
   [SimulationManager] Vehicle data saved: BUS-002
   [SimulationManager] Alert created: low_fuel for BUS-003
   ```

### **4. Verificar datos en Supabase**

```sql
-- Ver datos recientes
SELECT
  vehicle_id,
  fuel_level,
  gps_lat,
  gps_lng,
  engine_temp,
  timestamp
FROM vehicle_stats
ORDER BY timestamp DESC
LIMIT 20;

-- Deberías ver datos nuevos cada 5 segundos
```

### **5. Cerrar página y verificar que se detiene**

1. Cierra la pestaña del dashboard
2. Espera 10 segundos
3. Consulta DB de nuevo
4. ✅ Ya no hay datos nuevos (simulación detenida)

---

## 🔍 Debugging

### **Logs en Consola del Servidor:**

```bash
# Simulación inicia
[SimulationManager] Started simulation for tenant abc-123 with 5 vehicles

# Datos generándose
[SimulationManager] Vehicle data saved: BUS-001
[SimulationManager] Vehicle data saved: BUS-002
[SimulationManager] Alert created: engine_overheating for BUS-003

# Usuario cierra página
[SimulationControl] Component unmounting, stopping simulation...
[SimulationManager] Stopped simulation for tenant abc-123
  - Data points generated: 150
  - Alerts generated: 5
  - Duration: 150s
```

### **Logs en Consola del Navegador:**

```bash
# Activación
POST /api/simulation 200 OK

# Cleanup al cerrar
[SimulationControl] Component unmounting, stopping simulation...
```

---

## 🚀 Próximos Pasos

Una vez que tengas datos fluyendo:

1. ✅ **Mapa en tiempo real** - Visualizar vehículos moviéndose con GPS
2. ✅ **Geofencing** - Zonas y alertas automáticas
3. ✅ **Agente IA** - Orquestación inteligente de la flota
4. ✅ **Dashboard mejorado** - Métricas en tiempo real más visuales

---

## 📝 Archivos Modificados

```
✅ simulation-control.tsx  - Cleanup automático al cerrar página
✅ simulation-manager.ts   - Inserción directa a DB (ya funcionando)
✅ db/schema.ts           - Campos GPS y fuel_level (ya agregados)
```

---

**¡Listo para generar datos IoT realistas!** 🎉
