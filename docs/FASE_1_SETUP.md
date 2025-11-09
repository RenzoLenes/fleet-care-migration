# 🤖 Fase 1: Configuración de Alertas Inteligentes con LLM

## 📋 Resumen

La Fase 1 implementa un sistema de diagnóstico inteligente usando OpenAI (gpt-4o-mini) como "mecánico experto" que analiza datos de vehículos y genera diagnósticos profesionales con recomendaciones accionables.

## ✅ Lo que se implementó

### 1. Servicio OpenAI (`lib/openai-service.ts`)
- ✅ Cliente OpenAI configurado
- ✅ Rate limiting (50 req/min)
- ✅ Retry logic con exponential backoff
- ✅ Cálculo de costos y tokens
- ✅ Prompt engineering (mecánico experto con 20+ años de experiencia)
- ✅ Respuesta estructurada en JSON

### 2. Base de Datos
- ✅ Nuevos campos en tabla `alerts`:
  - `llm_diagnosis` - Diagnóstico detallado
  - `llm_recommendations` - Array JSON de recomendaciones
  - `llm_severity` - Severidad evaluada por IA
  - `llm_cost` - Costo en USD
  - `llm_tokens` - Tokens utilizados
  - `llm_cached` - Si usó cache de prompt
- ✅ Migración SQL creada: `supabase/migrations/0002_add_llm_fields_to_alerts.sql`
- ✅ Índices para performance

### 3. Integración en Simulador (`lib/simulation-manager.ts`)
- ✅ Llamada automática a LLM al generar alerta
- ✅ Contexto con datos del vehículo (RPM, temp, batería, etc.)
- ✅ Fallback graceful si LLM falla
- ✅ Guardado de diagnóstico en DB

### 4. Interfaz de Usuario
- ✅ Componente `AlertDetailDialog` con diseño especializado
- ✅ Visualización de diagnóstico del mecánico experto
- ✅ Lista de recomendaciones accionables
- ✅ Comparación severidad original vs evaluada por IA
- ✅ Métricas (tokens, costo, cache status)
- ✅ Ícono Brain (🧠) para alertas con diagnóstico IA
- ✅ Diseño purple-themed para distinguir contenido IA

## 🚀 Configuración Inicial

### Paso 1: Crear archivo `.env`

Copiar `.env.example` a `.env` y configurar:

```bash
cp .env.example .env
```

Editar `.env` y agregar:

```env
# Database (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
DIRECT_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]

# OpenAI (REQUERIDO para Fase 1)
OPENAI_API_KEY=sk-proj-[TU_API_KEY]
OPENAI_ORG_ID=org-[TU_ORG_ID]  # Opcional

# Feature Flags
ENABLE_LLM_ALERTS=true
LLM_MODEL=gpt-4o-mini
LLM_MAX_TOKENS=500
LLM_TEMPERATURE=0.3
```

### Paso 2: Aplicar Migración a la Base de Datos

**Opción A: Usando Supabase Dashboard**
1. Ir a https://supabase.com/dashboard/project/[PROJECT]/sql
2. Copiar contenido de `supabase/migrations/0002_add_llm_fields_to_alerts.sql`
3. Pegar y ejecutar en SQL Editor

**Opción B: Usando Drizzle CLI** (requiere .env configurado)
```bash
npx drizzle-kit push
```

### Paso 3: Instalar Dependencias (si no se hizo)

```bash
npm install
```

### Paso 4: Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

## 🧪 Cómo Probar la Integración

### 1. Iniciar Simulación

1. Ir a http://localhost:3000/dashboard
2. Activar el toggle "Simulación Activa"
3. Configurar:
   - Intervalo: 10 segundos
   - Duración: 60 segundos
   - Vehículos: BUS-001, BUS-002, BUS-003, BUS-004, BUS-005
4. Click en "Iniciar Simulación"

### 2. Observar Logs en Consola del Servidor

Deberías ver logs como:

```
[SimulationManager] Vehicle data saved: BUS-001
[OpenAI] Diagnosis generated - $0.0012 (450 tokens)
[SimulationManager] LLM diagnosis generated for BUS-001 - $0.0012
[SimulationManager] Alert created: engine_overheating for BUS-001 (with LLM diagnosis)
```

### 3. Ver Alertas en la UI

1. Ir a "Alertas" en el menú lateral
2. Buscar alertas con ícono 🧠 (Brain) en la descripción
3. Click en botón "Ver" de una alerta
4. Verificar que se muestre:
   - Diagnóstico detallado del mecánico experto
   - Lista de recomendaciones accionables
   - Severidad evaluada por IA
   - Métricas (tokens, costo)

### 4. Verificar Base de Datos

```sql
SELECT
  vehicle_id,
  alert_type,
  severity,
  llm_severity,
  llm_diagnosis,
  llm_cost,
  llm_tokens,
  llm_cached
FROM alerts
WHERE llm_diagnosis IS NOT NULL
ORDER BY timestamp DESC
LIMIT 5;
```

## 📊 Métricas Esperadas

Según los criterios de éxito de Fase 1:

- ✅ **Latencia**: < 3 segundos por diagnóstico
- ✅ **Costo**: < $0.01 USD por alerta (usualmente ~$0.001-0.003)
- ✅ **Calidad**: Diagnósticos en español, comprensibles y accionables
- ✅ **Fallback**: Si OpenAI falla, alerta se guarda sin diagnóstico IA

## 🐛 Troubleshooting

### Error: "OPENAI_API_KEY not configured"
- Verificar que `.env` existe y tiene `OPENAI_API_KEY`
- Reiniciar servidor de desarrollo

### Error: "Rate limit exceeded"
- El sistema limita a 50 req/min
- Esperar 1 minuto o ajustar configuración en `lib/openai-service.ts`

### No se ven diagnósticos en la UI
- Verificar que migración se aplicó correctamente
- Verificar que `ENABLE_LLM_ALERTS=true` en `.env`
- Ver logs del servidor para errores

### Costo muy alto
- Ajustar `LLM_MAX_TOKENS` a un valor menor (ej: 300)
- Verificar que modelo es `gpt-4o-mini` (no `gpt-4` que es más caro)

## 📈 Próximos Pasos

### Pendientes de Fase 1

- [ ] **1.3 Prompt Caching**: Implementar cache para reducir tokens 50-70%
- [ ] **1.4 Endpoint Manual**: `POST /api/alerts/analyze` para análisis on-demand
- [ ] **1.2 Mejoras**: Agregar datos históricos al contexto LLM

### Siguiente Fase: Mapa en Tiempo Real

Ver `ROADMAP.md` Fase 2 para detalles.

## 💰 Estimación de Costos

Con gpt-4o-mini (precios aproximados):
- **Input**: $0.00015 / 1K tokens
- **Output**: $0.0006 / 1K tokens

**Ejemplo real**:
- Prompt típico: ~200 tokens input
- Respuesta: ~300 tokens output
- **Costo**: ~$0.0012 por alerta

**Con 100 alertas/día**: ~$0.12/día = **$3.60/mes**

## 📚 Referencias

- OpenAI API Docs: https://platform.openai.com/docs
- Drizzle ORM: https://orm.drizzle.team
- Supabase: https://supabase.com/docs

---

**Última actualización**: 2025-01-09
**Autor**: @RenzoLenes
**Fase**: 1 - Alertas Inteligentes con LLM ✅
