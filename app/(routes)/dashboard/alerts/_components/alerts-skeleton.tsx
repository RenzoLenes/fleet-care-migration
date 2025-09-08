"use client";

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Skeleton component for individual stat cards
export function AlertStatSkeleton() {
  return (
    <Card className='fleetcare-card'>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
      </CardHeader>
      <CardContent>
        <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-3 w-20 bg-gray-100 rounded animate-pulse"></div>
      </CardContent>
    </Card>
  );
}

// Skeleton component for stats grid
export function AlertsStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <AlertStatSkeleton key={index} />
      ))}
    </div>
  );
}

// Skeleton component for table rows
export function AlertTableRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
      </TableCell>
      <TableCell>
        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 w-32 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </TableCell>
      <TableCell>
        <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse"></div>
      </TableCell>
      <TableCell>
        <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </TableCell>
    </TableRow>
  );
}

// Skeleton component for the entire alerts table
export function AlertsTableSkeleton() {
  return (
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
            {Array.from({ length: 8 }).map((_, index) => (
              <AlertTableRowSkeleton key={index} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Skeleton for filters section
export function AlertsFiltersSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
    </div>
  );
}

// Complete alerts page skeleton
export function AlertsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="h-9 w-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-36 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Stats */}
      <AlertsStatsSkeleton />

      {/* Filters */}
      <AlertsFiltersSkeleton />

      {/* Table */}
      <AlertsTableSkeleton />
    </div>
  );
}