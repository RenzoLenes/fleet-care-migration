"use client";

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

const vehicles = [
  {
    id: 'BUS-001',
    plate: 'ABC-123',
    model: 'Mercedes Benz O500',
    year: 2019,
    status: 'critical',
    lastUpdate: '2 min ago',
    alerts: 2,
    online: true
  },
  {
    id: 'BUS-002',
    plate: 'DEF-456',
    model: 'Volvo B270F',
    year: 2020,
    status: 'ok',
    lastUpdate: '5 min ago',
    alerts: 0,
    online: true
  },
  {
    id: 'BUS-003',
    plate: 'GHI-789',
    model: 'Scania K410',
    year: 2018,
    status: 'warning',
    lastUpdate: '3 min ago',
    alerts: 1,
    online: true
  },
  {
    id: 'BUS-004',
    plate: 'JKL-012',
    model: 'Mercedes Benz O500',
    year: 2021,
    status: 'offline',
    lastUpdate: '2 hours ago',
    alerts: 0,
    online: false
  },
  {
    id: 'BUS-005',
    plate: 'MNO-345',
    model: 'Volvo B270F',
    year: 2019,
    status: 'ok',
    lastUpdate: '1 min ago',
    alerts: 0,
    online: true
  }
];

interface VehiclesTableProps {
  searchTerm: string;
  statusFilter: string;
}

export function VehiclesTable({ searchTerm, statusFilter }: VehiclesTableProps) {
  const router = useRouter();

  const getStatusIcon = (status: string, online: boolean) => {
    if (!online) return <WifiOff className="h-4 w-4 text-gray-500" />;
    
    switch (status) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Wifi className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string, online: boolean) => {
    if (!online) return <Badge variant="secondary">Fuera de línea</Badge>;
    
    switch (status) {
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      case 'warning':
        return <Badge variant="default" className="bg-orange-500">Alerta Leve</Badge>;
      case 'ok':
        return <Badge variant="default" className="bg-green-500">OK</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = 
      vehicle.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Card className='fleetcare-table rounded-sm'>
      <CardContent className="p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID / Placa</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Alertas</TableHead>
              <TableHead>Última Actualización</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.map((vehicle) => (
              <TableRow key={vehicle.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <div>
                    <div className="font-medium">{vehicle.id}</div>
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
                    {getStatusIcon(vehicle.status, vehicle.online)}
                    {getStatusBadge(vehicle.status, vehicle.online)}
                  </div>
                </TableCell>
                <TableCell>
                  {vehicle.alerts > 0 ? (
                    <Badge variant="outline">{vehicle.alerts} alertas</Badge>
                  ) : (
                    <span className="text-muted-foreground">Sin alertas</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {vehicle.lastUpdate}
                </TableCell>
                <TableCell>
                  <Button 
                    className='border-blue-200 rounded-sm hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100/50 hover:border-blue-300 transition-all duration-200'
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}