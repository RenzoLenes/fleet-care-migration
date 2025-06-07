"use client";

import { ArrowLeft, MessageSquare, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VehicleTechData } from './vehicle-tech-data';
import { VehicleAlerts } from './vehicle-alerts';
import { VehicleHistory } from './vehicle-history';

interface VehicleDetailViewProps {
  vehicleId: string;
}

const vehicleData = {
  id: 'BUS-001',
  plate: 'ABC-123',
  model: 'Mercedes Benz O500',
  year: 2019,
  status: 'critical',
  driver: 'Carlos Mendoza',
  route: 'Ruta 45 - Centro Norte',
  lastMaintenance: '2024-01-15',
  nextMaintenance: '2024-02-15',
  mileage: '145,234 km'
};

export function VehicleDetailView({ vehicleId }: VehicleDetailViewProps) {
  const router = useRouter();

  const handleNotifyDriver = () => {
    // Simulate driver notification
    alert('Notificación enviada al conductor');
  };

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
        {/* Vehicle Info */}
        <Card className='fleetcare-card'>
          <CardHeader>
            <CardTitle>Información del Vehículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Placa</label>
              <p className="text-lg font-semibold">{vehicleData.plate}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Modelo</label>
              <p>{vehicleData.model} ({vehicleData.year})</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Estado Actual</label>
              <div className="flex items-center space-x-2 mt-1">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <Badge variant="destructive">Crítico</Badge>
              </div>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Conductor</label>
              <p>{vehicleData.driver}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ruta Asignada</label>
              <p>{vehicleData.route}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Kilometraje</label>
              <p>{vehicleData.mileage}</p>
            </div>
          </CardContent>
        </Card>

        {/* Technical Data */}
        <Card className='fleetcare-card'>
          <CardHeader>
            <CardTitle>Datos Técnicos en Tiempo Real</CardTitle>
            <CardDescription>Últimas lecturas de sensores IoT</CardDescription>
          </CardHeader>
          <CardContent>
            <VehicleTechData />
          </CardContent>
        </Card>

        {/* Maintenance */}
        <Card className='fleetcare-card'>
          <CardHeader>
            <CardTitle>Mantenimiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Último Mantenimiento</label>
              <p>{vehicleData.lastMaintenance}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Próximo Mantenimiento</label>
              <p className="text-orange-600 font-medium">{vehicleData.nextMaintenance}</p>
            </div>
            <Badge variant="outline" className="w-full justify-center">
              Faltan 12 días
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VehicleAlerts vehicleId={vehicleId} />
        <VehicleHistory vehicleId={vehicleId} />
      </div>
    </div>
  );
}