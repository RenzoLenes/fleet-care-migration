"use client";

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Fix para los iconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface VehiclePosition {
  vehicleId: string;
  lat: number;
  lng: number;
  speed?: number;
  status: 'normal' | 'warning' | 'critical' | 'offline';
  lastUpdate: Date;
}

interface FleetMapProps {
  vehicles: VehiclePosition[];
  center?: [number, number];
  zoom?: number;
  onVehicleClick?: (vehicleId: string) => void;
}

/**
 * Componente interno para ajustar el centro del mapa cuando cambian los vehículos
 */
function MapController({ vehicles }: { vehicles: VehiclePosition[] }) {
  const map = useMap();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Solo hacer fitBounds la primera vez que se cargan vehículos
    if (vehicles.length > 0 && !initialized) {
      const bounds = L.latLngBounds(
        vehicles.map(v => [v.lat, v.lng] as L.LatLngTuple)
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      setInitialized(true);
    }
  }, [vehicles, map, initialized]);

  return null;
}

/**
 * Obtener icono según el estado del vehículo
 */
function getVehicleIcon(status: VehiclePosition['status']): L.DivIcon {
  const colorMap = {
    normal: 'bg-gradient-to-br from-green-400 to-green-600',
    warning: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    critical: 'bg-gradient-to-br from-red-500 to-red-700',
    offline: 'bg-gradient-to-br from-gray-400 to-gray-600',
  };

  const color = colorMap[status];

  return L.divIcon({
    html: `
      <div class="relative transform transition-transform hover:scale-110">
        <div class="${color} w-10 h-10 rounded-full border-3 border-white shadow-xl flex items-center justify-center backdrop-blur-sm">
          <svg class="w-5 h-5 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
          </svg>
        </div>
        ${status === 'critical' ? `
          <div class="absolute -top-1 -right-1 flex">
            <span class="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-red-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-red-600 border-2 border-white"></span>
          </div>
        ` : ''}
        ${status === 'warning' ? `
          <div class="absolute -top-1 -right-1">
            <span class="relative inline-flex rounded-full h-3 w-3 bg-orange-400 border-2 border-white"></span>
          </div>
        ` : ''}
      </div>
    `,
    className: 'custom-vehicle-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
}

/**
 * Componente principal del mapa de flota
 */
export function FleetMap({
  vehicles,
  center = [-12.0464, -77.0428], // Lima, Perú por defecto
  zoom = 12,
  onVehicleClick
}: FleetMapProps) {
  const [mounted, setMounted] = useState(false);

  // Prevenir SSR issues con Leaflet
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="w-full h-[600px] flex items-center justify-center">
        <CardContent>
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: VehiclePosition['status']) => {
    switch (status) {
      case 'normal':
        return <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">✓ Normal</Badge>;
      case 'warning':
        return <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">⚠ Advertencia</Badge>;
      case 'critical':
        return <Badge className="bg-gradient-to-r from-red-500 to-red-700 text-white border-0 animate-pulse">⚡ Crítico</Badge>;
      case 'offline':
        return <Badge variant="secondary" className="bg-gray-400 text-white">⏸ Offline</Badge>;
    }
  };

  const getStatusStats = () => {
    const stats = {
      normal: vehicles.filter(v => v.status === 'normal').length,
      warning: vehicles.filter(v => v.status === 'warning').length,
      critical: vehicles.filter(v => v.status === 'critical').length,
      offline: vehicles.filter(v => v.status === 'offline').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  return (
    <Card className="w-full shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              Mapa de Flota en Tiempo Real
            </CardTitle>
            <CardDescription className="text-base">
              {vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''} monitoreado{vehicles.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">{stats.normal}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">{stats.warning}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-red-700 dark:text-red-300">{stats.critical}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{stats.offline}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[600px] w-full">
          <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={true}
            className="h-full w-full rounded-b-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {vehicles.length > 0 && <MapController vehicles={vehicles} />}

            {vehicles.map((vehicle) => (
              <Marker
                key={`${vehicle.vehicleId}-${vehicle.lat}-${vehicle.lng}`}
                position={[vehicle.lat, vehicle.lng]}
                icon={getVehicleIcon(vehicle.status)}
              >
                <Popup className="custom-popup" maxWidth={280}>
                  <div className="p-1">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-t-lg -mx-1 -mt-1 mb-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                          </svg>
                          {vehicle.vehicleId}
                        </h3>
                      </div>
                      <p className="text-xs text-blue-100 mt-1">
                        {new Date(vehicle.lastUpdate).toLocaleString('es-PE', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-3 px-2">
                      {/* Estado */}
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Estado</span>
                        {getStatusBadge(vehicle.status)}
                      </div>

                      {/* Velocidad */}
                      {vehicle.speed !== undefined && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Velocidad</span>
                          </div>
                          <span className="font-bold text-blue-600">{vehicle.speed} km/h</span>
                        </div>
                      )}

                      {/* Coordenadas */}
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Ubicación</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {vehicle.lat.toFixed(6)}, {vehicle.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>

                    {/* Button */}
                    <Button
                      size="sm"
                      className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                      onClick={() => onVehicleClick?.(vehicle.vehicleId)}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver Detalles Completos
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}
