"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AppLayout } from '@/app/_components/layout/app-layout';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

const FleetMap = dynamic(() => import('./_components/fleet-map').then(mod => ({ default: mod.FleetMap })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-muted/10 rounded-lg">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

interface VehiclePosition {
  vehicleId: string;
  lat: number;
  lng: number;
  speed?: number;
  status: 'normal' | 'warning' | 'critical' | 'offline';
  lastUpdate: Date;
}

interface VehicleStats {
  vehicle_id: string;
  gps_lat: number | null;
  gps_lng: number | null;
  speed: number | null;
  engine_temp: number | null;
  battery_voltage: number | null;
  timestamp: string;
}

interface Alert {
  vehicle_id: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

// Lista de todos los vehículos registrados en el sistema
const REGISTERED_VEHICLES = ["BUS-001", "BUS-002", "BUS-003", "BUS-004", "BUS-005"];

// Posición por defecto para vehículos sin datos (Lima, Perú)
const DEFAULT_POSITION = { lat: -12.0464, lng: -77.0428 };

export default function MapPage() {
  const router = useRouter();
  const { user } = useUser();
  const [vehicles, setVehicles] = useState<VehiclePosition[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Determinar el estado del vehículo basado en alertas recientes y última actualización
   */
  const getVehicleStatus = (
    vehicleId: string,
    alerts: Alert[],
    lastUpdate: Date
  ): VehiclePosition['status'] => {
    // Offline si no hay datos en los últimos 2 minutos (más del doble del intervalo de envío)
    // Nota: La simulación envía datos cada ~5 segundos, así que 2 minutos es tiempo suficiente
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    if (lastUpdate < twoMinutesAgo) {
      console.log(`[MapPage] Vehicle ${vehicleId} is offline - last update: ${lastUpdate.toISOString()}`);
      return 'offline';
    }

    // Buscar alertas del vehículo en los últimos 30 minutos
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recentAlerts = alerts.filter(
      (alert) =>
        alert.vehicle_id === vehicleId &&
        new Date(alert.timestamp) > thirtyMinutesAgo
    );

    if (recentAlerts.length === 0) return 'normal';

    // Crítico si hay alertas de severidad alta
    const hasHighAlert = recentAlerts.some((alert) => alert.severity === 'high');
    if (hasHighAlert) return 'critical';

    // Advertencia si hay alertas de severidad media
    const hasMediumAlert = recentAlerts.some((alert) => alert.severity === 'medium');
    if (hasMediumAlert) return 'warning';

    return 'normal';
  };

  /**
   * Cargar posiciones de vehículos desde la base de datos
   */
  const fetchVehiclePositions = useCallback(async () => {
    try {
      if (!user) return;

      // Obtener tenant_id del usuario
      const { data: appUser } = await supabase
        .from('app_users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!appUser) {
        console.log('[MapPage] User not found in app_users');
        return;
      }

      const tenantId = appUser.tenant_id;

      // Obtener últimas posiciones de vehículos
      const { data: stats, error: statsError } = await supabase
        .from('vehicle_stats')
        .select('vehicle_id, gps_lat, gps_lng, speed, engine_temp, battery_voltage, timestamp')
        .eq('tenant_id', tenantId)
        .not('gps_lat', 'is', null)
        .not('gps_lng', 'is', null)
        .order('timestamp', { ascending: false });

      if (statsError) {
        console.error('[MapPage] Error fetching vehicle stats:', statsError);
        return;
      }

      // Obtener alertas recientes
      const { data: alerts, error: alertsError } = await supabase
        .from('alerts')
        .select('vehicle_id, severity, timestamp')
        .eq('tenant_id', tenantId)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (alertsError) {
        console.error('[MapPage] Error fetching alerts:', alertsError);
      }

      // Agrupar por vehículo y obtener la posición más reciente de los que tienen datos
      const latestPositions = new Map<string, VehicleStats>();
      (stats as VehicleStats[]).forEach((stat) => {
        if (!latestPositions.has(stat.vehicle_id)) {
          latestPositions.set(stat.vehicle_id, stat);
        }
      });

      // Crear array con TODOS los vehículos registrados
      const vehiclePositions: VehiclePosition[] = REGISTERED_VEHICLES.map((vehicleId) => {
        const stat = latestPositions.get(vehicleId);

        // Si el vehículo NO tiene datos, mostrarlo como offline en posición por defecto
        if (!stat || stat.gps_lat === null || stat.gps_lng === null) {
          return {
            vehicleId,
            lat: DEFAULT_POSITION.lat,
            lng: DEFAULT_POSITION.lng,
            speed: undefined,
            status: 'offline' as const,
            lastUpdate: new Date(0), // Fecha muy antigua
          };
        }

        // Si tiene datos, verificar su estado
        const lastUpdate = new Date(stat.timestamp);
        const status = getVehicleStatus(
          stat.vehicle_id,
          (alerts as Alert[]) || [],
          lastUpdate
        );

        return {
          vehicleId: stat.vehicle_id,
          lat: typeof stat.gps_lat === 'string' ? parseFloat(stat.gps_lat) : (stat.gps_lat || 0),
          lng: typeof stat.gps_lng === 'string' ? parseFloat(stat.gps_lng) : (stat.gps_lng || 0),
          speed: stat.speed || undefined,
          status,
          lastUpdate,
        };
      });

      setVehicles(vehiclePositions);

      // Contar vehículos por estado
      const statusCounts = vehiclePositions.reduce((acc, v) => {
        acc[v.status] = (acc[v.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log(`[MapPage] Loaded ${vehiclePositions.length} vehicles - Status:`, statusCounts);

      // Debug: Mostrar vehículos offline con detalles
      const offlineVehicles = vehiclePositions.filter(v => v.status === 'offline');
      if (offlineVehicles.length > 0) {
        console.log('[MapPage] Offline vehicles:', offlineVehicles.map(v => {
          const minutesSinceUpdate = Math.round((Date.now() - v.lastUpdate.getTime()) / 60000);
          const neverSentData = v.lastUpdate.getTime() === 0;
          return {
            id: v.vehicleId,
            reason: neverSentData ? 'Never sent data' : 'Data too old',
            lastUpdate: neverSentData ? 'N/A' : v.lastUpdate.toISOString(),
            minutesSinceUpdate: neverSentData ? 'N/A' : minutesSinceUpdate
          };
        }));
      }
    } catch (error) {
      console.error('[MapPage] Error in fetchVehiclePositions:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Suscripción a cambios en tiempo real
   */
  useEffect(() => {
    fetchVehiclePositions();

    // Actualizar cada 5 segundos (polling)
    const interval = setInterval(() => {
      fetchVehiclePositions();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchVehiclePositions]);

  /**
   * Navegar a detalles del vehículo
   */
  const handleVehicleClick = (vehicleId: string) => {
    router.push(`/dashboard/vehicles/${vehicleId}`);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[600px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mapa de Flota</h1>
          <p className="text-muted-foreground">
            Visualiza la ubicación y estado de todos tus vehículos en tiempo real
          </p>
        </div>

        <FleetMap
          vehicles={vehicles}
          onVehicleClick={handleVehicleClick}
        />
      </div>
    </AppLayout>
  );
}
