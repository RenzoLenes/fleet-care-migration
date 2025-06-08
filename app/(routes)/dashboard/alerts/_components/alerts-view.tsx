"use client";

import { useState } from 'react';
import { Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertsTable } from './alerts-table';
import { AlertsStats } from './alerts-stats';

export function AlertsView() {
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Alertas</h2>
        <Button className='bg-blue-500 hover:bg-blue-600'>
          <Download className="h-4 w-4 mr-2" />
          Exportar Reporte
        </Button>
      </div>

      <AlertsStats />

      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-48 bg-gradient-to-br from-white to-blue-50/50 border border-blue-200 rounded-sm hover:bg-gradient-to-br hover:from-blue-5">
            <SelectValue placeholder="Filtrar por severidad" />
          </SelectTrigger>
          <SelectContent className='bg-white border border-gray-200 shadow-lg'>
            <SelectItem value="all"
              className="!hover:bg-blue-50 !hover:text-blue-700 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 cursor-pointer transition-colors duration-150"
            >Todas las severidades</SelectItem>
            <SelectItem value="critical"
              className="!hover:bg-blue-50 !hover:text-blue-700 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 cursor-pointer transition-colors duration-150"
            >Críticas</SelectItem>
            <SelectItem value="medium"
              className="!hover:bg-blue-50 !hover:text-blue-700 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 cursor-pointer transition-colors duration-150"
            >Medias</SelectItem>
            <SelectItem value="low"
              className="!hover:bg-blue-50 !hover:text-blue-700 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 cursor-pointer transition-colors duration-150"
            >Bajas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-gradient-to-br from-white to-blue-50/50 border border-blue-200 rounded-sm hover:bg-gradient-to-br hover:from-blue-5">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent className='bg-white border border-gray-200 shadow-lg'>
            <SelectItem value="all"
              className="!hover:bg-blue-50 !hover:text-blue-700 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 cursor-pointer transition-colors duration-150"
            >Todos los estados
            </SelectItem>
            <SelectItem value="pending"
              className="!hover:bg-blue-50 !hover:text-blue-700 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 cursor-pointer transition-colors duration-150"
            >Pendientes</SelectItem>
            <SelectItem value="acknowledged"
              className="!hover:bg-blue-50 !hover:text-blue-700 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 cursor-pointer transition-colors duration-150"
            >Reconocidas</SelectItem>
            <SelectItem value="in_progress"
              className="!hover:bg-blue-50 !hover:text-blue-700 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 cursor-pointer transition-colors duration-150"
            >En Proceso</SelectItem>
            <SelectItem value="resolved"
              className="!hover:bg-blue-50 !hover:text-blue-700 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 cursor-pointer transition-colors duration-150"
            >Resueltas</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className='bg-gradient-to-br from-white to-blue-50/50 border border-blue-200 rounded-sm hover:bg-gradient-to-br hover:from-blue-5'>
          <Filter className="h-4 w-4 mr-2" />
          Más Filtros
        </Button>
      </div>

      <AlertsTable severityFilter={severityFilter} statusFilter={statusFilter} />
    </div>
  );
}