"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const historyData = [
  { time: '00:00', temp: 82, voltage: 12.4, fuel: 65 },
  { time: '04:00', temp: 85, voltage: 12.2, fuel: 58 },
  { time: '08:00', temp: 90, voltage: 12.1, fuel: 45 },
  { time: '12:00', temp: 95, voltage: 11.9, fuel: 32 },
  { time: '16:00', temp: 98, voltage: 11.8, fuel: 25 },
  { time: '20:00', temp: 96, voltage: 12.0, fuel: 45 },
];

interface VehicleHistoryProps {
  vehicleId: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function VehicleHistory({ vehicleId }: VehicleHistoryProps) {
  return (
    <Card className='fleetcare-card'>
      <CardHeader>
        <CardTitle>Historial Técnico</CardTitle>
        <CardDescription>
          Evolución de parámetros técnicos en las últimas 24h
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={historyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgb(203 213 225)"
              opacity={0.6}
            />
            <XAxis
              dataKey="time"
              stroke="rgb(100 116 139)"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="rgb(100 116 139)"
              fontSize={12}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid rgb(203 213 225)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              labelStyle={{ color: 'rgb(51 65 85)' }}
            />
            <Line
              type="monotone"
              dataKey="temp"
              stroke="#ef4444"
              strokeWidth={3}
              name="Temperatura (°C)"
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2, fill: 'white' }}
            />
            <Line
              type="monotone"
              dataKey="voltage"
              stroke="#3b82f6"
              strokeWidth={3}
              name="Voltaje (V)"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
            />
            <Line
              type="monotone"
              dataKey="fuel"
              stroke="#10b981"
              strokeWidth={3}
              name="Combustible (%)"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: 'white' }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Leyenda personalizada */}
        <div className="flex flex-wrap justify-center gap-6 mt-4 pt-4 border-blue-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-slate-600 font-medium">Temperatura (°C)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-slate-600 font-medium">Voltaje (V)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-slate-600 font-medium">Combustible (%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}