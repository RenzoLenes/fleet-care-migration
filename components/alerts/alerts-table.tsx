"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, CheckCircle, AlertCircle, Clock, MessageSquare } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const alerts = [
  {
    id: 'ALT-001',
    vehicle: 'BUS-001',
    severity: 'critical',
    message: 'Temperatura del motor excede 95°C',
    time: '2024-01-20 14:30',
    status: 'pending',
    code: 'TEMP_HIGH'
  },
  {
    id: 'ALT-002',
    vehicle: 'BUS-045',
    severity: 'medium',
    message: 'Voltaje de batería bajo (11.8V)',
    time: '2024-01-20 14:25',
    status: 'acknowledged',
    code: 'BATT_LOW'
  },
  {
    id: 'ALT-003',
    vehicle: 'BUS-023',
    severity: 'low',
    message: 'Mantenimiento programado pendiente',
    time: '2024-01-20 14:15',
    status: 'in_progress',
    code: 'MAINT_DUE'
  },
  {
    id: 'ALT-004',
    vehicle: 'BUS-078',
    severity: 'critical',
    message: 'Código DTC: P0301 - Falla de encendido',
    time: '2024-01-20 13:58',
    status: 'resolved',
    code: 'DTC_P0301'
  },
  {
    id: 'ALT-005',
    vehicle: 'BUS-012',
    severity: 'medium',
    message: 'Presión de aceite baja',
    time: '2024-01-20 13:45',
    status: 'pending',
    code: 'OIL_PRESSURE'
  }
];

interface AlertsTableProps {
  severityFilter: string;
  statusFilter: string;
}

export function AlertsTable({ severityFilter, statusFilter }: AlertsTableProps) {
  const router = useRouter();
  const [alertsData, setAlertsData] = useState(alerts);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pendiente</Badge>;
      case 'acknowledged':
        return <Badge variant="default" className="bg-blue-500">Reconocida</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-yellow-500">En Proceso</Badge>;
      case 'resolved':
        return <Badge variant="default" className="bg-green-500">Resuelta</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'acknowledged':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleResolveAlert = (alertId: string) => {
    setAlertsData(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId ? { ...alert, status: 'resolved' } : alert
      )
    );
    
    toast.success('Alerta marcada como resuelta', {
      description: `La alerta ${alertId} ha sido marcada como resuelta.`
    });
  };

  const filteredAlerts = alertsData.filter((alert) => {
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    
    return matchesSeverity && matchesStatus;
  });

  return (
    <Card className='fleetcare-table rounded-sm'>
      <CardContent className="p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID / Código</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>Severidad</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Fecha/Hora</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAlerts.map((alert) => (
              <TableRow key={alert.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <div>
                    <div className="font-medium">{alert.id}</div>
                    <div className="text-sm text-muted-foreground">{alert.code}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="link" 
                    className="p-0 font-medium"
                    onClick={() => router.push(`/vehicles/${alert.vehicle}`)}
                  >
                    {alert.vehicle}
                  </Button>
                </TableCell>
                <TableCell>
                  {getSeverityBadge(alert.severity)}
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className="truncate">{alert.message}</p>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {alert.time}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(alert.status)}
                    {getStatusBadge(alert.status)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    {alert.status !== 'resolved' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleResolveAlert(alert.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolver
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}