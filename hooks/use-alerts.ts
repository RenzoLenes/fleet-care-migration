"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, type RealtimeAlert } from '@/lib/supabase';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';
// playAlertSound ya no se usa aquí - lo maneja GlobalAlertListener

interface AlertsStats {
    critical: number;
    medium: number;
    pending: number;
    resolvedToday: number;
}

export function useAlerts(severityFilter: string = 'all', statusFilter: string = 'all') {
    const [alerts, setAlerts] = useState<RealtimeAlert[]>([]);
    const [stats, setStats] = useState<AlertsStats>({
        critical: 0,
        medium: 0,
        pending: 0,
        resolvedToday: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalAlerts, setTotalAlerts] = useState(0);
    const itemsPerPage = 10;

    // Ref para controlar si ya hay una suscripción activa
    const channelRef = useRef<RealtimeChannel | null>(null);
    const isSubscribedRef = useRef(false);

    // Función para obtener alertas desde la API
    const fetchAlerts = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (severityFilter !== 'all') params.append('severity', severityFilter);
            if (statusFilter !== 'all') params.append('status', statusFilter);
            params.append('page', currentPage.toString());
            params.append('limit', itemsPerPage.toString());

            const response = await fetch(`/api/alerts?${params.toString()}`);
            if (!response.ok) throw new Error('Error al obtener alertas');

            const data = await response.json();
            setAlerts(data.alerts);
            setTotalPages(data.pagination?.totalPages || 1);
            setTotalAlerts(data.pagination?.total || 0);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            toast.error('Error al cargar alertas');
        } finally {
            setLoading(false);
        }
    }, [severityFilter, statusFilter, currentPage]);

    // Función para obtener estadísticas
    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch('/api/alerts/stats');
            if (!response.ok) throw new Error('Error al obtener estadísticas');

            const data = await response.json();
            setStats(data.stats);
        } catch (err) {
            console.error('Error al obtener estadísticas:', err);
        }
    }, []);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [severityFilter, statusFilter]);

    // Función para resolver una alerta
    const resolveAlert = useCallback(async (alertId: string) => {
        try {
            const response = await fetch('/api/alerts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ alertId, status: 'resolved' })
            });

            if (!response.ok) throw new Error('Error al resolver alerta');

            const data = await response.json();

            // Actualizar estado local
            setAlerts(prev =>
                prev.map(alert =>
                    alert.id === alertId
                        ? { ...alert, status: 'resolved', updated_at: data.alert.updated_at }
                        : alert
                )
            );

            toast.success('Alerta resuelta', {
                description: 'La alerta ha sido marcada como resuelta.'
            });

            // Actualizar estadísticas
            fetchStats();
        } catch (err) {
            console.error(err);
            toast.error('Error al resolver alerta');
        }
    }, [fetchStats]);

    // Configurar suscripción en tiempo real - SOLO UNA VEZ
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

                // Crear un canal único con timestamp para evitar conflictos
                const channelName = `alerts_channel_${Date.now()}`;

                channelRef.current = supabase
                    .channel(channelName)
                    .on(
                        'postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: 'alerts',
                            filter: `tenant_id=eq.${tenant.id}`,
                        },
                        (payload) => {
                            console.log('Realtime payload:', payload);

                            const alertData = payload.new as RealtimeAlert;

                            switch (payload.eventType) {
                                case 'INSERT':
                                    setAlerts(prev => {
                                        // Evitar duplicados
                                        const exists = prev.some(alert => alert.id === alertData.id);
                                        if (exists) return prev;
                                        return [alertData, ...prev];
                                    });

                                    // NOTA: El sonido y toast ahora se manejan en GlobalAlertListener
                                    // para evitar duplicados y que funcione en todas las páginas

                                    fetchStats();
                                    break;

                                case 'UPDATE':
                                    setAlerts(prev =>
                                        prev.map(alert =>
                                            alert.id === alertData.id ? alertData : alert
                                        )
                                    );
                                    fetchStats();
                                    break;

                                case 'DELETE':
                                    setAlerts(prev =>
                                        prev.filter(alert => alert.id !== payload.old.id)
                                    );
                                    fetchStats();
                                    break;
                            }
                        }
                    )
                    .subscribe((status) => {
                        console.log('Subscription status:', status);
                        if (status === 'SUBSCRIBED') {
                            isSubscribedRef.current = true;
                        } else if (status === 'CLOSED') {
                            isSubscribedRef.current = false;
                        }
                    });

            } catch (err) {
                console.error('Error configurando suscripción:', err);
            }
        };

        setupRealtimeSubscription();

        // Cleanup function
        return () => {
            if (channelRef.current) {
                console.log('Limpiando suscripción...');
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
                isSubscribedRef.current = false;
            }
        };
    }, []); // Array de dependencias vacío para que solo se ejecute una vez

    // Cargar datos iniciales
    useEffect(() => {
        fetchAlerts();
        fetchStats();
    }, [fetchAlerts, fetchStats]);

    return {
        alerts,
        stats,
        loading,
        error,
        refetch: fetchAlerts,
        resolveAlert,
        pagination: {
            currentPage,
            totalPages,
            totalAlerts,
            itemsPerPage,
            onPageChange: setCurrentPage
        }
    };
}