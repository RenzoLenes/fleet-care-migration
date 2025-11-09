"use client";

import { useRouter } from 'next/navigation';
import { Eye, CheckCircle, AlertCircle, Clock, MessageSquare, Brain } from 'lucide-react';
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { AlertsTableSkeleton } from './alerts-skeleton';
import { AlertDetailDialog } from './alert-detail-dialog';
import { type RealtimeAlert } from '@/lib/supabase';
import * as React from 'react';

interface AlertsTableProps {
  alerts: RealtimeAlert[];
  loading: boolean;
  onResolveAlert: (alertId: string) => void;
  severityFilter: string;
  statusFilter: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalAlerts: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
  };
}

export function AlertsTable({
  alerts,
  loading,
  onResolveAlert,
  severityFilter,
  statusFilter,
  pagination
}: AlertsTableProps) {
  const router = useRouter();
  const [selectedAlert, setSelectedAlert] = React.useState<RealtimeAlert | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleViewAlert = (alert: RealtimeAlert) => {
    setSelectedAlert(alert);
    setDialogOpen(true);
  };

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

  if (loading && !alerts.length) {
    return <AlertsTableSkeleton />;
  }

  return (
    <div className="space-y-4">
      <Card className='fleetcare-table rounded-sm'>
        <CardContent className="p-2">
          <Table>
          <TableHeader>
            <TableRow>
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
                    <Button 
                      variant="link" 
                      className="p-0 font-medium"
                      onClick={() => router.push(`/dashboard/vehicles/${alert.vehicle_id}`)}
                    >
                      {alert.vehicle_id}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {getSeverityBadge(alert.severity)}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="flex items-center gap-2">
                      {alert.llm_diagnosis && (
                        <div title="Con diagnóstico IA">
                          <Brain className="h-4 w-4 text-purple-500 flex-shrink-0" />
                        </div>
                      )}
                      <p className="truncate" title={alert.description}>
                        {alert.description}
                      </p>
                    </div>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAlert(alert)}
                      >
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

    {/* Pagination */}
    {pagination && pagination.totalPages > 1 && (
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} a {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalAlerts)} de {pagination.totalAlerts} alertas
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.currentPage > 1) pagination.onPageChange(pagination.currentPage - 1);
                }}
                className={pagination.currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(page => {
                return page === 1 || 
                       page === pagination.totalPages || 
                       Math.abs(page - pagination.currentPage) <= 1;
              })
              .map((page, index, filteredPages) => {
                const prevPage = filteredPages[index - 1];
                const showEllipsisBefore = prevPage && page - prevPage > 1;
                
                return (
                  <React.Fragment key={page}>
                    {showEllipsisBefore && (
                      <PaginationItem>
                        <span className="px-3 py-2 text-sm text-muted-foreground">...</span>
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        isActive={pagination.currentPage === page}
                        onClick={(e) => {
                          e.preventDefault();
                          pagination.onPageChange(page);
                        }}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  </React.Fragment>
                );
              })}
            
            <PaginationItem>
              <PaginationNext 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.currentPage < pagination.totalPages) pagination.onPageChange(pagination.currentPage + 1);
                }}
                className={pagination.currentPage >= pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    )}

    {/* Alert Detail Dialog */}
    <AlertDetailDialog
      alert={selectedAlert}
      open={dialogOpen}
      onOpenChange={setDialogOpen}
    />
  </div>
  );
}