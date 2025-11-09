"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FleetMap } from './_components/fleet-map';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

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

export default function MapPage() {
  const router = useRouter();
  const { user } = useUser();
  const [vehicles, setVehicles] = useState<VehiclePosition[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Determinar el estado del vehículo basado en alertas recientes
   */
  const getVehicleStatus = (
    vehicleId: string,
    alerts: Alert[],
    lastUpdate: Date
  ): VehiclePosition['status'] => {
    // Offline si no hay datos en los últimos 5 minutos
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (lastUpdate < fiveMinutesAgo) {
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
  const fetchVehiclePositions = async () => {
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

      // Agrupar por vehículo y obtener la posición más reciente
      const latestPositions = new Map<string, VehicleStats>();
      (stats as VehicleStats[]).forEach((stat) => {
        if (!latestPositions.has(stat.vehicle_id)) {
          latestPositions.set(stat.vehicle_id, stat);
        }
      });

      // Convertir a formato de VehiclePosition
      const vehiclePositions: VehiclePosition[] = Array.from(latestPositions.values())
        .filter((stat) => stat.gps_lat !== null && stat.gps_lng !== null)
        .map((stat) => {
          const lastUpdate = new Date(stat.timestamp);
          const status = getVehicleStatus(
            stat.vehicle_id,
            (alerts as Alert[]) || [],
            lastUpdate
          );

          return {
            vehicleId: stat.vehicle_id,
            lat: stat.gps_lat!,
            lng: stat.gps_lng!,
            speed: stat.speed || undefined,
            status,
            lastUpdate,
          };
        });

      setVehicles(vehiclePositions);
      console.log(`[MapPage] Loaded ${vehiclePositions.length} vehicle positions`);
    } catch (error) {
      console.error('[MapPage] Error in fetchVehiclePositions:', error);
    } finally {
      setLoading(false);
    }
  };

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
  }, [user]);

  /**
   * Navegar a detalles del vehículo
   */
  const handleVehicleClick = (vehicleId: string) => {
    router.push(`/dashboard/vehicles/${vehicleId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
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
  );
}
