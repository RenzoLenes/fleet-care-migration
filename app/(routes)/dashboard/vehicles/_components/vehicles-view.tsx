"use client";

import { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VehiclesTable } from './vehicles-table';
import { AddVehicleModal } from './add-vehicle-modal';

export function VehiclesView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleVehicleAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6 ">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Vehículos</h2>
        <Button 
          className='bg-blue-500 hover:bg-blue-600'
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Vehículo
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 ">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por placa o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gradient-to-br from-white to-blue-50/50 border border-blue-200 rounded-sm"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-gradient-to-br from-white to-blue-50/50 border border-blue-200 rounded-sm hover:bg-gradient-to-br hover:from-blue-5">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent className='bg-white border border-gray-200 shadow-lg'>
            <SelectItem
              value="all"
              className="!hover:bg-blue-50 !hover:text-blue-700 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 cursor-pointer transition-colors duration-150"
            >
              Todos los estados
            </SelectItem>
            <SelectItem
              value="active"
              className="!hover:bg-blue-50 !hover:text-blue-700 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 cursor-pointer transition-colors duration-150"
            >
              Activo
            </SelectItem>
            <SelectItem
              value="maintenance"
              className="!hover:bg-blue-50 !hover:text-blue-700 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 cursor-pointer transition-colors duration-150"
            >
              Mantenimiento
            </SelectItem>
            <SelectItem
              value="critical"
              className="!hover:bg-blue-50 !hover:text-blue-700 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 cursor-pointer transition-colors duration-150"
            >
              Crítico
            </SelectItem>
            <SelectItem
              value="inactive"
              className="!hover:bg-blue-50 !hover:text-blue-700 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 cursor-pointer transition-colors duration-150"
            >
              Inactivo
            </SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className='bg-gradient-to-br from-white to-blue-50/50 border border-blue-200 rounded-sm'>
          <Filter className="h-4 w-4 mr-2" />
          Más Filtros
        </Button>
      </div>

      <VehiclesTable 
        searchTerm={searchTerm} 
        statusFilter={statusFilter} 
        refreshTrigger={refreshTrigger}
      />

      <AddVehicleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onVehicleAdded={handleVehicleAdded}
      />
    </div>
  );
}