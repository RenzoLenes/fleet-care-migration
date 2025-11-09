// Simulation Manager - Manages lifecycle of IoT data simulation
import { IoTDataSimulator } from './iot-simulator';
import { DataSimulationConfig, VehicleIoTData } from './types';
import { db } from '@/db';
import { vehicleStats, alerts } from '@/db/schema';
import { generateDiagnosis, type VehicleAlertContext } from './openai-service';

type SimulationCallback =
  | (VehicleIoTData & { type: 'vehicle_data' })
  | {
      type: 'alert';
      tenant_id: string;
      vehicle_id: string;
      timestamp: string;
      severity: 'low' | 'medium' | 'high';
      alert_type: string;
      description: string;
      recommendation: string;
    };

interface SimulationSession {
  tenantId: string;
  config: DataSimulationConfig;
  simulator: IoTDataSimulator;
  intervalId: NodeJS.Timeout | null;
  startedAt: Date;
  dataPointsGenerated: number;
  alertsGenerated: number;
  active: boolean;
}

// Use globalThis to persist sessions across hot reloads
// This ensures that even if SimulationManager is re-instantiated,
// the sessions Map persists and we can properly clean up intervals
declare global {
  // eslint-disable-next-line no-var
  var __simulationSessions: Map<string, SimulationSession> | undefined;
}

export class SimulationManager {
  private static instance: SimulationManager;
  private sessions: Map<string, SimulationSession>;

  private constructor() {
    // Use global sessions map if it exists (from previous hot reload)
    // Otherwise create a new one and store it globally
    if (!global.__simulationSessions) {
      console.log('[SimulationManager] Creating new global sessions Map');
      global.__simulationSessions = new Map();
    } else {
      console.log('[SimulationManager] Reusing existing global sessions Map with', global.__simulationSessions.size, 'sessions');
    }
    this.sessions = global.__simulationSessions;
  }

  static getInstance(): SimulationManager {
    if (!SimulationManager.instance) {
      SimulationManager.instance = new SimulationManager();
    }
    return SimulationManager.instance;
  }

  /**
   * Start simulation for a tenant
   */
  async startSimulation(
    tenantId: string,
    config: DataSimulationConfig,
    onDataGenerated?: (data: SimulationCallback) => Promise<void>
  ): Promise<void> {
    // Stop existing simulation if any
    if (this.sessions.has(tenantId)) {
      await this.stopSimulation(tenantId);
    }

    const simulator = new IoTDataSimulator();

    // Configure error probability if specified
    if (config.errorProbability !== undefined) {
      simulator.setErrorProbability(config.errorProbability);
    }

    // Initialize all vehicles
    config.vehicles.forEach(vehicleId => {
      simulator.initializeVehicle(vehicleId);
    });

    const session: SimulationSession = {
      tenantId,
      config,
      simulator,
      intervalId: null,
      startedAt: new Date(),
      dataPointsGenerated: 0,
      alertsGenerated: 0,
      active: true
    };

    // Start periodic data generation
    const intervalMs = config.interval * 1000; // Convert to milliseconds

    session.intervalId = setInterval(async () => {
      try {
        await this.generateDataPoints(session, onDataGenerated);
      } catch (error) {
        console.error('[SimulationManager] Error generating data:', error);
      }
    }, intervalMs);

    // Store session
    this.sessions.set(tenantId, session);

    console.log(`[SimulationManager] Started simulation for tenant ${tenantId} with ${config.vehicles.length} vehicles`);

    // Schedule auto-stop if duration is specified
    if (config.duration > 0) {
      setTimeout(async () => {
        await this.stopSimulation(tenantId);
        console.log(`[SimulationManager] Auto-stopped simulation for tenant ${tenantId} after ${config.duration}s`);
      }, config.duration * 1000);
    }
  }

  /**
   * Stop simulation for a tenant
   */
  async stopSimulation(tenantId: string): Promise<void> {
    const session = this.sessions.get(tenantId);

    if (!session) {
      console.log(`[SimulationManager] ⚠️ No active simulation found (may be due to hot reload)`);
      return;
    }

    if (session.intervalId) {
      clearInterval(session.intervalId);
      session.intervalId = null;
    }

    session.active = false;
    this.sessions.delete(tenantId);

    const duration = Math.round((Date.now() - session.startedAt.getTime()) / 1000);
    console.log(`[SimulationManager] Stopped simulation - ${session.dataPointsGenerated} data points, ${session.alertsGenerated} alerts (${duration}s)`);
  }

  /**
   * Generate data points for all vehicles in a session
   */
  private async generateDataPoints(
    session: SimulationSession,
    onDataGenerated?: (data: SimulationCallback) => Promise<void>
  ): Promise<void> {
    const { tenantId, config, simulator } = session;

    for (const vehicleId of config.vehicles) {
      try {
        // Generate IoT data
        const iotData = simulator.generateData(vehicleId, tenantId);
        session.dataPointsGenerated++;

        // Save vehicle data directly to database
        if (onDataGenerated) {
          await onDataGenerated({
            type: 'vehicle_data',
            ...iotData
          });
        } else {
          // Default: save directly to database
          await this.saveVehicleData(iotData);
        }

        // Check if we should generate an alert
        const alert = simulator.generateAlert(iotData);

        if (alert) {
          session.alertsGenerated++;

          if (onDataGenerated) {
            await onDataGenerated({
              type: 'alert',
              tenant_id: tenantId,
              vehicle_id: vehicleId,
              timestamp: new Date().toISOString(),
              ...alert
            });
          } else {
            // Save alert directly to database with LLM diagnosis
            await this.saveAlert(tenantId, vehicleId, alert, iotData);
          }
        }
      } catch (error) {
        console.error(`[SimulationManager] Error generating data for vehicle ${vehicleId}:`, error);
      }
    }
  }

  /**
   * Save vehicle IoT data directly to database
   */
  private async saveVehicleData(data: VehicleIoTData): Promise<void> {
    try {
      await db.insert(vehicleStats).values({
        tenant_id: data.tenant_id,
        vehicle_id: data.vehicle_id,
        timestamp: new Date(data.timestamp),
        rpm: data.rpm || null,
        speed: data.speed || null,
        engine_temp: data.engine_temp || null,
        battery_voltage: data.battery_voltage ? data.battery_voltage.toString() : null,
        brake_status: data.brake_status || null,
        dtc_codes: data.dtc_codes || null,
        fuel_level: data.fuel_level || null,
        gps_lat: data.gps?.lat ? data.gps.lat.toString() : null,
        gps_lng: data.gps?.lng ? data.gps.lng.toString() : null,
        gps_accuracy: data.gps?.accuracy ? data.gps.accuracy.toString() : null,
      });

      console.log(`[SimulationManager] Vehicle data saved: ${data.vehicle_id}`);
    } catch (error) {
      console.error(`[SimulationManager] Error saving vehicle data for ${data.vehicle_id}:`, error);
      throw error;
    }
  }

  /**
   * Save alert directly to database with LLM diagnosis
   */
  private async saveAlert(
    tenantId: string,
    vehicleId: string,
    alert: {
      severity: 'low' | 'medium' | 'high';
      alert_type: string;
      description: string;
      recommendation: string;
    },
    vehicleData: VehicleIoTData
  ): Promise<void> {
    try {
      // Prepare LLM context
      const llmContext: VehicleAlertContext = {
        vehicleId,
        timestamp: new Date(),
        alertType: alert.alert_type,
        currentData: {
          rpm: vehicleData.rpm,
          speed: vehicleData.speed,
          engineTemp: vehicleData.engine_temp,
          batteryVoltage: vehicleData.battery_voltage,
          fuelLevel: vehicleData.fuel_level,
          brakeStatus: vehicleData.brake_status,
          dtcCodes: vehicleData.dtc_codes,
        },
        // TODO: Agregar datos históricos para mejor contexto
      };

      // Try to get LLM diagnosis
      let llmDiagnosis: string | null = null;
      let llmRecommendations: string[] | null = null;
      let llmSeverity: string | null = null;
      let llmCost: number | null = null;
      let llmTokens: number | null = null;
      let llmCached: boolean = false;

      try {
        const diagnosis = await generateDiagnosis(llmContext);
        llmDiagnosis = diagnosis.diagnosis;
        llmRecommendations = diagnosis.recommendations;
        llmSeverity = diagnosis.severity;
        llmCost = diagnosis.estimatedCost;
        llmTokens = diagnosis.tokensUsed;
        llmCached = diagnosis.cached;

        console.log(`[SimulationManager] LLM diagnosis generated for ${vehicleId} - $${llmCost?.toFixed(4)}`);

        // IMPORTANTE: Usar la evaluación del LLM para mejorar la alerta
        // Si el LLM determina una severidad diferente, usamos la del LLM
        if (llmSeverity) {
          // Map LLM severity to alert severity (LLM puede devolver 'critical')
          if (llmSeverity === 'critical') {
            alert.severity = 'high'; // DB solo acepta low, medium, high
          } else if (['low', 'medium', 'high'].includes(llmSeverity)) {
            alert.severity = llmSeverity as 'low' | 'medium' | 'high';
          }
        }

        // Usar el diagnóstico del LLM como descripción principal (más detallada)
        if (llmDiagnosis) {
          alert.description = llmDiagnosis;
        }

        // Usar las recomendaciones del LLM (más accionables)
        if (llmRecommendations && llmRecommendations.length > 0) {
          // Combinar todas las recomendaciones en una sola string
          alert.recommendation = llmRecommendations.join(' | ');
        }

      } catch (error) {
        // Fallback: if LLM fails, continue with basic alert
        console.warn(`[SimulationManager] LLM diagnosis failed for ${vehicleId}, using fallback:`, error);
        // Use basic description and recommendation as fallback
        llmDiagnosis = null;
        llmRecommendations = null;
      }

      // Save alert to database
      await db.insert(alerts).values({
        tenant_id: tenantId,
        vehicle_id: vehicleId,
        timestamp: new Date(),
        severity: alert.severity,
        alert_type: alert.alert_type,
        description: alert.description,
        recomendation: alert.recommendation,
        status: 'pending',
        // LLM fields (Fase 1)
        llm_diagnosis: llmDiagnosis,
        llm_recommendations: llmRecommendations || null, // Drizzle convierte array a JSONB automáticamente
        llm_severity: llmSeverity,
        llm_cost: llmCost?.toString(),
        llm_tokens: llmTokens,
        llm_cached: llmCached,
      });

      console.log(`[SimulationManager] Alert created: ${alert.alert_type} for ${vehicleId}${llmDiagnosis ? ' (with LLM diagnosis)' : ''}`);
    } catch (error) {
      console.error(`[SimulationManager] Error saving alert for ${vehicleId}:`, error);
      throw error;
    }
  }

  /**
   * Check if simulation is active for a tenant
   */
  isActive(tenantId: string): boolean {
    const session = this.sessions.get(tenantId);
    return session?.active ?? false;
  }

  /**
   * Get simulation statistics
   */
  getStats(tenantId: string): {
    active: boolean;
    dataPointsGenerated: number;
    alertsGenerated: number;
    vehicleCount: number;
    uptimeSeconds: number;
  } | null {
    const session = this.sessions.get(tenantId);

    if (!session) {
      return null;
    }

    return {
      active: session.active,
      dataPointsGenerated: session.dataPointsGenerated,
      alertsGenerated: session.alertsGenerated,
      vehicleCount: session.config.vehicles.length,
      uptimeSeconds: Math.round((Date.now() - session.startedAt.getTime()) / 1000)
    };
  }

  /**
   * Get all active sessions (for debugging)
   */
  getActiveSessions(): string[] {
    return Array.from(this.sessions.keys()).filter(tenantId =>
      this.sessions.get(tenantId)?.active
    );
  }

  /**
   * Stop all simulations (useful for graceful shutdown)
   */
  async stopAllSimulations(): Promise<void> {
    const tenantIds = Array.from(this.sessions.keys());

    for (const tenantId of tenantIds) {
      await this.stopSimulation(tenantId);
    }

    console.log('[SimulationManager] All simulations stopped');
  }
}

// Export singleton instance
export const simulationManager = SimulationManager.getInstance();
