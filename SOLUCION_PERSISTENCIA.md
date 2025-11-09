# 🔧 Solución: Sincronización de Estado de Simulación

## ❌ Problema Original

### **Síntoma:**
- Usuario cierra página → simulación debería detenerse
- Usuario vuelve a entrar → botón muestra "apagado"
- PERO... servidor sigue generando datos 🐛

### **Causa Raíz:**
Había **dos fuentes de verdad** no sincronizadas:

```typescript
// En /app/api/simulation/route.ts

1. simulationStates (Map local del route)
   - Línea 21-29
   - Se actualiza en POST
   - Se consulta en GET
   - ❌ NO refleja la realidad si el cleanup falla

2. simulationManager.sessions (la verdad real)
   - Dentro de SimulationManager
   - Tiene los intervalos activos
   - ✅ Fuente de verdad REAL
```

### **Por qué fallaba:**

```
1. Usuario cierra página
   ↓
2. useEffect cleanup ejecuta fetch('/api/simulation', { status: 'desactivado' })
   ↓
3. SI el fetch falla o no se completa:
   - simulationStates NO se actualiza
   - simulationManager sigue corriendo ⚠️
   ↓
4. Usuario regresa
   ↓
5. GET /api/simulation consulta simulationStates
   - Devuelve: { active: false } (viejo estado)
   ↓
6. Frontend muestra botón "apagado"
   ↓
7. PERO simulationManager.sessions tiene la sesión activa
   - Intervalos siguen corriendo
   - Datos siguen generándose 🐛
```

---

## ✅ Solución Implementada

### **Cambio Principal:**
**Usar `SimulationManager` como única fuente de verdad**

```typescript
// Antes ❌
export async function GET() {
  const state = simulationStates.get(tenantId) || { active: false };
  // Problema: puede estar desincronizado
  return NextResponse.json({ state });
}

// Ahora ✅
export async function GET() {
  // Consultar DIRECTAMENTE al SimulationManager
  const isActive = simulationManager.isActive(tenantId);
  const stats = simulationManager.getStats(tenantId);

  const state = {
    active: isActive,  // ← Verdad absoluta
    activeSensors: isActive ? stats?.vehicleCount * 20 : 0,
    dataFlow: isActive,
    stats: stats
  };

  return NextResponse.json({ state });
}
```

### **Beneficios:**

✅ **Siempre muestra el estado real del servidor**
- Frontend consulta GET /api/simulation al cargar
- GET consulta simulationManager.isActive()
- El botón refleja la realidad

✅ **Si el cleanup falla, se recupera automáticamente**
- Usuario cierra página (cleanup puede fallar)
- Usuario regresa
- Frontend consulta estado REAL
- Muestra botón "activo" si hay simulación corriendo
- Usuario puede desactivarla manualmente

✅ **Una sola fuente de verdad**
- Eliminamos `simulationStates` Map duplicado
- Solo existe `simulationManager.sessions`

---

## 🎬 Flujo Corregido

### **Escenario 1: Cleanup exitoso**
```
1. Usuario cierra página
   ↓
2. useEffect cleanup ejecuta
   ↓
3. POST /api/simulation { status: 'desactivado' }
   ↓
4. simulationManager.stopSimulation()
   ↓
5. Intervalos detenidos ✅
   ↓
Usuario regresa
   ↓
6. GET /api/simulation
   ↓
7. simulationManager.isActive() → false
   ↓
8. Frontend muestra botón "apagado" ✅
```

### **Escenario 2: Cleanup falla (navegador crashea)**
```
1. Usuario cierra página abruptamente
   ↓
2. Cleanup NO se ejecuta ❌
   ↓
3. simulationManager sigue corriendo
   ↓
Usuario regresa
   ↓
4. GET /api/simulation
   ↓
5. simulationManager.isActive() → TRUE ✅
   ↓
6. Frontend muestra botón "ACTIVO" ✅
   - Usuario puede desactivarlo manualmente
   - O dejarlo corriendo si quiere
```

---

## 🧪 Cómo Probarlo

### **Test 1: Funcionamiento normal**
```bash
1. Activa simulación → botón ON
2. Cierra pestaña
3. Espera 10 segundos
4. Abre dashboard de nuevo
5. ✅ Botón debería estar OFF
6. ✅ No hay datos nuevos en DB
```

### **Test 2: Recuperación de estado**
```bash
1. Activa simulación → botón ON
2. Verifica datos en consola: [SimulationManager] Vehicle data saved...
3. Cierra navegador completamente (killall chrome)
4. Abre navegador y dashboard de nuevo
5. ✅ Botón debería estar ON (porque simulación sigue en servidor)
6. ✅ Datos siguen fluyendo
7. Click en OFF → se detiene
```

---

## 🔍 Debugging

### **Ver estado real en cualquier momento:**

```bash
# En consola del servidor (Node.js)
const simulationManager = require('./lib/simulation-manager').simulationManager;

// Ver todas las sesiones activas
console.log(simulationManager.getActiveSessions());
// → ['tenant-id-1', 'tenant-id-2']

// Ver stats de un tenant
console.log(simulationManager.getStats('tenant-id-1'));
// → {
//     active: true,
//     dataPointsGenerated: 450,
//     alertsGenerated: 12,
//     vehicleCount: 5,
//     uptimeSeconds: 180
//   }
```

### **Logs a buscar:**

```bash
# Simulación inicia
[API] Started internal simulation for tenant xxx with 5 vehicles
[SimulationManager] Started simulation for tenant xxx with 5 vehicles

# Frontend consulta estado
GET /api/simulation 200 in Xms

# Simulación se detiene
[SimulationManager] Stopped simulation for tenant xxx
  - Data points generated: 450
  - Alerts generated: 12
  - Duration: 180s
```

---

## 📝 Archivos Modificados

```
✅ app/api/simulation/route.ts
   - GET: Consulta simulationManager.isActive() directamente
   - POST: Eliminado código de simulationStates
   - Eliminado Map simulationStates duplicado
```

---

## 🎯 Para MVP, ¿Necesitamos Persistencia en DB?

**No es necesario** por ahora. La solución actual es suficiente para MVP:

✅ **Ventajas actuales:**
- Simple (sin DB extra)
- Funciona bien en uso normal
- Frontend se sincroniza automáticamente
- Usuario puede recuperar control si algo falla

⚠️ **Limitación MVP:**
- Si reiniciar el servidor, simulaciones se pierden
- OK para MVP, no es común reiniciar en producción

🔮 **Para Producción (futuro):**
Si necesitas que sobreviva reinicios:
1. Crear tabla `simulation_configs` en DB
2. Guardar estado cuando se activa/desactiva
3. En startup del servidor, restaurar simulaciones activas
4. Implementar en el futuro cuando lo necesites

---

**¿Funciona ahora?** Prueba los 2 tests de arriba y me cuentas.
