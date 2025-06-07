"use client";

import { AlertCircle, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const recentAlerts = [
  {
    id: '1',
    vehicle: 'BUS-001',
    severity: 'critical',
    message: 'Temperatura del motor excede 95°C',
    time: '2 min ago',
    status: 'pending'
  },
  {
    id: '2',
    vehicle: 'BUS-045',
    severity: 'medium',
    message: 'Voltaje de batería bajo (11.8V)',
    time: '8 min ago',
    status: 'pending'
  },
  {
    id: '3',
    vehicle: 'BUS-023',
    severity: 'low',
    message: 'Mantenimiento programado pendiente',
    time: '15 min ago',
    status: 'acknowledged'
  },
  {
    id: '4',
    vehicle: 'BUS-078',
    severity: 'critical',
    message: 'Código DTC: P0301 - Falla de encendido',
    time: '32 min ago',
    status: 'in_progress'
  }
];

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'medium':
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    default:
      return <Clock className="h-4 w-4 text-yellow-500" />;
  }
};

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <Badge className="status-critical rounded-full px-2 py-1">Crítica</Badge>;
    case 'medium':
      return <Badge className="status-warning rounded-full px-2 py-1">Media</Badge>;
    default:
      return <Badge className="status-ok rounded-full px-2 py-1">Baja</Badge>;
  }
};

export function RecentAlerts() {
  return (
    <Card className="fleetcare-card">
      <CardHeader>
        <CardTitle className="text-gray-800">Alertas Recientes</CardTitle>
        <CardDescription className="text-gray-600">
          Últimas alertas del sistema de monitoreo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`flex items-start space-x-3 p-3 rounded-xl border hover:bg-alice-blue/50 transition-colors ${alert.severity === 'critical' ? 'alert-glow' : ''
                }`}
            >
              <div className="mt-1">
                {getSeverityIcon(alert.severity)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">{alert.vehicle}</p>
                  {getSeverityBadge(alert.severity)}
                </div>
                <p className="text-sm text-gray-600">{alert.message}</p>
                <p className="text-xs text-gray-500">{alert.time}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="fleetcare-button-secondary"
              >
                Ver
              </Button>
            </motion.div>
          ))}
        </div>
        <Button
          variant="outline"
          className="fleetcare-button-secondary w-full mt-4 rounded-xl"
        >
          Ver Todas las Alertas
        </Button>
      </CardContent>
    </Card>
  );
}