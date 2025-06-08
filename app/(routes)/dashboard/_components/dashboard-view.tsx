"use client";

import { useState, useEffect } from 'react';
import { StatsCards } from './stats-cards';
import { AlertChart } from './alert-chart';
import { SimulationControl } from './simulation-control';
import { RecentAlerts } from './recent-alerts';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../../components/ui/button';
import { Settings, X } from 'lucide-react';

export interface Tenant {
  id: string,
  name: string,
  email: string,
  phone_number: string,
  created_at: string,
}

interface DashboardViewProps {
  refreshTrigger?: boolean; // Prop para disparar el refresh del tenant
}

export function DashboardView({ refreshTrigger }: DashboardViewProps) {
  const [simulationActive, setSimulationActive] = useState(false);
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [tenant, setTenant] = useState<Tenant | null>();
  const [isLoadingTenant, setIsLoadingTenant] = useState(true);

  // Función para obtener el tenant ID
  const getTenant = async () => {
    try {
      setIsLoadingTenant(true);
      const response = await fetch('/api/user/tenant');
      const data = await response.json();
      
      if (data.tenant) {
        setTenant(data.tenant);
      } else {
        console.warn('No se encontró tenant ID en la respuesta');
        setTenant(null);
      }
    } catch (error) {
      console.error('Error obteniendo tenant:', error);
      setTenant(null);
    } finally {
      setIsLoadingTenant(false);
    }
  };

  // Cargar el tenant ID al montar el componente
  useEffect(() => {
    getTenant();
  }, []);

  // Refrescar tenant cuando se complete el setup inicial
  useEffect(() => {
    if (refreshTrigger) {
      getTenant();
    }
  }, [refreshTrigger]);

  // Función para manejar el cambio de estado de la simulación
  const handleSimulationToggle = (active: boolean) => {
    setSimulationActive(active);
    // El estado persiste incluso si se cierra el modal
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <motion.h2
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-3xl font-bold tracking-tight text-gray-800"
          >
            Dashboard
          </motion.h2>

          <Button
            variant="outline"
            size="sm"
            className={`fleetcare-button-secondary rounded-xl hover:scale-105 transition-all duration-200 ${simulationActive ? 'ring-2 ring-green-200 bg-green-50' : ''
              }`}
            onClick={() => setShowSimulationModal(true)}
            disabled={isLoadingTenant}
          >
            <Settings className={`h-4 w-4 mr-2 ${simulationActive ? 'text-green-600' : ''}`} />
            {isLoadingTenant ? 'Cargando...' : 'Configurar Simulación'}
            {simulationActive && (
              <div className="ml-2 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </Button>
        </div>

        <StatsCards />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <AlertChart />
          <RecentAlerts />
        </motion.div>
      </motion.div>

      {/* Modal de Simulación */}
      <AnimatePresence>
        {showSimulationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSimulationModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botón de cerrar */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-2 -right-2 z-10 h-8 w-8 rounded-full bg-white shadow-lg hover:bg-gray-50"
                onClick={() => setShowSimulationModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Componente de control de simulación */}
              {!isLoadingTenant && tenant ? (
                <SimulationControl
                  active={simulationActive}
                  onToggle={handleSimulationToggle}
                  tenant={tenant}
                />
              ) : (
                <div className="fleetcare-card w-96 shadow-xl p-6">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-gray-600">
                      {isLoadingTenant ? 'Cargando configuración...' : 'Error: No se pudo obtener la configuración del tenant'}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}