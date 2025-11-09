"use client";

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (vehicles.length > 0) {
      // Calcular bounds para mostrar todos los vehículos
      const bounds = L.latLngBounds(
        vehicles.map(v => [v.lat, v.lng] as L.LatLngTuple)
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [vehicles, map]);

  return null;
}

/**
 * Obtener icono según el estado del vehículo
 */
function getVehicleIcon(status: VehiclePosition['status']): L.DivIcon {
  const colorMap = {
    normal: 'bg-green-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500',
    offline: 'bg-gray-500',
  };

  const color = colorMap[status];

  return L.divIcon({
    html: `
      <div class="relative">
        <div class="${color} w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
          </svg>
        </div>
        ${status === 'critical' ? `
          <div class="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
        ` : ''}
      </div>
    `,
    className: 'custom-vehicle-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
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
        return <Badge className="bg-green-500">Normal</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">Advertencia</Badge>;
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      case 'offline':
        return <Badge variant="secondary">Offline</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🗺️ Mapa de Flota en Tiempo Real
        </CardTitle>
        <CardDescription>
          {vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''} monitoreado{vehicles.length !== 1 ? 's' : ''}
        </CardDescription>
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
                key={vehicle.vehicleId}
                position={[vehicle.lat, vehicle.lng]}
                icon={getVehicleIcon(vehicle.status)}
                eventHandlers={{
                  click: () => onVehicleClick?.(vehicle.vehicleId),
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-bold text-lg mb-2">{vehicle.vehicleId}</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Estado:</span>
                        {getStatusBadge(vehicle.status)}
                      </div>
                      {vehicle.speed !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Velocidad:</span>
                          <span className="font-medium">{vehicle.speed} km/h</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Última actualización:</span>
                        <span className="font-medium text-xs">
                          {new Date(vehicle.lastUpdate).toLocaleTimeString('es-PE')}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => onVehicleClick?.(vehicle.vehicleId)}
                    >
                      Ver Detalles
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
