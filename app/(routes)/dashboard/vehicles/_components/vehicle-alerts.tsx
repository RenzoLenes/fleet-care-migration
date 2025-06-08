"use client";

import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const vehicleAlerts = [
  {
    id: '1',
    severity: 'critical',
    message: 'Temperatura del motor excede 95°C',
    time: '2 min ago',
    status: 'pending',
    code: 'TEMP_HIGH'
  },
  {
    id: '2',
    severity: 'critical',
    message: 'Código DTC: P0301 - Falla de encendido cilindro 1',
    time: '5 min ago',
    status: 'pending',
    code: 'DTC_P0301'
  },
  {
    id: '3',
    severity: 'medium',
    message: 'Voltaje de batería bajo (11.8V)',
    time: '8 min ago',
    status: 'acknowledged',
    code: 'BATT_LOW'
  },
  {
    id: '4',
    severity: 'low',
    message: 'Mantenimiento programado en 12 días',
    time: '1 hour ago',
    status: 'acknowledged',
    code: 'MAINT_DUE'
  }
];

interface VehicleAlertsProps {
  vehicleId: string;
}

export function VehicleAlerts({ vehicleId }: VehicleAlertsProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Crítica</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-orange-500">Media</Badge>;
      default:
        return <Badge variant="secondary">Baja</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'acknowledged':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className='fleetcare-card'>
      <CardHeader>
        <CardTitle>Alertas del Vehículo</CardTitle>
        <CardDescription>
          Alertas específicas para {vehicleId}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vehicleAlerts.map((alert) => (
            <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg border fleetcare-card">
              <div className="mt-1">
                {getSeverityIcon(alert.severity)}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getSeverityBadge(alert.severity)}
                    <span className="text-xs text-muted-foreground">{alert.code}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(alert.status)}
                    <span className="text-xs capitalize">{alert.status}</span>
                  </div>
                </div>
                <p className="text-sm">{alert.message}</p>
                <p className="text-xs text-muted-foreground">{alert.time}</p>
                {alert.status === 'pending' && (
                  <Button variant="outline" size="sm">
                    Marcar como Revisada
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}