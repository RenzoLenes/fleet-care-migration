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
import { useSimulationStore } from '@/lib/stores/simulation-store';

interface SimulationControlProps {
  active: boolean;
  onToggle: (active: boolean) => void;
  tenant: Tenant;
}

export function SimulationControl({ active, onToggle, tenant }: SimulationControlProps) {
  // Zustand store - persiste entre navegaciones
  const {
    dataFlow,
    activeSensors,
    isConnecting,
    isSendingWebhook,
    isLoading,
    setDataFlow,
    setActiveSensors,
    setIsConnecting,
    setIsSendingWebhook,
    setIsLoading,
    updateFromServer,
  } = useSimulationStore();

  // Estado local solo para animación (no necesita persistir)
  const [connectionProgress, setConnectionProgress] = useState(0);

  // Estado para probabilidad de errores (0 a 1)
  const [errorProbability, setErrorProbability] = useState(0.3); // Default: 30%

  // Ref para mantener el estado actual de dataFlow (para el cleanup)
  const dataFlowRef = useRef(dataFlow);
  const tenantRef = useRef(tenant);

  const totalSensors = 127;

  // Actualizar refs cuando cambian los valores
  useEffect(() => {
    dataFlowRef.current = dataFlow;
    tenantRef.current = tenant;
  }, [dataFlow, tenant]);

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
            duration: 0,    // 0 = ilimitado (hasta que usuario lo detenga)
            errorProbability: status ? errorProbability : 0.3 // Enviar probabilidad de errores
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
        console.error('[SimulationControl] Server error:', result.error);
        toast.error('Error al actualizar simulador', {
          description: result.error || 'Error desconocido'
        });
      }

    } catch (error) {
      console.error('[SimulationControl] Error:', error);
      toast.error('Error al actualizar simulador', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsSendingWebhook(false);
    }
  };

  // Sincronizar con servidor al montar (solo UNA vez)
  // IMPORTANTE: NO sobrescribir si el usuario tiene estado guardado en localStorage
  // porque el SimulationManager puede perder su estado en hot reloads de desarrollo
  useEffect(() => {
    // Solo sincronizar si el estado local está en "inicial" (nunca activado)
    // Si dataFlow es true (de localStorage), confiar en el estado local
    if (!dataFlow && activeSensors === 0) {
      // Sync silencioso - no muestra loading, no bloquea UI
      const syncWithServer = async () => {
        try {
          const response = await fetch('/api/simulation');
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.state) {
              const state = result.state;

              // Actualizar desde servidor solo en carga inicial
              updateFromServer({
                active: state.active,
                dataFlow: state.dataFlow,
                activeSensors: state.activeSensors,
                isConnecting: state.isConnecting,
              });

              // Sync the parent component's active state if different
              if (state.active !== active) {
                onToggle(state.active);
              }
            }
          }
        } catch (error) {
          console.error('[SimulationControl] Error syncing with server:', error);
        }
      };

      syncWithServer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // Solo al montar, sin dependencies que causen re-ejecución

  // Connection progress animation (only for visual feedback during activation)
  useEffect(() => {
    if (!isConnecting) return;

    // Iniciar animación de 0 a 100
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setConnectionProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        // Completar conexión
        setIsConnecting(false);
        setDataFlow(true);
        setActiveSensors(98);
      }
    }, 200);

    return () => {
      clearInterval(interval);
    };
    // Solo ejecutar cuando isConnecting cambia a true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnecting]);

  // Cleanup: detener simulación SOLO cuando usuario cierra/refresca página
  // NO se ejecuta al navegar internamente (ej: ir a /alerts)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Solo ejecutar si la simulación está activa (usar dataFlow de Zustand)
      if (dataFlowRef.current) {
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
    const newState = !dataFlow;  // Usar estado de Zustand, no prop del padre

    if (!newState) {
      toast('¿Desactivar simulación?', {
        description: 'Se detendrán todos los flujos de datos activos',
        action: {
          label: 'Confirmar',
          onClick: async () => {
            // Actualizar Zustand store inmediatamente para feedback visual
            setDataFlow(false);
            setActiveSensors(0);
            setIsConnecting(false);
            setConnectionProgress(0);

            onToggle(newState);
            await sendWebhookToN8n(newState);

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
      // Actualizar Zustand store inmediatamente para feedback visual
      setIsConnecting(true);
      setConnectionProgress(0);

      onToggle(newState);
      sendWebhookToN8n(newState);

      toast.success('Iniciando simulación...', {
        description: 'Conectando con los sensores IoT'
      });
    }
  };

  const getStatusColor = () => {
    if (isConnecting) return 'bg-yellow-500';
    if (dataFlow) return 'bg-green-500';  // Solo usar Zustand state
    return 'bg-gray-400';
  };

  const getStatusText = () => {
    if (isConnecting) return 'Conectando...';
    if (dataFlow) return 'Activo';  // Solo usar Zustand state
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
                : dataFlow
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
                ) : dataFlow ? (
                  <Play className="h-5 w-5 text-white" />
                ) : (
                  <Pause className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {isConnecting ? 'Estableciendo conexión...' : dataFlow ? "Simulación activa" : "Simulación pausada"}
                </p>
                <p className="text-sm text-gray-600">
                  {isConnecting ? 'Configurando sensores' : dataFlow ? "Recibiendo datos en tiempo real" : "Flujos de datos detenidos"}
                </p>
              </div>
            </div>
            <Switch
              className='fleetcare-switch'
              checked={dataFlow}
              onCheckedChange={handleToggle}
              disabled={isConnecting || isSendingWebhook || isLoading}
            />
          </div>

          {/* Control de Probabilidad de Errores */}
          <div className="space-y-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <label className="font-semibold text-gray-800 text-sm">
                  Probabilidad de Errores
                </label>
              </div>
              <Badge
                variant="outline"
                className={`${
                  errorProbability >= 0.7 ? 'bg-red-100 text-red-700 border-red-300' :
                  errorProbability >= 0.4 ? 'bg-orange-100 text-orange-700 border-orange-300' :
                  'bg-green-100 text-green-700 border-green-300'
                }`}
              >
                {Math.round(errorProbability * 100)}%
              </Badge>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={errorProbability * 100}
              onChange={(e) => setErrorProbability(parseInt(e.target.value) / 100)}
              disabled={dataFlow} // No se puede cambiar mientras la simulación está activa
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500
                [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md
                [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-orange-500 [&::-moz-range-thumb]:cursor-pointer
                [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
            />

            <div className="flex justify-between text-xs text-gray-600">
              <span>Sin errores (0%)</span>
              <span>Máximo errores (100%)</span>
            </div>

            <p className="text-xs text-gray-600 mt-2">
              {dataFlow
                ? '⚠️ Detén la simulación para ajustar este valor'
                : 'Ajusta la frecuencia de alertas y problemas del simulador IoT'
              }
            </p>
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
          {dataFlow && (
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
          {dataFlow && (
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