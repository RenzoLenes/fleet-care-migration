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
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Buses Activos',
    value: '98',
    icon: Activity,
    description: 'En funcionamiento',
    trend: '77% de la flota',
    gradient: 'from-green-500 to-green-600'
  },
  {
    title: 'Alertas Críticas',
    value: '3',
    icon: AlertCircle,
    description: 'Requieren atención inmediata',
    variant: 'destructive' as const,
    gradient: 'from-red-500 to-red-600'
  },
  {
    title: 'Alertas Medias',
    value: '8',
    icon: AlertTriangle,
    description: 'Monitoreo requerido',
    variant: 'default' as const,
    gradient: 'from-orange-500 to-orange-600'
  },
  {
    title: 'Alertas Bajas',
    value: '15',
    icon: FileText,
    description: 'Mantenimiento preventivo',
    variant: 'secondary' as const,
    gradient: 'from-yellow-500 to-yellow-600'
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
          <Card className="metric-card group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-md`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <p className="text-xs text-gray-600 mb-2">{stat.description}</p>
              {stat.variant && (
                <Badge 
                  variant={stat.variant} 
                  className="text-xs font-medium shadow-sm rounded-full px-2 py-1"
                >
                  {stat.value} activas
                </Badge>
              )}
              {stat.trend && (
                <p className="text-xs text-blue-600 font-medium mt-2">{stat.trend}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}