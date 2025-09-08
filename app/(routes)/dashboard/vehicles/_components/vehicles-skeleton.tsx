"use client";

import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Skeleton for vehicle table row
export function VehicleTableRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="space-y-2">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 w-16 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 w-12 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </TableCell>
      <TableCell>
        <div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div>
      </TableCell>
      <TableCell>
        <div className="h-4 w-20 bg-gray-100 rounded animate-pulse"></div>
      </TableCell>
      <TableCell>
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
      </TableCell>
    </TableRow>
  );
}

// Skeleton for vehicles table
export function VehiclesTableSkeleton() {
  return (
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
            {Array.from({ length: 8 }).map((_, index) => (
              <VehicleTableRowSkeleton key={index} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Skeleton for filters section
export function VehiclesFiltersSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <div className="h-10 w-full bg-gray-200 rounded-sm animate-pulse"></div>
      </div>
      <div className="h-10 w-48 bg-gray-200 rounded-sm animate-pulse"></div>
      <div className="h-10 w-32 bg-gray-200 rounded-sm animate-pulse"></div>
    </div>
  );
}

// Complete vehicles page skeleton
export function VehiclesPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="h-9 w-56 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-36 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Filters */}
      <VehiclesFiltersSkeleton />

      {/* Table */}
      <VehiclesTableSkeleton />
    </div>
  );
}

// Skeleton for vehicle detail view
export function VehicleDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-28 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="fleetcare-card">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-16 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <Card className="fleetcare-card">
            <CardContent className="p-6">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-4 w-20 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="fleetcare-card">
            <CardContent className="p-6">
              <div className="h-64 w-full bg-gray-100 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card className="fleetcare-card">
            <CardContent className="p-6">
              <div className="h-96 w-full bg-gray-100 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}