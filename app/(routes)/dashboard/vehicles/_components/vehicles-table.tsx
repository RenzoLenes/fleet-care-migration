"use client";

import { useState, useEffect, useCallback } from 'react';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Eye, AlertCircle, CheckCircle, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
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
import { VehiclesTableSkeleton } from './vehicles-skeleton';
import { type Vehicle } from '@/lib/types';

// This will be replaced with actual API data

interface VehiclesTableProps {
  searchTerm: string;
  statusFilter: string;
  refreshTrigger?: number;
}

export function VehiclesTable({ searchTerm, statusFilter, refreshTrigger }: VehiclesTableProps) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const itemsPerPage = 10;

  // Function to fetch vehicles from API
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: statusFilter === 'all' ? 'all' : statusFilter,
        search: searchTerm,
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });

      const response = await fetch(`/api/vehicles?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }

      const data = await response.json();
      setVehicles(data.vehicles || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalVehicles(data.pagination?.total || 0);
      setError(null);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setError('Error al cargar los vehículos');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Initial fetch and when filters change
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles, refreshTrigger]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <WifiOff className="h-4 w-4 text-gray-500" />;
      default:
        return <Wifi className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      case 'maintenance':
        return <Badge variant="default" className="bg-orange-500">Mantenimiento</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-500">Activo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactivo</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  // Loading state
  if (loading) {
    return <VehiclesTableSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <Card className='fleetcare-table rounded-sm'>
        <CardContent className="p-8 text-center">
          <div className="text-destructive">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
            <Button 
              variant="outline" 
              onClick={fetchVehicles} 
              className="mt-4"
            >
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className='fleetcare-table rounded-sm'>
        <CardContent className="p-2">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Placa</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Alertas</TableHead>
              <TableHead>Última Actualización</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No se encontraron vehículos
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((vehicle) => (
                <TableRow key={vehicle.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{vehicle.vehicle_id}</div>
                      <div className="text-sm text-muted-foreground">{vehicle.plate}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{vehicle.model}</div>
                      <div className="text-sm text-muted-foreground">{vehicle.year}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(vehicle.status)}
                      {getStatusBadge(vehicle.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">Sin alertas</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(vehicle.updated_at).toLocaleString('es-PE', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    <Button 
                      className='border-blue-200 rounded-sm hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100/50 hover:border-blue-300 transition-all duration-200'
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/dashboard/vehicles/${vehicle.vehicle_id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    {/* Pagination */}
    {totalPages > 1 && (
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalVehicles)} de {totalVehicles} vehículos
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                // Show first page, last page, current page, and pages around current page
                return page === 1 || 
                       page === totalPages || 
                       Math.abs(page - currentPage) <= 1;
              })
              .map((page, index, filteredPages) => {
                // Add ellipsis if there's a gap
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
                        isActive={currentPage === page}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
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
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    )}
  </div>
  );
}