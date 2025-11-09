// Simulation Manager - Manages lifecycle of IoT data simulation
import { IoTDataSimulator } from './iot-simulator';
import { DataSimulationConfig } from './types';

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

export class SimulationManager {
  private static instance: SimulationManager;
  private sessions: Map<string, SimulationSession> = new Map();

  private constructor() {
    // Singleton pattern
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
    onDataGenerated?: (data: any) => Promise<void>
  ): Promise<void> {
    // Stop existing simulation if any
    if (this.sessions.has(tenantId)) {
      await this.stopSimulation(tenantId);
    }

    const simulator = new IoTDataSimulator();

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
      console.log(`[SimulationManager] No active simulation for tenant ${tenantId}`);
      return;
    }

    if (session.intervalId) {
      clearInterval(session.intervalId);
    }

    session.active = false;
    this.sessions.delete(tenantId);

    console.log(`[SimulationManager] Stopped simulation for tenant ${tenantId}`);
    console.log(`  - Data points generated: ${session.dataPointsGenerated}`);
    console.log(`  - Alerts generated: ${session.alertsGenerated}`);
    console.log(`  - Duration: ${Math.round((Date.now() - session.startedAt.getTime()) / 1000)}s`);
  }

  /**
   * Generate data points for all vehicles in a session
   */
  private async generateDataPoints(
    session: SimulationSession,
    onDataGenerated?: (data: any) => Promise<void>
  ): Promise<void> {
    const { tenantId, config, simulator } = session;

    for (const vehicleId of config.vehicles) {
      try {
        // Generate IoT data
        const iotData = simulator.generateData(vehicleId, tenantId);
        session.dataPointsGenerated++;

        // Send to ingestion endpoint
        if (onDataGenerated) {
          await onDataGenerated({
            type: 'vehicle_data',
            ...iotData
          });
        } else {
          // Default: send to internal API
          await this.sendToIngestionAPI({
            type: 'vehicle_data',
            ...iotData
          });
        }

        // Check if we should generate an alert
        const alert = simulator.generateAlert(iotData);

        if (alert) {
          session.alertsGenerated++;

          const alertPayload = {
            type: 'alert',
            tenant_id: tenantId,
            vehicle_id: vehicleId,
            timestamp: new Date().toISOString(),
            ...alert
          };

          if (onDataGenerated) {
            await onDataGenerated(alertPayload);
          } else {
            await this.sendToIngestionAPI(alertPayload);
          }
        }
      } catch (error) {
        console.error(`[SimulationManager] Error generating data for vehicle ${vehicleId}:`, error);
      }
    }
  }

  /**
   * Send data to the ingestion API endpoint
   */
  private async sendToIngestionAPI(payload: any): Promise<void> {
    try {
      // Determine base URL - in server context we can use localhost
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
                      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                      'http://localhost:3000';

      const username = process.env.NEXT_PUBLIC_WEBHOOK_USERNAME;
      const password = process.env.NEXT_PUBLIC_WEBHOOK_PASSWORD;

      if (!username || !password) {
        console.error('[SimulationManager] Missing webhook credentials in environment');
        return;
      }

      const credentials = Buffer.from(`${username}:${password}`).toString('base64');

      const response = await fetch(`${baseUrl}/api/ingest-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[SimulationManager] Failed to send data to ingestion API:', error);
      }
    } catch (error) {
      console.error('[SimulationManager] Error sending data to ingestion API:', error);
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
