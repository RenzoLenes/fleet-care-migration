# 🚀 Fleet Care - Roadmap de Implementación

## 📊 Estado Actual (✅ Fase 0 - Completada)

### Simulador IoT Interno
- ✅ Generación de datos realistas (RPM, velocidad, temperatura, batería, combustible, GPS)
- ✅ 5 vehículos simulados (BUS-001 a BUS-005)
- ✅ 4 patrones de conducción: city, highway, idle, mixed
- ✅ Simulación GPS con ciudades colombianas (Bogotá, Medellín, Cali, Barranquilla, Bucaramanga)
- ✅ Generación de alertas por reglas:
  - Engine overheating (>100°C)
  - Low battery (<12V)
  - Low fuel (<15%)
  - Brake failure
  - DTC codes (P0300, P0420, P0171, etc.)
  - High RPM (>4500)

### Estado y Persistencia
- ✅ Zustand + localStorage para estado global
- ✅ Persistencia entre navegaciones
- ✅ Manejo robusto de hot reloads (globalThis)
- ✅ Sincronización con servidor
- ✅ UI responsive y animaciones

### Base de Datos
- ✅ PostgreSQL + Supabase
- ✅ Drizzle ORM
- ✅ Tablas: vehicles, vehicle_stats, alerts, tenants
- ✅ Multi-tenancy implementado
- ✅ Realtime subscriptions

---

## 🎯 Fase 1: Alertas Inteligentes con LLM

### Objetivo
Integrar un LLM (OpenAI o4-mini) como "mecánico experto" para analizar datos de vehículos y generar diagnósticos inteligentes con recomendaciones personalizadas.

### Tareas Técnicas

#### 1.1 Configuración de OpenAI
- [x] Instalar SDK de OpenAI
- [x] Configurar API keys en `.env` (creado `.env.example`)
- [x] Crear servicio `lib/openai-service.ts`
- [x] Implementar rate limiting y manejo de errores

#### 1.2 Sistema de Prompt Engineering
- [x] Diseñar prompt base para mecánico experto
- [x] Template con contexto del vehículo:
  - [x] Datos actuales del sensor
  - [x] Histórico de datos (últimas N lecturas)
  - [ ] Alertas previas
  - [ ] Kilometraje/horas de uso
- [x] Formato de respuesta estructurada (JSON)
- [ ] Ejemplos few-shot para mejorar calidad

#### 1.3 Implementación de Prompt Caching
- [ ] Cachear contexto estático (perfil del vehículo, reglas generales)
- [ ] Solo enviar datos nuevos como variable
- [ ] Medir ahorro de tokens (objetivo: 50-70%)
- [ ] Implementar estrategia de invalidación de cache

#### 1.4 Integración con Alertas
- [x] Modificar `lib/simulation-manager.ts` para llamar LLM en alertas
- [ ] Nuevo endpoint `POST /api/alerts/analyze` (opcional - para análisis manual)
- [x] Agregar campos a tabla alerts:
  - [x] `llm_diagnosis` (text)
  - [x] `llm_recommendations` (jsonb)
  - [x] `llm_severity` (text: low, medium, high, critical)
  - [x] `llm_cost` (numeric) - tracking de costos
  - [x] `llm_tokens` (integer) - tokens usados
  - [x] `llm_cached` (boolean) - si usó cache
- [ ] UI para mostrar diagnóstico LLM en tarjeta de alerta

#### 1.5 Sistema de Fallback
- [x] Si LLM falla, usar descripción básica por reglas
- [x] Retry logic con exponential backoff
- [x] Logging de errores y costos

### Criterios de Éxito
- ✅ Alertas generadas tienen diagnóstico detallado del LLM
- ✅ Recomendaciones accionables para el usuario
- ✅ Costo promedio por alerta < $0.01 USD
- ✅ Latencia de generación < 3 segundos
- ✅ Fallback funciona si LLM no disponible

### Estimado
**Tiempo:** 3-5 días
**Complejidad:** Media

---

## 🗺️ Fase 2: Mapa en Tiempo Real

### Objetivo
Visualizar toda la flota en un mapa interactivo con posiciones GPS en tiempo real y tracking de rutas.

### Tareas Técnicas

#### 2.1 Configuración de Mapas
- [ ] Evaluar opciones: Mapbox vs Leaflet vs Google Maps
- [ ] Instalar dependencias (`mapbox-gl` o `react-leaflet`)
- [ ] Configurar API keys
- [ ] Crear componente base `<FleetMap />`

#### 2.2 Visualización de Vehículos
- [ ] Marcadores customizados por vehículo (iconos de bus)
- [ ] Color según estado:
  - 🟢 Verde: normal
  - 🟡 Amarillo: advertencia
  - 🔴 Rojo: alerta crítica
  - ⚫ Gris: offline
- [ ] Popup con info al hacer click:
  - Velocidad actual
  - Fuel level
  - Temperatura
  - Última alerta
  - Botón "Ver detalles"

#### 2.3 Actualización en Tiempo Real
- [ ] Implementar polling cada 5 segundos
- [ ] O usar Supabase Realtime (subscripción a vehicle_stats)
- [ ] Smooth transitions entre posiciones (animate markers)
- [ ] Optimizar queries (solo últimas posiciones)

#### 2.4 Rutas Históricas
- [ ] Endpoint `GET /api/vehicles/{id}/route?from=timestamp&to=timestamp`
- [ ] Dibujar línea en mapa con ruta del día
- [ ] Timeline slider para ver movimiento histórico
- [ ] Exportar ruta como GPX/KML

#### 2.5 Filtros y Controles
- [ ] Toggle para mostrar/ocultar vehículos específicos
- [ ] Filtro por estado (solo con alertas, solo en movimiento, etc.)
- [ ] Botón "Centrar en flota" (zoom out)
- [ ] Búsqueda de vehículo

### Criterios de Éxito
- ✅ Todos los vehículos visibles en mapa
- ✅ Posiciones actualizadas en tiempo real
- ✅ Click en vehículo muestra info detallada
- ✅ Rutas históricas se pueden visualizar
- ✅ Performance: < 100ms para actualizar posiciones

### Estimado
**Tiempo:** 4-6 días
**Complejidad:** Media-Alta

---

## 📊 Fase 3: Dashboard Mejorado con Métricas Avanzadas

### Objetivo
Expandir el dashboard con análisis profundo, gráficos históricos y reportes exportables.

### Tareas Técnicas

#### 3.1 KPIs en Tiempo Real
- [ ] Card de métricas principales:
  - Flota activa vs total
  - Promedio de combustible
  - Alertas activas
  - Uptime de la flota
  - Eficiencia promedio (km/litro)
- [ ] Comparación con semana/mes anterior (% change)

#### 3.2 Gráficos Históricos
- [ ] Instalar Chart.js o Recharts
- [ ] Gráfico: Consumo de combustible por vehículo (últimos 7 días)
- [ ] Gráfico: Temperatura del motor timeline
- [ ] Gráfico: Distribución de alertas por tipo
- [ ] Gráfico: Velocidad promedio por hora del día
- [ ] Selector de rango de fechas

#### 3.3 Sistema de Filtros
- [ ] Filtro por vehículo (multi-select)
- [ ] Filtro por rango de fechas
- [ ] Filtro por tipo de alerta
- [ ] Filtro por severidad
- [ ] Guardar filtros como "vista personalizada"

#### 3.4 Exportación de Reportes
- [ ] Generar PDF con jsPDF:
  - Logo de la empresa
  - Resumen ejecutivo
  - Gráficos principales
  - Tabla de alertas
  - Footer con fecha/página
- [ ] Exportar a Excel con exceljs:
  - Sheet 1: Resumen
  - Sheet 2: Datos detallados
  - Sheet 3: Alertas
- [ ] Enviar reporte por email (opcional)

#### 3.5 Comparativas
- [ ] Comparar rendimiento entre vehículos
- [ ] Ranking de vehículos (más eficiente, más problemático)
- [ ] Benchmarking con metas definidas

### Criterios de Éxito
- ✅ Dashboard muestra > 10 métricas relevantes
- ✅ Gráficos cargan < 2 segundos
- ✅ PDF generado en < 5 segundos
- ✅ Excel exporta > 1000 registros sin problemas
- ✅ Filtros funcionan en combinación

### Estimado
**Tiempo:** 5-7 días
**Complejidad:** Media

---

## 🌍 Fase 4: Sistema de Geofencing

### Objetivo
Definir zonas geográficas (geofences) y generar alertas automáticas cuando vehículos entran/salen de ellas.

### Tareas Técnicas

#### 4.1 Modelo de Datos
- [ ] Nueva tabla `geofences`:
  - id, tenant_id, name, description
  - polygon (geometry/jsonb) - coordenadas del polígono
  - color (hex) - para visualización
  - active (boolean)
  - alert_on_enter, alert_on_exit (boolean)
- [ ] Tabla `geofence_events`:
  - id, geofence_id, vehicle_id
  - event_type (enter/exit)
  - timestamp, gps_lat, gps_lng

#### 4.2 CRUD de Geofences
- [ ] Endpoint `POST /api/geofences` - crear zona
- [ ] Endpoint `GET /api/geofences` - listar zonas
- [ ] Endpoint `PUT /api/geofences/:id` - editar zona
- [ ] Endpoint `DELETE /api/geofences/:id` - eliminar zona
- [ ] Validar polígonos (mínimo 3 puntos)

#### 4.3 UI para Crear Geofences
- [ ] Herramienta de dibujo en mapa (Mapbox Draw o Leaflet Draw)
- [ ] Click para agregar puntos del polígono
- [ ] Formulario: nombre, descripción, alertas
- [ ] Vista previa del área (calcular km²)
- [ ] Lista de geofences con toggle active/inactive

#### 4.4 Detección de Entrada/Salida
- [ ] Algoritmo point-in-polygon (ray casting o turf.js)
- [ ] En cada update de GPS, verificar todas las geofences activas
- [ ] Detectar cambio de estado (dentro → fuera, fuera → dentro)
- [ ] Generar evento en `geofence_events`
- [ ] Crear alerta automática

#### 4.5 Visualización
- [ ] Mostrar geofences en mapa (polígonos semi-transparentes)
- [ ] Highlight cuando vehículo está dentro
- [ ] Notificación toast cuando se genera evento
- [ ] Historial de eventos por vehículo

### Criterios de Éxito
- ✅ Crear/editar/eliminar geofences desde UI
- ✅ Detección de entrada/salida < 500ms
- ✅ Alertas generadas automáticamente
- ✅ Visualización clara en mapa
- ✅ Historial de eventos accesible

### Estimado
**Tiempo:** 4-5 días
**Complejidad:** Media-Alta

---

## 🤖 Fase 5: Agente AI para Orquestación de Flota

### Objetivo
Implementar un agente autónomo que analiza el estado de la flota y sugiere asignaciones/optimizaciones automáticamente.

### Tareas Técnicas

#### 5.1 Modelo de Tareas
- [ ] Nueva tabla `tasks`:
  - id, tenant_id, description
  - location_lat, location_lng (punto de destino)
  - priority (enum: low, medium, high, urgent)
  - status (pending, assigned, in_progress, completed)
  - assigned_vehicle_id
  - deadline
- [ ] Tabla `task_assignments`:
  - task_id, vehicle_id
  - suggested_by (enum: manual, ai_agent)
  - confidence_score (0-100)

#### 5.2 Sistema de Contexto
- [ ] Recopilar datos para el agente:
  - Posiciones actuales de todos los vehículos
  - Nivel de combustible
  - Estado mecánico (alertas activas)
  - Tareas pendientes
  - Distancias a puntos de interés
- [ ] Endpoint `GET /api/fleet/context` - snapshot completo

#### 5.3 Implementación del Agente
- [ ] Usar OpenAI con function calling o Anthropic Claude
- [ ] Prompt: "Eres un dispatcher experto, optimiza asignaciones"
- [ ] Input: contexto de la flota + tareas pendientes
- [ ] Output estructurado:
  - Asignaciones sugeridas
  - Razones de cada decisión
  - Riesgos identificados (ej: fuel bajo)
  - Acciones preventivas

#### 5.4 UI de Orquestación
- [ ] Panel "AI Dispatcher"
- [ ] Mostrar sugerencias del agente
- [ ] Botón "Aceptar" / "Rechazar" por sugerencia
- [ ] Visualizar en mapa: vehículo → tarea (línea punteada)
- [ ] Explicación en lenguaje natural de cada sugerencia

#### 5.5 Ejecución Automática (Opcional)
- [ ] Modo "auto-pilot" para aceptar sugerencias automáticamente
- [ ] Reglas de seguridad (no asignar si fuel < 20%)
- [ ] Logging de todas las decisiones
- [ ] Dashboard de performance del agente

### Criterios de Éxito
- ✅ Agente sugiere asignaciones óptimas basadas en posición/fuel
- ✅ Explicaciones comprensibles en español
- ✅ Latencia de decisión < 5 segundos
- ✅ Usuario puede aceptar/rechazar sugerencias
- ✅ Logging completo de decisiones

### Estimado
**Tiempo:** 6-8 días
**Complejidad:** Alta

---

## 🛠️ Stack Tecnológico

### Frontend
- Next.js 15.3.3 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Zustand (state management)
- Framer Motion (animations)
- Mapbox/Leaflet (maps)
- Chart.js/Recharts (charts)

### Backend
- Next.js API Routes
- PostgreSQL + Supabase
- Drizzle ORM
- Clerk (auth)

### AI/ML
- OpenAI API (o4-mini para alertas)
- Anthropic Claude (opcional para agente)
- Prompt caching strategies

### DevOps
- Vercel (deployment)
- Supabase (DB hosting)
- GitHub (version control)

---

## 📅 Timeline Estimado

| Fase | Duración | Inicio | Fin |
|------|----------|--------|-----|
| Fase 1: Alertas LLM | 3-5 días | TBD | TBD |
| Fase 2: Mapa Tiempo Real | 4-6 días | TBD | TBD |
| Fase 3: Dashboard Mejorado | 5-7 días | TBD | TBD |
| Fase 4: Geofencing | 4-5 días | TBD | TBD |
| Fase 5: Agente AI | 6-8 días | TBD | TBD |

**Total:** ~22-31 días de desarrollo

---

## 🎯 Métricas de Éxito del Proyecto

### Performance
- [ ] Carga inicial < 2 segundos
- [ ] Actualización de datos en tiempo real < 500ms
- [ ] 99.9% uptime

### Costos
- [ ] Costo de LLM por alerta < $0.01 USD
- [ ] Prompt caching reduciendo 50-70% de tokens

### UX
- [ ] Tiempo para encontrar vehículo en mapa < 5 segundos
- [ ] Generar reporte completo < 10 segundos
- [ ] NPS > 8/10

### Técnico
- [ ] Cobertura de tests > 70%
- [ ] Cero errores críticos en producción
- [ ] Tiempo de respuesta API p95 < 200ms

---

## 📝 Notas de Implementación

### Buenas Prácticas
- Commits atómicos con mensajes descriptivos
- Code review antes de merge
- Testing de features críticas
- Documentación de endpoints
- Manejo de errores consistente
- Logging estructurado

### Consideraciones de Escalabilidad
- Paginación en todas las listas
- Índices en columnas frecuentemente consultadas
- Caching de queries pesadas
- Optimistic updates en UI
- Lazy loading de componentes pesados

---

**Última actualización:** 2025-01-09
**Mantenedor:** @RenzoLenes
