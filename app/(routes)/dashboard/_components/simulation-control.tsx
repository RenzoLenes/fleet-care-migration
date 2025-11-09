"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, Settings, Wifi, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Tenant } from './dashboard-view';

interface SimulationControlProps {
  active: boolean;
  onToggle: (active: boolean) => void;
  tenant: Tenant;
}

export function SimulationControl({ active, onToggle, tenant }: SimulationControlProps) {
  const [dataFlow, setDataFlow] = useState(false);  // Inicializar en false hasta consultar servidor
  const [activeSensors, setActiveSensors] = useState(0);  // Inicializar en 0
  const [connectionProgress, setConnectionProgress] = useState(0);  // Inicializar en 0
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Ref para mantener el estado actual de active (para el cleanup)
  const activeRef = useRef(active);
  const tenantRef = useRef(tenant);

  const totalSensors = 127;

  // Actualizar refs cuando cambian los valores
  useEffect(() => {
    activeRef.current = active;
    tenantRef.current = tenant;
  }, [active, tenant]);

  // Función para obtener el estado actual desde el backend
  const fetchCurrentState = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/simulation');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.state) {
          const state = result.state;
          setDataFlow(state.dataFlow);
          setActiveSensors(state.activeSensors);
          setConnectionProgress(state.connectionProgress);
          setIsConnecting(state.isConnecting);
          
          // Sync the parent component's active state if different
          if (state.active !== active) {
            onToggle(state.active);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching simulation state:', error);
    } finally {
      setIsLoading(false);
    }
  }, [active, onToggle]);

  // Función para enviar webhook a través de nuestra API route
  const sendWebhookToN8n = async (status: boolean) => {
    setIsSendingWebhook(true);

    try {
      const response = await fetch('/api/simulation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status ? 'activado' : 'desactivado',
          sensor_count: status ? activeSensors : 0,
          tenant: tenant,
          config: {
            vehicles: ["BUS-001", "BUS-002", "BUS-003", "BUS-004", "BUS-005"],
            interval: 5,    // Genera datos cada 5 segundos
            duration: 0     // 0 = ilimitado (hasta que usuario lo detenga)
          }

        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Error HTTP: ${response.status}`);
      }

      if (result.success) {
        toast.success('Simulador actualizado', {
          description: result.message
        });
      } else {
        toast.error('Error al actualizar simulador', {
          description: result.error || 'Error desconocido'
        });
      }

    } catch (error) {
      console.error('Error actualizando simulador:', error);
      toast.error('Error al actualizar simulador', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsSendingWebhook(false);
    }
  };

  // Fetch current state on component mount
  useEffect(() => {
    fetchCurrentState();
  }, [fetchCurrentState]);

  // Connection progress animation (only for visual feedback during activation)
  useEffect(() => {
    if (active && !dataFlow && connectionProgress < 100) {
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
    }
  }, [active, dataFlow, connectionProgress]);

  // Cleanup: detener simulación SOLO cuando usuario cierra/refresca página
  // NO se ejecuta al navegar internamente (ej: ir a /alerts)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Solo ejecutar si la simulación está activa
      if (activeRef.current) {
        console.log('[SimulationControl] Page unloading, stopping simulation...');

        // Detener simulación en el servidor
        // navigator.sendBeacon es más confiable que fetch para beforeunload
        const payload = JSON.stringify({
          status: 'desactivado',
          sensor_count: 0,
          tenant: tenantRef.current,
          config: {
            vehicles: [],
            interval: 0,
            duration: 0
          }
        });

        // sendBeacon asegura que se envíe aunque la página se cierre
        navigator.sendBeacon(
          '/api/simulation',
          new Blob([payload], { type: 'application/json' })
        );
      }
    };

    // beforeunload se dispara SOLO al cerrar/refrescar, NO al navegar dentro de la app
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleToggle = () => {
    const newState = !active;

    if (!newState) {
      toast('¿Desactivar simulación?', {
        description: 'Se detendrán todos los flujos de datos activos',
        action: {
          label: 'Confirmar',
          onClick: async () => {
            onToggle(newState);
            await sendWebhookToN8n(newState);
            // Refresh state after successful webhook
            await fetchCurrentState();
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
      sendWebhookToN8n(newState).then(() => {
        // Refresh state after successful webhook
        fetchCurrentState();
      });
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
              disabled={isConnecting || isSendingWebhook || isLoading}
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
                  <span className="font-medium text-gray-700 text-sm">Simulador IoT</span>
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