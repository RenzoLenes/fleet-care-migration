"use client";

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
import { type RealtimeAlert } from '@/lib/supabase';

interface AlertsTableProps {
  alerts: RealtimeAlert[];
  loading: boolean;
  onResolveAlert: (alertId: string) => void;
  severityFilter: string;
  statusFilter: string;
}

export function AlertsTable({ 
  alerts, 
  loading, 
  onResolveAlert, 
  severityFilter, 
  statusFilter 
}: AlertsTableProps) {
  const router = useRouter();

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">Crítica</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-orange-500">Media</Badge>;
      case 'low':
        return <Badge variant="secondary">Baja</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    return matchesSeverity && matchesStatus;
  });

  if (loading) {
    return (
      <Card className='fleetcare-table rounded-sm'>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">Cargando alertas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='fleetcare-table rounded-sm'>
      <CardContent className="p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>Severidad</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fecha/Hora</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAlerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No se encontraron alertas
                </TableCell>
              </TableRow>
            ) : (
              filteredAlerts.map((alert) => (
                <TableRow key={alert.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="font-medium text-sm">{alert.id.slice(0, 8)}...</div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="link" 
                      className="p-0 font-medium"
                      onClick={() => router.push(`/vehicles/${alert.vehicle_id}`)}
                    >
                      {alert.vehicle_id}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {getSeverityBadge(alert.severity)}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate" title={alert.description}>
                      {alert.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {alert.alert_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(alert.timestamp)}
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
                          onClick={() => onResolveAlert(alert.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolver
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}