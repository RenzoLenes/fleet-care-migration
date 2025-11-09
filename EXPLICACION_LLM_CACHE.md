# 💡 Explicación: LLM Cache

## ¿Qué es LLM Cache?

**Cache de respuestas del LLM** para evitar llamadas innecesarias y costosas.

---

## 🎯 Concepto

### **Problema sin cache:**

```typescript
// Cada vez que un vehículo tiene temperatura alta
Temperature: 105°C, Speed: 80 km/h, RPM: 2500
  ↓
LLM analiza → $0.00011
  ↓
Response: "Motor sobrecalentado, reducir velocidad..."

// 10 segundos después, MISMO vehículo, MISMAS condiciones
Temperature: 105°C, Speed: 80 km/h, RPM: 2500
  ↓
LLM analiza DE NUEVO → $0.00011  ❌ Desperdicio
  ↓
Response: "Motor sobrecalentado, reducir velocidad..." (igual)
```

**Problema:** Pagamos por el mismo análisis múltiples veces.

---

### **Solución con cache:**

```typescript
// Primera vez
Temperature: 105°C, Speed: 80 km/h, RPM: 2500
  ↓
Cache key: "temperature-105-80"
  ↓
No hay cache, llamar LLM → $0.00011
  ↓
Guardar respuesta en cache
  ↓
Response: "Motor sobrecalentado..."

// 10 segundos después, MISMAS condiciones
Temperature: 105°C, Speed: 80 km/h, RPM: 2500
  ↓
Cache key: "temperature-105-80"
  ↓
¡Existe en cache! → $0 ✅
  ↓
Response: "Motor sobrecalentado..." (desde cache)
```

---

## 📦 Implementación Simple

```typescript
// lib/llm-cache.ts

// Cache simple en memoria (Map)
const cache = new Map<string, {
  alert: Alert;
  timestamp: number;
}>();

export function getCachedAnalysis(cacheKey: string): Alert | null {
  const cached = cache.get(cacheKey);

  // Cache válido por 5 minutos
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return cached.alert;
  }

  // Cache expiró o no existe
  return null;
}

export function setCachedAnalysis(cacheKey: string, alert: Alert) {
  cache.set(cacheKey, {
    alert,
    timestamp: Date.now()
  });
}
```

---

## 🔑 Cache Key Strategy

El "cache key" determina cuándo dos situaciones son "iguales":

### **Estrategia 1: Muy específica (poco reuso)**
```typescript
const cacheKey = `${anomalyType}-${data.engine_temp}-${data.speed}-${data.rpm}-${data.battery_voltage}`;
// Ejemplo: "temperature-105-80-2500-13.5"
// Problema: Cambio de 1°C = nueva llamada LLM
```

### **Estrategia 2: Redondeada (más reuso)** ✅
```typescript
const cacheKey = `${anomalyType}-${Math.round(data.engine_temp / 5) * 5}-${Math.round(data.speed / 10) * 10}`;
// Ejemplo: "temperature-105-80"
// 103°C → 105, 104°C → 105, 106°C → 105 (mismo cache)
// 82 km/h → 80, 79 km/h → 80 (mismo cache)
```

### **Estrategia 3: Por rangos (máximo reuso)**
```typescript
function getTemperatureRange(temp: number): string {
  if (temp < 90) return 'normal';
  if (temp < 100) return 'warm';
  if (temp < 110) return 'hot';
  return 'critical';
}

const cacheKey = `${anomalyType}-${getTemperatureRange(data.engine_temp)}`;
// Ejemplo: "temperature-hot"
// Cualquier temp 100-109°C usa el mismo cache
```

---

## 💰 Impacto en Costos

### **Sin cache:**
```
5 vehículos × 12 lecturas/minuto × 30% anomalías = 18 llamadas/min
18 × 60 = 1,080 llamadas/hora
1,080 × $0.00011 = $0.12/hora

8 horas/día × 30 días = $28.80/mes
```

### **Con cache 50% (estrategia 2):**
```
1,080 llamadas/hora × 50% = 540 llamadas reales
540 × $0.00011 = $0.06/hora

8 horas/día × 30 días = $14.40/mes  ✅ 50% ahorro
```

### **Con cache 70% (estrategia 3):**
```
1,080 llamadas/hora × 30% = 324 llamadas reales
324 × $0.00011 = $0.036/hora

8 horas/día × 30 días = $8.64/mes  ✅ 70% ahorro
```

---

## 🧪 Ejemplo de Uso

```typescript
// lib/iot-simulator.ts

import { getCachedAnalysis, setCachedAnalysis } from './llm-cache';
import { analyzeVehicleCondition } from './llm-analyzer';

async generateAlert(data: VehicleIoTData): Promise<Alert | null> {
  // 1. Detectar anomalía
  let anomalyType: string | null = null;

  if (data.engine_temp && data.engine_temp > 100) {
    anomalyType = 'temperature';
  }
  // ... otros checks

  if (!anomalyType) return null;

  // 2. Generar cache key
  const cacheKey = `${anomalyType}-${Math.round(data.engine_temp / 5) * 5}-${Math.round(data.speed / 10) * 10}`;

  // 3. Verificar cache
  const cached = getCachedAnalysis(cacheKey);
  if (cached) {
    console.log(`[LLM Cache] HIT for ${cacheKey}`);
    return cached;
  }

  // 4. No hay cache, llamar LLM
  console.log(`[LLM Cache] MISS for ${cacheKey}, calling LLM...`);
  const analysis = await analyzeVehicleCondition(data, anomalyType);

  // 5. Guardar en cache
  setCachedAnalysis(cacheKey, analysis);

  return analysis;
}
```

---

## 📊 Logs Ejemplo

```bash
[LLM Cache] MISS for temperature-105-80, calling LLM...
[LLM] Analyzing vehicle BUS-001 for temperature anomaly...
[LLM] Response: { severity: 'high', description: '...' }
[LLM Cache] Saved cache for temperature-105-80

# 10 segundos después, mismo vehículo
[LLM Cache] HIT for temperature-105-80
[SimulationManager] Alert created: engine_overheating for BUS-001

# Otro vehículo, condiciones similares
[LLM Cache] HIT for temperature-105-80  ✅ Reuso!
[SimulationManager] Alert created: engine_overheating for BUS-003
```

---

## ⚡ Optimizaciones Avanzadas

### **1. Limpieza de cache viejo**
```typescript
// Ejecutar cada 10 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > 10 * 60 * 1000) {
      cache.delete(key);
    }
  }
}, 10 * 60 * 1000);
```

### **2. Cache persistente (Redis)**
Para producción, usar Redis en lugar de Map:
```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN
});

export async function getCachedAnalysis(key: string) {
  return await redis.get(key);
}

export async function setCachedAnalysis(key: string, value: Alert) {
  await redis.setex(key, 300, JSON.stringify(value)); // 5 min TTL
}
```

### **3. Cache por tenant**
```typescript
const cacheKey = `${tenantId}:${anomalyType}-${temp}-${speed}`;
// Aislar cache por organización
```

---

## 🎯 Recomendación para tu MVP

**Usar Estrategia 2 (Redondeada)** con cache simple en memoria:

```typescript
✅ Implementar:
- Cache en Map (lib/llm-cache.ts)
- Cache key redondeado: temp/5, speed/10
- TTL: 5 minutos
- Cleanup cada 10 minutos

❌ NO necesitas (por ahora):
- Redis (complejidad extra)
- Cache persistente
- Analytics de cache hit rate
```

**Resultado esperado:**
- 50-60% de cache hit rate
- Reducción de costos a $10-15/mes
- Sin complejidad adicional

---

**¿Tiene sentido?** Es básicamente un "diccionario" que recuerda respuestas del LLM para no pagar dos veces por lo mismo.
