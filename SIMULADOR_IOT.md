# 🚀 Simulador IoT Interno - Fleet Care

## 📋 Resumen

Se ha implementado un **simulador IoT completo** que reemplaza la dependencia de n8n, permitiendo generar datos realistas de vehículos de forma autónoma dentro del proyecto.

---

## 🎯 Componentes Creados

### 1. **IoTDataSimulator** (`lib/iot-simulator.ts`)

Clase que genera datos realistas de sensores IoT para vehículos.

**Características:**

- ✅ **Patrones de conducción**: city, highway, idle, mixed
- ✅ **Ubicaciones GPS reales**: Ciudades colombianas (Bogotá, Medellín, Cali, Barranquilla, Bucaramanga)
- ✅ **Movimiento GPS simulado**: Los vehículos se mueven en el mapa según su velocidad
- ✅ **Sensores realistas**:
  - RPM (800-5500 rpm según patrón)
  - Velocidad (0-120 km/h)
  - Temperatura del motor (20-110°C)
  - Voltaje de batería (11.5-14.0V)
  - Nivel de combustible (0-100%)
  - Estado de frenos (ok/warning/critical)
- ✅ **Códigos DTC**: Genera códigos de diagnóstico ocasionalmente (P0300, P0420, etc.)
- ✅ **Generación de alertas**: Basadas en condiciones de los sensores
  - Sobrecalentamiento del motor
  - Batería baja
  - Combustible bajo
  - Frenos desgastados
  - Códigos DTC
  - RPM elevadas

### 2. **SimulationManager** (`lib/simulation-manager.ts`)

Gestor singleton que controla el ciclo de vida de la simulación.

**Características:**

- ✅ **Gestión por tenant**: Cada tenant tiene su propia sesión de simulación
- ✅ **Intervalos configurables**: Envío de datos según `config.interval` (en segundos)
- ✅ **Auto-detención**: Si se especifica `config.duration`, se detiene automáticamente
- ✅ **Envío automático a API**: Llama a `/api/ingest-data` con los datos generados
- ✅ **Estadísticas**: Tracking de data points y alertas generadas
- ✅ **Manejo robusto de errores**: Try-catch en todos los puntos críticos

### 3. **API Actualizada** (`app/api/simulation/route.ts`)

Endpoint modificado para usar el simulador interno.

**Cambios:**

- ❌ **Eliminado**: Llamada a webhook de n8n
- ✅ **Nuevo**: Uso de `SimulationManager` interno
- ✅ **GET /api/simulation**: Obtiene estado actual de la simulación
- ✅ **POST /api/simulation**: Activa/desactiva el simulador

### 4. **UI Actualizada** (`simulation-control.tsx`)

Componente actualizado para reflejar el uso del simulador interno.

**Cambios:**

- Mensajes actualizados: "Simulador IoT" en lugar de "Flujo n8n"
- Toasts actualizados para indicar simulador interno

---

## 🔧 Cómo Funciona

### Flujo de Simulación

```
1. Usuario activa simulación desde UI
   ↓
2. simulation-control.tsx → POST /api/simulation
   ↓
3. API inicia SimulationManager para el tenant
   ↓
4. SimulationManager crea intervalos para generar datos
   ↓
5. Cada intervalo:
   - Para cada vehículo configurado:
     - IoTDataSimulator genera datos realistas
     - Verifica condiciones para generar alertas
     - Guarda DIRECTAMENTE en Supabase (sin HTTP)
       ↳ db.insert(vehicleStats).values(...)
       ↳ db.insert(alerts).values(...)
   ↓
6. Supabase Realtime notifica a la UI
   ↓
7. UI actualiza en tiempo real (gráficos, alertas, etc.)
```

### Ejemplo de Datos Generados

**Datos IoT:**
```json
{
  "type": "vehicle_data",
  "tenant_id": "abc-123",
  "vehicle_id": "BUS-001",
  "timestamp": "2025-11-09T10:30:00.000Z",
  "rpm": 2450,
  "speed": 65,
  "engine_temp": 88,
  "battery_voltage": 13.7,
  "fuel_level": 75,
  "brake_status": "ok",
  "dtc_codes": [],
  "gps": {
    "lat": 4.711089,
    "lng": -74.072345,
    "accuracy": 8.5
  }
}
```

**Alertas:**
```json
{
  "type": "alert",
  "tenant_id": "abc-123",
  "vehicle_id": "BUS-002",
  "timestamp": "2025-11-09T10:31:00.000Z",
  "severity": "high",
  "alert_type": "engine_overheating",
  "description": "Temperatura del motor elevada: 105°C",
  "recommendation": "Detener el vehículo de forma segura y revisar el sistema de refrigeración. Verificar nivel de refrigerante."
}
```

---

## 🧪 Cómo Probar

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno

Asegúrate de tener en tu `.env`:
```env
# Supabase (REQUERIDO para el simulador)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
DATABASE_URL=postgresql://...

# Clerk (REQUERIDO para autenticación)
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...

# Webhook (OPCIONAL - solo si usas /api/ingest-data externamente)
# El simulador interno NO necesita estas credenciales
NEXT_PUBLIC_WEBHOOK_USERNAME=tu_username  # Opcional
NEXT_PUBLIC_WEBHOOK_PASSWORD=tu_password  # Opcional
```

### 3. Ejecutar en desarrollo
```bash
npm run dev
```

### 4. Activar simulación

1. Abre el dashboard en `http://localhost:3000/dashboard`
2. Localiza el componente "Control de Simulación"
3. Activa el switch
4. Observa:
   - Estado cambia a "Activo"
   - Sensores activos: 98/127
   - Datos en tiempo real
   - Alertas generadas automáticamente

### 5. Verificar datos en consola

En la terminal del servidor verás logs como:
```
[API] Started internal simulation for tenant abc-123 with 5 vehicles
[SimulationManager] Started simulation for tenant abc-123 with 5 vehicles
```

En la consola del navegador (DevTools) verás:
- Actualizaciones de estado
- Datos recibidos en tiempo real
- Alertas generadas

---

## 📊 Ventajas del Simulador Interno

| Característica | n8n (Antes) | Simulador Interno (Ahora) |
|----------------|-------------|---------------------------|
| **Dependencias externas** | ❌ Requiere n8n funcionando | ✅ Totalmente autónomo |
| **Configuración** | ❌ Workflow complejo | ✅ Código TypeScript limpio |
| **Datos realistas** | ⚠️ Depende del workflow | ✅ Patrones inteligentes |
| **GPS simulado** | ❌ Básico | ✅ Movimiento realista |
| **Alertas contextuales** | ⚠️ Limitadas | ✅ Basadas en condiciones |
| **Escalabilidad** | ⚠️ Limitada por n8n | ✅ Multi-tenant nativo |
| **Debugging** | ❌ Difícil | ✅ Logs detallados |
| **Demo offline** | ❌ No posible | ✅ Funciona sin internet |
| **Arquitectura** | ❌ HTTP requests innecesarios | ✅ Inserción directa a DB |
| **Performance** | ⚠️ Lento (red) | ✅ Rápido (sin red) |

---

## 🎮 Configuración de Simulación

En el componente `simulation-control.tsx`, la configuración se envía así:

```typescript
{
  vehicles: ["BUS-001", "BUS-002", "BUS-003", "BUS-004", "BUS-005"],
  interval: 5,    // Genera datos cada 5 segundos
  duration: 0     // 0 = sin límite, > 0 = auto-detiene después de N segundos
}
```

**Puedes modificar:**
- `vehicles`: Array de IDs de vehículos a simular
- `interval`: Frecuencia de generación de datos (segundos)
- `duration`: Duración total (0 para ilimitado)

---

## 🔍 Debugging

### Ver estado de simulación activa

En cualquier API route puedes usar:

```typescript
import { simulationManager } from '@/lib/simulation-manager';

const isActive = simulationManager.isActive(tenantId);
const stats = simulationManager.getStats(tenantId);
console.log(stats);
// {
//   active: true,
//   dataPointsGenerated: 450,
//   alertsGenerated: 12,
//   vehicleCount: 5,
//   uptimeSeconds: 180
// }
```

### Ver sesiones activas

```typescript
const activeSessions = simulationManager.getActiveSessions();
console.log('Tenants con simulación activa:', activeSessions);
```

---

## 🚨 Manejo de Errores

El simulador tiene manejo robusto de errores:

1. **Credenciales faltantes**: Log de error, no crashea
2. **Error en fetch a /api/ingest-data**: Log de error, continúa con siguiente vehículo
3. **Error generando datos**: Try-catch individual por vehículo
4. **Detención abrupta**: Cleanup de intervalos garantizado

---

## 🔮 Próximos Pasos (Mejoras Futuras)

Ahora que tienes el simulador funcionando, puedes:

1. **Mapa en tiempo real**: Visualizar ubicaciones GPS de vehículos
2. **Geofencing**: Definir zonas y alertas al entrar/salir
3. **Rutas predefinidas**: Simular vehículos siguiendo rutas específicas
4. **Patrones de tráfico**: Simular congestión, horas pico
5. **Fallas programadas**: Simular fallas específicas para testing
6. **Agente IA**: Orquestación inteligente basada en ubicaciones

---

## 📝 Archivos Modificados/Creados

```
✅ lib/iot-simulator.ts                    [NUEVO]
✅ lib/simulation-manager.ts               [NUEVO]
📝 app/api/simulation/route.ts            [MODIFICADO]
📝 app/(routes)/dashboard/_components/simulation-control.tsx [MODIFICADO]
```

---

## 🎉 Listo para Producción

El simulador está completamente funcional y listo para:

- ✅ Demos en vivo
- ✅ Testing de la aplicación
- ✅ Desarrollo sin dependencias externas
- ✅ Generación de datos históricos
- ✅ Pruebas de carga

**¡Disfruta tu nuevo simulador IoT interno!** 🚀
