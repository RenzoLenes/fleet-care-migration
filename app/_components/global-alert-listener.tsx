"use client";

import { useEffect, useRef } from 'react';
import { supabase, type RealtimeAlert } from '@/lib/supabase';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';
import { playAlertSound } from '@/lib/sound';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

/**
 * Componente global que escucha alertas en tiempo real y muestra notificaciones
 * Se monta en el layout principal para que funcione en todas las páginas
 */
export function GlobalAlertListener() {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    // Si ya hay una suscripción activa, no crear otra
    if (isSubscribedRef.current || channelRef.current) {
      return;
    }

    const setupRealtimeSubscription = async () => {
      try {
        // Obtener tenant del usuario
        const tenantResponse = await fetch('/api/user/tenant');
        if (!tenantResponse.ok) {
          console.error('No se pudo obtener el tenant del usuario');
          return;
        }

        const { tenant } = await tenantResponse.json();

        // Crear un canal único para alertas globales
        const channelName = `global_alerts_${Date.now()}`;

        channelRef.current = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'alerts',
              filter: `tenant_id=eq.${tenant.id}`,
            },
            (payload) => {
              const alertData = payload.new as RealtimeAlert;

              // Reproducir sonido basado en la severidad
              const soundType = alertData.severity === 'high' ? 'critical'
                              : alertData.severity === 'medium' ? 'warning'
                              : 'info';
              playAlertSound(soundType);

              // Determinar icono y estilo del toast
              const getToastConfig = () => {
                switch (alertData.severity) {
                  case 'high':
                    return {
                      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
                      className: 'border-red-500'
                    };
                  case 'medium':
                    return {
                      icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
                      className: 'border-orange-500'
                    };
                  default:
                    return {
                      icon: <Info className="h-5 w-5 text-blue-500" />,
                      className: 'border-blue-500'
                    };
                }
              };

              const config = getToastConfig();

              // Mostrar notificación toast
              toast(
                <div className="flex items-start gap-3">
                  {config.icon}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {alertData.vehicle_id}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {alertData.description || alertData.alert_type}
                    </div>
                    {alertData.llm_diagnosis && (
                      <div className="text-xs text-gray-500 mt-1 italic">
                        💡 {alertData.llm_diagnosis.substring(0, 100)}
                        {alertData.llm_diagnosis.length > 100 ? '...' : ''}
                      </div>
                    )}
                  </div>
                </div>,
                {
                  duration: alertData.severity === 'high' ? 10000 : 5000,
                  className: config.className,
                  position: 'top-right',
                }
              );

              console.log('🚨 Nueva alerta global:', alertData);
            }
          )
          .subscribe((status) => {
            console.log('Global alert subscription status:', status);
            if (status === 'SUBSCRIBED') {
              isSubscribedRef.current = true;
              console.log('✅ Escuchando alertas en tiempo real (global)');
            } else if (status === 'CLOSED') {
              isSubscribedRef.current = false;
            }
          });

      } catch (err) {
        console.error('Error configurando suscripción global de alertas:', err);
      }
    };

    setupRealtimeSubscription();

    // Cleanup function
    return () => {
      if (channelRef.current) {
        console.log('Limpiando suscripción global de alertas...');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, []); // Solo se ejecuta una vez al montar

  // Este componente no renderiza nada visible
  return null;
}
