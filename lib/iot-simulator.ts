// IoT Data Simulator - Generates realistic vehicle sensor data
import { VehicleIoTData } from './types';

interface VehicleState {
  vehicleId: string;
  currentLat: number;
  currentLng: number;
  currentSpeed: number;
  currentRpm: number;
  currentEngineTemp: number;
  currentBatteryVoltage: number;
  currentFuelLevel: number;
  brakeWear: number;
  mileage: number;
  lastMaintenanceKm: number;
  pattern: 'city' | 'highway' | 'idle' | 'mixed';
}

export class IoTDataSimulator {
  private vehicleStates: Map<string, VehicleState> = new Map();
  private errorProbability: number = 0.3; // Default: 30% de probabilidad de errores (0 = sin errores, 1 = máximo errores)
  private dtcCodes = [
    'P0300', 'P0420', 'P0171', 'P0455', 'P0128',
    'P0101', 'P0134', 'P0174', 'P0401', 'P0442'
  ];

  // Starting locations for different vehicles (Peruvian cities / Ciudades peruanas)
  private startingLocations = [
    { lat: -12.0464, lng: -77.0428, city: 'Lima' },      // Lima
    { lat: -16.4090, lng: -71.5375, city: 'Arequipa' },  // Arequipa
    { lat: -13.5319, lng: -71.9675, city: 'Cuzco' },     // Cusco
    { lat: -8.1116, lng: -79.0288, city: 'Trujillo' },   // Trujillo
    { lat: -6.7714, lng: -79.8411, city: 'Chiclayo' },   // Chiclayo
  ];

  /**
   * Set error probability multiplier (0 to 1)
   * 0 = no errors, 0.5 = medium probability, 1 = maximum errors
   */
  setErrorProbability(probability: number): void {
    this.errorProbability = Math.max(0, Math.min(1, probability)); // Clamp between 0 and 1
    console.log(`[IoTDataSimulator] Error probability set to ${(this.errorProbability * 100).toFixed(0)}%`);
  }

  /**
   * Get current error probability
   */
  getErrorProbability(): number {
    return this.errorProbability;
  }

  /**
   * Initialize a vehicle with random starting parameters
   */
  initializeVehicle(vehicleId: string): void {
    const location = this.startingLocations[Math.floor(Math.random() * this.startingLocations.length)];
    const patterns: Array<'city' | 'highway' | 'idle' | 'mixed'> = ['city', 'highway', 'idle', 'mixed'];

    // Ajustar valores iniciales basados en errorProbability
    // errorProbability alto = más probabilidad de empezar con valores problemáticos
    const batteryBase = 12.6 - (this.errorProbability * 0.4); // Con prob=1: 12.2V (cerca del límite de alerta 12.0V)
    const fuelBase = 65 - (this.errorProbability * 30); // Con prob=1: 35% (más cerca del límite 15%)
    const brakeWearMax = 15 + (this.errorProbability * 35); // Con prob=1: hasta 50% de desgaste inicial

    this.vehicleStates.set(vehicleId, {
      vehicleId,
      currentLat: location.lat + (Math.random() - 0.5) * 0.1, // ±0.05 degrees variation
      currentLng: location.lng + (Math.random() - 0.5) * 0.1,
      currentSpeed: 0,
      currentRpm: 800 + Math.random() * 200, // Idle RPM
      currentEngineTemp: 20 + Math.random() * 10, // Starting cold
      currentBatteryVoltage: batteryBase + Math.random() * 0.4,
      currentFuelLevel: fuelBase + Math.random() * 35,
      brakeWear: Math.random() * brakeWearMax,
      mileage: Math.floor(50000 + Math.random() * 150000),
      lastMaintenanceKm: Math.floor(48000 + Math.random() * 145000),
      pattern: patterns[Math.floor(Math.random() * patterns.length)]
    });
  }

  /**
   * Generate realistic IoT data for a vehicle
   */
  generateData(vehicleId: string, tenantId: string): VehicleIoTData {
    let state = this.vehicleStates.get(vehicleId);

    if (!state) {
      this.initializeVehicle(vehicleId);
      state = this.vehicleStates.get(vehicleId)!;
    }

    // Update vehicle state based on pattern
    this.updateVehicleState(state);

    // Generate DTC codes con probabilidad ajustada por errorProbability
    // Base: 0.5%, con errorProbability=1 puede llegar hasta 5%
    const dtcCodes: string[] = [];
    const dtcProbability = 0.005 + (this.errorProbability * 0.045); // 0.5% a 5%
    if (Math.random() < dtcProbability) {
      const numCodes = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < numCodes; i++) {
        dtcCodes.push(this.dtcCodes[Math.floor(Math.random() * this.dtcCodes.length)]);
      }
    }

    // Determine brake status
    let brakeStatus = 'ok';
    if (state.brakeWear > 70) brakeStatus = 'critical';
    else if (state.brakeWear > 50) brakeStatus = 'warning';

    const data: VehicleIoTData = {
      tenant_id: tenantId,
      vehicle_id: vehicleId,
      timestamp: new Date().toISOString(),
      rpm: Math.round(state.currentRpm),
      speed: Math.round(state.currentSpeed),
      engine_temp: Math.round(state.currentEngineTemp),
      battery_voltage: Math.round(state.currentBatteryVoltage * 10) / 10,
      fuel_level: Math.round(state.currentFuelLevel),
      brake_status: brakeStatus,
      dtc_codes: dtcCodes.length > 0 ? dtcCodes : undefined,
      gps: {
        lat: Math.round(state.currentLat * 1000000) / 1000000,
        lng: Math.round(state.currentLng * 1000000) / 1000000,
        accuracy: 5 + Math.random() * 10 // 5-15 meters
      }
    };

    // Update state
    this.vehicleStates.set(vehicleId, state);

    return data;
  }

  /**
   * Update vehicle state to simulate realistic behavior
   */
  private updateVehicleState(state: VehicleState): void {
    const pattern = state.pattern;

    // Update based on pattern
    switch (pattern) {
      case 'city':
        this.simulateCityDriving(state);
        break;
      case 'highway':
        this.simulateHighwayDriving(state);
        break;
      case 'idle':
        this.simulateIdling(state);
        break;
      case 'mixed':
        this.simulateMixedDriving(state);
        break;
    }

    // Update GPS position based on speed
    if (state.currentSpeed > 0) {
      // Move vehicle (simplified - random direction)
      const angle = Math.random() * Math.PI * 2;
      const distance = state.currentSpeed / 111000; // km to degrees (approximate)
      state.currentLat += Math.cos(angle) * distance;
      state.currentLng += Math.sin(angle) * distance;
    }

    // Update fuel consumption
    const fuelConsumption = (state.currentRpm / 1000 + state.currentSpeed / 100) * 0.001;
    state.currentFuelLevel = Math.max(0, state.currentFuelLevel - fuelConsumption);

    // Refuel if very low (simulate refueling stop)
    if (state.currentFuelLevel < 10 && Math.random() < 0.3) {
      state.currentFuelLevel = 90 + Math.random() * 10;
    }

    // Update mileage
    state.mileage += state.currentSpeed / 3600; // speed in km/h to km per reading

    // Gradually increase brake wear (reducido de 0.001 a 0.0001 para menos alertas)
    if (state.currentSpeed > 20) {
      state.brakeWear += 0.0001;
    }

    // Occasionally change pattern (10% chance)
    if (Math.random() < 0.1) {
      const patterns: Array<'city' | 'highway' | 'idle' | 'mixed'> = ['city', 'highway', 'idle', 'mixed'];
      state.pattern = patterns[Math.floor(Math.random() * patterns.length)];
    }
  }

  /**
   * Simulate city driving pattern
   */
  private simulateCityDriving(state: VehicleState): void {
    // City: 0-60 km/h, frequent stops
    const targetSpeed = Math.random() < 0.3 ? 0 : 20 + Math.random() * 40;
    state.currentSpeed += (targetSpeed - state.currentSpeed) * 0.1;

    // RPM follows speed
    if (state.currentSpeed < 5) {
      state.currentRpm = 800 + Math.random() * 200; // Idle
    } else {
      state.currentRpm = 1500 + state.currentSpeed * 30 + Math.random() * 500;
    }

    // Engine temp rises slowly in city
    // Con errorProbability alto, puede alcanzar temperaturas más altas (potencial sobrecalentamiento)
    const tempBase = 80 + (this.errorProbability * 10); // 80-90°C base según probabilidad
    const targetTemp = tempBase + Math.random() * (10 + this.errorProbability * 10); // +10 a +20°C aleatorio
    state.currentEngineTemp += (targetTemp - state.currentEngineTemp) * 0.05;

    // Battery voltage stable
    state.currentBatteryVoltage = 12.6 + Math.random() * 0.3;
  }

  /**
   * Simulate highway driving pattern
   */
  private simulateHighwayDriving(state: VehicleState): void {
    // Highway: 80-120 km/h, constant speed
    const targetSpeed = 80 + Math.random() * 40;
    state.currentSpeed += (targetSpeed - state.currentSpeed) * 0.05;

    // RPM higher but steady
    state.currentRpm = 2000 + state.currentSpeed * 20 + Math.random() * 300;

    // Engine temp higher on highway
    // Con errorProbability alto, puede alcanzar temperaturas críticas (>100°C)
    const tempBase = 85 + (this.errorProbability * 12); // 85-97°C base según probabilidad
    const targetTemp = tempBase + Math.random() * (7 + this.errorProbability * 8); // +7 a +15°C aleatorio
    state.currentEngineTemp += (targetTemp - state.currentEngineTemp) * 0.05;

    // Battery charging well
    state.currentBatteryVoltage = 13.5 + Math.random() * 0.5;
  }

  /**
   * Simulate idling pattern
   */
  private simulateIdling(state: VehicleState): void {
    // Idling: speed 0, low RPM
    state.currentSpeed *= 0.8; // Gradually stop

    state.currentRpm = 800 + Math.random() * 200;

    // Engine temp gradually decreases when idle
    const targetTemp = 60 + Math.random() * 10;
    state.currentEngineTemp += (targetTemp - state.currentEngineTemp) * 0.02;

    // Battery may drain slightly when idle
    state.currentBatteryVoltage = 12.4 + Math.random() * 0.2;
  }

  /**
   * Simulate mixed driving pattern
   */
  private simulateMixedDriving(state: VehicleState): void {
    // Mixed: alternates between patterns
    const rand = Math.random();
    if (rand < 0.4) {
      this.simulateCityDriving(state);
    } else if (rand < 0.7) {
      this.simulateHighwayDriving(state);
    } else {
      this.simulateIdling(state);
    }
  }

  /**
   * Generate an alert based on vehicle data
   */
  generateAlert(data: VehicleIoTData): {
    severity: 'low' | 'medium' | 'high';
    alert_type: string;
    description: string;
    recommendation: string;
  } | null {
    // High temperature alert
    if (data.engine_temp && data.engine_temp > 100) {
      return {
        severity: data.engine_temp > 110 ? 'high' : 'medium',
        alert_type: 'engine_overheating',
        description: `Temperatura del motor elevada: ${data.engine_temp}°C`,
        recommendation: 'Detener el vehículo de forma segura y revisar el sistema de refrigeración. Verificar nivel de refrigerante.'
      };
    }

    // Low battery alert
    if (data.battery_voltage && data.battery_voltage < 12.0) {
      return {
        severity: data.battery_voltage < 11.5 ? 'high' : 'medium',
        alert_type: 'low_battery',
        description: `Voltaje de batería bajo: ${data.battery_voltage}V`,
        recommendation: 'Revisar sistema de carga. Verificar alternador y estado de la batería.'
      };
    }

    // Low fuel alert
    if (data.fuel_level && data.fuel_level < 15) {
      return {
        severity: data.fuel_level < 5 ? 'high' : 'low',
        alert_type: 'low_fuel',
        description: `Nivel de combustible bajo: ${data.fuel_level}%`,
        recommendation: 'Repostar combustible en la próxima estación de servicio.'
      };
    }

    // Brake warning
    if (data.brake_status === 'critical') {
      return {
        severity: 'high',
        alert_type: 'brake_failure',
        description: 'Sistema de frenos en estado crítico',
        recommendation: 'URGENTE: Detener vehículo y no continuar operando hasta revisar el sistema de frenos.'
      };
    } else if (data.brake_status === 'warning') {
      return {
        severity: 'medium',
        alert_type: 'brake_wear',
        description: 'Desgaste elevado en sistema de frenos',
        recommendation: 'Programar revisión y reemplazo de pastillas/discos de freno.'
      };
    }

    // DTC codes alert
    if (data.dtc_codes && data.dtc_codes.length > 0) {
      return {
        severity: data.dtc_codes.length > 2 ? 'high' : 'medium',
        alert_type: 'diagnostic_trouble_codes',
        description: `Códigos de diagnóstico detectados: ${data.dtc_codes.join(', ')}`,
        recommendation: 'Realizar escaneo completo con herramienta de diagnóstico. Revisar sistema de control del motor.'
      };
    }

    // High RPM alert
    if (data.rpm && data.rpm > 4500) {
      return {
        severity: data.rpm > 5500 ? 'high' : 'medium',
        alert_type: 'high_rpm',
        description: `RPM elevadas: ${data.rpm}`,
        recommendation: 'Reducir revoluciones del motor. Verificar que el vehículo no esté sobrecargado.'
      };
    }

    return null;
  }

  /**
   * Reset vehicle state (for testing or resetting simulation)
   */
  resetVehicle(vehicleId: string): void {
    this.vehicleStates.delete(vehicleId);
  }

  /**
   * Get current state of a vehicle
   */
  getVehicleState(vehicleId: string): VehicleState | undefined {
    return this.vehicleStates.get(vehicleId);
  }
}
