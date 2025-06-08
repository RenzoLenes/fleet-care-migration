"use client";

import { AlertCircle, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AlertsStatsProps {
  stats: {
    critical: number;
    medium: number;
    pending: number;
    resolvedToday: number;
  };
  loading?: boolean;
}

export function AlertsStats({ stats, loading }: AlertsStatsProps) {
  const statsConfig = [
    {
      title: 'Alertas Críticas',
      value: loading ? '...' : stats.critical.toString(),
      icon: AlertCircle,
      trend: '+2 desde ayer',
      color: 'text-destructive'
    },
    {
      title: 'Alertas Medias',
      value: loading ? '...' : stats.medium.toString(),
      icon: AlertTriangle,
      trend: '+1 desde ayer',
      color: 'text-orange-500'
    },
    {
      title: 'Pendientes',
      value: loading ? '...' : stats.pending.toString(),
      icon: Clock,
      trend: 'Requieren atención',
      color: 'text-blue-500'
    },
    {
      title: 'Resueltas Hoy',
      value: loading ? '...' : stats.resolvedToday.toString(),
      icon: CheckCircle,
      trend: '↑ 23% vs ayer',
      color: 'text-green-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsConfig.map((stat) => (
        <Card key={stat.title} className='fleetcare-card'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.trend}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}