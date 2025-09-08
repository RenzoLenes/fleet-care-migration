"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, AlertCircle, User, MapPin, Gauge } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VehicleTechData } from './vehicle-tech-data';
import { VehicleAlerts } from './vehicle-alerts';
import { VehicleHistory } from './vehicle-history';
import { VehicleDetailSkeleton } from './vehicles-skeleton';
import VehicleModel from './vehicle-model';

interface VehicleDetailViewProps {
  vehicleId: string;
}

export function VehicleDetailView({ vehicleId }: VehicleDetailViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vehicleData, setVehicleData] = useState(null);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setVehicleData({
        id: vehicleId,
        plate: 'ABC-123',
        model: 'Mercedes Benz O500',
        year: 2019,
        status: 'critical',
        driver: 'Carlos Mendoza',
        route: 'Ruta 45 - Centro Norte',
        lastMaintenance: '2024-01-15',
        nextMaintenance: '2024-02-15',
        mileage: '145,234 km'
      });
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [vehicleId]);

  const handleNotifyDriver = () => {
    // Simulate driver notification
    alert('Notificación enviada al conductor');
  };

  // Show skeleton while loading
  if (loading || !vehicleData) {
    return <VehicleDetailSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{vehicleData.id}</h2>
            <p className="text-muted-foreground">Detalles del vehículo</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleNotifyDriver}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Avisar al Conductor
          </Button>
          <Button>Generar Reporte</Button>
        </div>
      </div>

      {/* Main Grid Layout - Keeping original 3-column structure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle 3D Model - Spans 2 rows to give more height */}
        <div className="lg:row-span-2">
          <VehicleModel />
        </div>

        {/* Vehicle Info */}
        <Card className="fleetcare-card shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-800">Información del Vehículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Placa</label>
              <p className="text-lg font-semibold text-slate-800">{vehicleData.plate}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Modelo</label>
              <p className="font-medium text-slate-700">{vehicleData.model} ({vehicleData.year})</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Estado Actual</label>
              <div className="flex items-center space-x-2 mt-1">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <Badge variant="destructive">Crítico</Badge>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex flex-row items-center justify-between gap-1.5">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-slate-500" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Conductor</label>
                  <p className="font-medium text-slate-700">{vehicleData.driver}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-slate-500" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ruta Asignada</label>
                  <p className="text-sm text-slate-600">{vehicleData.route}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-blue-600" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kilometraje</label>
                  <p className="text-lg font-semibold text-blue-600">{vehicleData.mileage}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Data */}
        <Card className="fleetcare-card shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-800">Datos Técnicos en Tiempo Real</CardTitle>
            <CardDescription>Últimas lecturas de sensores IoT</CardDescription>
          </CardHeader>
          <CardContent>
            <VehicleTechData />
          </CardContent>
        </Card>

        {/* Maintenance - Spans 2 columns */}
        <Card className="fleetcare-card lg:col-span-2 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              Mantenimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Último Mantenimiento</label>
                <p className="text-lg font-semibold text-green-600">{vehicleData.lastMaintenance}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Próximo Mantenimiento</label>
                <p className="text-lg font-semibold text-orange-600">{vehicleData.nextMaintenance}</p>
              </div>
            </div>
            <Badge variant="outline" className="w-full justify-center bg-orange-50 text-orange-700 border-orange-200">
              ⚠️ Faltan 12 días para el próximo mantenimiento
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Alerts and History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VehicleAlerts vehicleId={vehicleId} />
        <VehicleHistory vehicleId={vehicleId} />
      </div>
    </div>
  );
}