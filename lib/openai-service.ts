/**
 * OpenAI Service - Manejo centralizado de llamadas a OpenAI API
 * Incluye rate limiting, retry logic, caching y logging de costos
 */

import OpenAI from 'openai';

// Configuración del cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

// Configuración
const CONFIG = {
  enabled: process.env.ENABLE_LLM_ALERTS === 'true',
  model: process.env.LLM_MODEL || 'gpt-4o-mini',
  maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '500'),
  temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.3'),
  maxRetries: 3,
  retryDelay: 1000, // ms
};

// Rate limiting simple (en memoria)
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 50; // requests per minute
  private readonly windowMs = 60000; // 1 minute

  canMakeRequest(): boolean {
    const now = Date.now();
    // Limpiar requests antiguos
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return this.requests.length < this.maxRequests;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }

  getWaitTime(): number {
    if (this.requests.length === 0) return 0;
    const oldestRequest = this.requests[0];
    const timeElapsed = Date.now() - oldestRequest;
    return Math.max(0, this.windowMs - timeElapsed);
  }
}

const rateLimiter = new RateLimiter();

// Tipos
export interface VehicleAlertContext {
  vehicleId: string;
  timestamp: Date;
  alertType: string;
  currentData: {
    rpm?: number;
    speed?: number;
    engineTemp?: number;
    batteryVoltage?: number;
    fuelLevel?: number;
    brakeStatus?: string;
    dtcCodes?: string[];
  };
  historicalData?: Array<{
    timestamp: Date;
    rpm?: number;
    speed?: number;
    engineTemp?: number;
  }>;
}

export interface LLMDiagnosisResult {
  diagnosis: string;
  recommendations: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost: number; // USD
  tokensUsed: number;
  cached: boolean;
}

/**
 * Genera un diagnóstico usando LLM
 */
export async function generateDiagnosis(
  context: VehicleAlertContext
): Promise<LLMDiagnosisResult> {
  // Verificar si LLM está habilitado
  if (!CONFIG.enabled) {
    throw new Error('LLM alerts are disabled. Set ENABLE_LLM_ALERTS=true in .env');
  }

  // Verificar API key
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  // Rate limiting
  if (!rateLimiter.canMakeRequest()) {
    const waitTime = rateLimiter.getWaitTime();
    throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)}s`);
  }

  // Retry logic con exponential backoff
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
    try {
      const result = await makeOpenAIRequest(context);
      rateLimiter.recordRequest();

      // Log de costo
      console.log(`[OpenAI] Diagnosis generated - $${result.estimatedCost.toFixed(4)} (${result.tokensUsed} tokens)`);

      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`[OpenAI] Attempt ${attempt}/${CONFIG.maxRetries} failed:`, error);

      if (attempt < CONFIG.maxRetries) {
        const delay = CONFIG.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`[OpenAI] Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw new Error(`Failed after ${CONFIG.maxRetries} attempts: ${lastError?.message}`);
}

/**
 * Hace la llamada real a OpenAI API
 */
async function makeOpenAIRequest(
  context: VehicleAlertContext
): Promise<LLMDiagnosisResult> {
  const prompt = buildPrompt(context);

  const response = await openai.chat.completions.create({
    model: CONFIG.model,
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: CONFIG.temperature,
    max_tokens: CONFIG.maxTokens,
    response_format: { type: 'json_object' },
  });

  const result = response.choices[0].message.content;
  if (!result) {
    throw new Error('Empty response from OpenAI');
  }

  // Parse JSON response
  const parsed = JSON.parse(result);

  // Calcular costo estimado (precios aproximados para gpt-4o-mini)
  const inputTokens = response.usage?.prompt_tokens || 0;
  const outputTokens = response.usage?.completion_tokens || 0;
  const totalTokens = response.usage?.total_tokens || 0;

  // Precios aproximados: $0.00015/1K input tokens, $0.0006/1K output tokens
  const estimatedCost = (inputTokens * 0.00015 + outputTokens * 0.0006) / 1000;

  return {
    diagnosis: parsed.diagnosis,
    recommendations: parsed.recommendations || [],
    severity: parsed.severity || 'medium',
    estimatedCost,
    tokensUsed: totalTokens,
    cached: false, // TODO: Implementar caching en Fase 1.3
  };
}

/**
 * Construye el prompt para el LLM
 */
function buildPrompt(context: VehicleAlertContext): string {
  const { vehicleId, alertType, currentData } = context;

  return `
Analiza la siguiente alerta de un vehículo de transporte público:

VEHÍCULO: ${vehicleId}
TIPO DE ALERTA: ${alertType}
FECHA/HORA: ${context.timestamp.toISOString()}

DATOS ACTUALES:
${currentData.rpm ? `- RPM: ${currentData.rpm}` : ''}
${currentData.speed ? `- Velocidad: ${currentData.speed} km/h` : ''}
${currentData.engineTemp ? `- Temperatura Motor: ${currentData.engineTemp}°C` : ''}
${currentData.batteryVoltage ? `- Voltaje Batería: ${currentData.batteryVoltage}V` : ''}
${currentData.fuelLevel !== undefined ? `- Nivel Combustible: ${currentData.fuelLevel}%` : ''}
${currentData.brakeStatus ? `- Estado Frenos: ${currentData.brakeStatus}` : ''}
${currentData.dtcCodes?.length ? `- Códigos DTC: ${currentData.dtcCodes.join(', ')}` : ''}

${context.historicalData?.length ? `
DATOS HISTÓRICOS (últimas ${context.historicalData.length} lecturas):
${context.historicalData.map(d =>
  `  ${d.timestamp.toLocaleTimeString()}: Temp=${d.engineTemp}°C, RPM=${d.rpm}, Vel=${d.speed}km/h`
).join('\n')}
` : ''}

Proporciona un diagnóstico profesional en formato JSON con:
1. diagnosis: Explicación detallada del problema en español
2. recommendations: Array de recomendaciones específicas y accionables
3. severity: Nivel de severidad (low, medium, high, critical)

Responde SOLO con JSON válido, sin texto adicional.
`.trim();
}

/**
 * System prompt para el mecánico experto
 */
const SYSTEM_PROMPT = `
Eres un mecánico experto especializado en vehículos de transporte público (buses).
Tienes más de 20 años de experiencia diagnosticando problemas mecánicos y eléctricos.

Tu trabajo es analizar datos de sensores IoT y proporcionar:
1. Diagnósticos precisos y comprensibles
2. Recomendaciones accionables y priorizadas
3. Evaluación de severidad realista

IMPORTANTE:
- Responde siempre en español
- Sé específico y técnico pero comprensible
- Prioriza la seguridad del conductor y pasajeros
- Considera el contexto de transporte público (no puede parar indefinidamente)
- Responde ÚNICAMENTE con JSON válido
- No inventes datos que no te proporcionen

FORMATO DE RESPUESTA (JSON):
{
  "diagnosis": "Descripción detallada del problema",
  "recommendations": [
    "Primera acción a tomar",
    "Segunda acción a tomar",
    "Tercera acción a tomar"
  ],
  "severity": "low|medium|high|critical"
}

NIVELES DE SEVERIDAD:
- low: Problema menor, puede esperar al próximo mantenimiento
- medium: Requiere atención pronto, programar revisión en 1-3 días
- high: Requiere atención urgente, revisar en 24 horas
- critical: Peligro inmediato, detener vehículo y no operar hasta reparar
`.trim();

/**
 * Helper para sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Obtener estadísticas de uso (para monitoring)
 */
export function getUsageStats() {
  return {
    enabled: CONFIG.enabled,
    model: CONFIG.model,
    // TODO: Agregar más estadísticas (total requests, total cost, etc.)
  };
}
