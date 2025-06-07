"use client";

import { useState, useEffect } from 'react';
import { Play, Pause, Settings, Wifi, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface SimulationControlProps {
  active: boolean;
  onToggle: (active: boolean) => void;
}

export function SimulationControl({ active, onToggle }: SimulationControlProps) {
  const [dataFlow, setDataFlow] = useState(active); // Inicializar con el estado actual
  const [activeSensors, setActiveSensors] = useState(active ? 98 : 0); // Inicializar según el estado
  const [connectionProgress, setConnectionProgress] = useState(active ? 100 : 0); // Ya conectado si está activo
  const [isConnecting, setIsConnecting] = useState(false);

  const totalSensors = 127;

  useEffect(() => {
    // Sincronizar el estado interno con el estado externo al montar el componente
    if (active) {
      // Si ya está activo externamente, configurar todo como conectado
      setDataFlow(true);
      setActiveSensors(98);
      setConnectionProgress(100);
      setIsConnecting(false);
    } else {
      // Si está inactivo, resetear todo
      setDataFlow(false);
      setActiveSensors(0);
      setConnectionProgress(0);
      setIsConnecting(false);
    }
  }, []); // Solo al montar el componente

  useEffect(() => {
    // Solo manejar cambios de estado, no el estado inicial
    if (active && !dataFlow && connectionProgress < 100) {
      // Simular proceso de conexión solo cuando se activa por primera vez
      setIsConnecting(true);
      setConnectionProgress(0);

      const interval = setInterval(() => {
        setConnectionProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsConnecting(false);
            setDataFlow(true);
            setActiveSensors(98);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(interval);
    } else if (!active) {
      // Desactivar todo cuando se apaga
      setDataFlow(false);
      setActiveSensors(0);
      setConnectionProgress(0);
      setIsConnecting(false);
    }
  }, [active]);

  const handleToggle = () => {
    const newState = !active;

    if (!newState) {
      // Confirmar antes de desactivar
      toast('¿Desactivar simulación?', {
        description: 'Se detendrán todos los flujos de datos activos',
        action: {
          label: 'Confirmar',
          onClick: () => {
            onToggle(newState);
            toast.success('Simulación desactivada', {
              description: 'Sensores desconectados y flujos pausados'
            });
          }
        },
        cancel: {
          label: 'Cancelar',
          onClick: () => { }
        }
      });
    } else {
      onToggle(newState);
      toast.success('Iniciando simulación...', {
        description: 'Conectando con los sensores IoT'
      });
    }
  };

  const getStatusColor = () => {
    if (isConnecting) return 'bg-yellow-500';
    if (active && dataFlow) return 'bg-green-500';
    return 'bg-gray-400';
  };

  const getStatusText = () => {
    if (isConnecting) return 'Conectando...';
    if (active && dataFlow) return 'Activo';
    return 'Inactivo';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="fleetcare-card w-96 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getStatusColor()} shadow-md`}>
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-800">Control de Simulación</CardTitle>
                <CardDescription className="text-gray-600">
                  Gestión del flujo de datos IoT en tiempo real
                </CardDescription>
              </div>
            </div>
            <Badge
              className={`rounded-full px-3 py-1 font-semibold ${isConnecting
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  : active && dataFlow
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-gray-100 text-gray-800 border-gray-200'
                }`}
            >
              {getStatusText()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Control Principal */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg shadow-md ${getStatusColor()}`}>
                {isConnecting ? (
                  <Activity className="h-5 w-5 text-white animate-pulse" />
                ) : active ? (
                  <Play className="h-5 w-5 text-white" />
                ) : (
                  <Pause className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {isConnecting ? 'Estableciendo conexión...' : active ? "Simulación activa" : "Simulación pausada"}
                </p>
                <p className="text-sm text-gray-600">
                  {isConnecting ? 'Configurando sensores' : active ? "Recibiendo datos en tiempo real" : "Flujos de datos detenidos"}
                </p>
              </div>
            </div>
            <Switch
              className='fleetcare-switch'
              checked={active}
              onCheckedChange={handleToggle}
              disabled={isConnecting}
            />
          </div>

          {/* Progreso de Conexión */}
          {isConnecting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Conectando sensores...</span>
                <span className="text-gray-800 font-medium">{connectionProgress}%</span>
              </div>
              <Progress value={connectionProgress} className="h-2" />
            </motion.div>
          )}

          <Separator />

          {/* Estado de Servicios */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800 text-sm">Estado de Servicios</h4>

            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100">
                <div className="flex items-center space-x-3">
                  <Wifi className={`h-4 w-4 ${dataFlow ? "text-green-500" : "text-gray-400"}`} />
                  <span className="font-medium text-gray-700 text-sm">Flujo n8n</span>
                </div>
                <div className="flex items-center space-x-2">
                  {dataFlow ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className={`font-semibold text-sm ${dataFlow ? "text-green-600" : "text-gray-500"}`}>
                    {dataFlow ? "Conectado" : "Desconectado"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100">
                <div className="flex items-center space-x-3">
                  <Activity className={`h-4 w-4 ${activeSensors > 0 ? "text-blue-500" : "text-gray-400"}`} />
                  <span className="font-medium text-gray-700 text-sm">Sensores activos</span>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-sm ${activeSensors > 0 ? "text-blue-600" : "text-gray-500"}`}>
                    {activeSensors}/{totalSensors}
                  </div>
                  {activeSensors > 0 && (
                    <div className="text-xs text-gray-500">
                      {Math.round((activeSensors / totalSensors) * 100)}% online
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Información de Persistencia */}
          {active && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-800 font-medium">
                  La simulación permanecerá activa al cerrar este panel
                </p>
              </div>
            </motion.div>
          )}

          {/* Métricas Adicionales */}
          {active && dataFlow && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-2"
            >
              <Separator className="mb-4" />
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="text-lg font-bold text-green-600">2.4k</div>
                  <div className="text-xs text-green-700">Datos/min</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-lg font-bold text-blue-600">99.2%</div>
                  <div className="text-xs text-blue-700">Uptime</div>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}