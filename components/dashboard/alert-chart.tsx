"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { hour: '00:00', critical: 0, medium: 2, low: 5 },
  { hour: '04:00', critical: 1, medium: 3, low: 8 },
  { hour: '08:00', critical: 2, medium: 5, low: 12 },
  { hour: '12:00', critical: 1, medium: 8, low: 15 },
  { hour: '16:00', critical: 3, medium: 6, low: 18 },
  { hour: '20:00', critical: 2, medium: 4, low: 10 },
];

const CustomTooltip = ({ active, payload, label }: { active?: string, payload?: [], label?: string}) => {
  if (active && payload && payload.length) {
    return (
      <div className="fleetcare-card p-3">
        <p className="text-sm font-medium text-gray-800 mb-2">{label}</p>
        {payload.map((entry: {color: string, name: string, value: string}, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AlertChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="fleetcare-card">
        <CardHeader>
          <CardTitle className="text-gray-800">Alertas en las Últimas 24h</CardTitle>
          <CardDescription className="text-gray-600">
            Distribución de alertas por severidad a lo largo del día
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis
                dataKey="hour"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '12px',
                  color: 'hsl(var(--muted-foreground))'
                }}
              />
              <Line
                type="monotone"
                dataKey="critical"
                stroke="#ef4444"
                strokeWidth={2}
                name="Críticas"
                dot={{ fill: '#ef4444', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#ef4444' }}
              />
              <Line
                type="monotone"
                dataKey="medium"
                stroke="#f97316"
                strokeWidth={2}
                name="Medias"
                dot={{ fill: '#f97316', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#f97316' }}
              />
              <Line
                type="monotone"
                dataKey="low"
                stroke="#eab308"
                strokeWidth={2}
                name="Bajas"
                dot={{ fill: '#eab308', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#eab308' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}