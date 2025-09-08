"use client";

import { Truck, Activity, AlertTriangle, AlertCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const stats = [
  {
    title: 'Total Buses',
    value: '127',
    icon: Truck,
    description: 'Vehículos registrados',
    trend: '+2 este mes',
    variant: 'primary' as const
  },
  {
    title: 'Buses Activos',
    value: '98',
    icon: Activity,
    description: 'En funcionamiento',
    trend: '77% de la flota',
    variant: 'success' as const
  },
  {
    title: 'Alertas Críticas',
    value: '3',
    icon: AlertCircle,
    description: 'Requieren atención inmediata',
    variant: 'destructive' as const,
    badgeLabel: 'activas'
  },
  {
    title: 'Alertas Medias',
    value: '8',
    icon: AlertTriangle,
    description: 'Monitoreo requerido',
    variant: 'warning' as const,
    badgeLabel: 'pendientes'
  },
  {
    title: 'Alertas Bajas',
    value: '15',
    icon: FileText,
    description: 'Mantenimiento preventivo',
    variant: 'warning' as const,
    badgeLabel: 'programadas'
  }
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className={`metric-card group stats-card-${stat.variant}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-xl stats-icon-${stat.variant} bg-background/50 shadow-md`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <p className="text-xs text-muted-foreground mb-2">{stat.description}</p>
              {stat.badgeLabel && (
                <Badge 
                  variant={stat.variant === 'success' ? 'secondary' : stat.variant === 'warning' ? 'outline' : stat.variant} 
                  className="text-xs font-medium shadow-sm rounded-full px-2 py-1"
                >
                  {stat.value} {stat.badgeLabel}
                </Badge>
              )}
              {stat.trend && (
                <p className="text-xs text-primary font-medium mt-2">{stat.trend}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}