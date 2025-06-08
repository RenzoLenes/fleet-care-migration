"use client";

import { useState, useEffect } from 'react';
import { Thermometer, Battery, Zap, Gauge } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TechData {
  engineTemp: number;
  batteryVoltage: number;
  fuelLevel: number;
  rpm: number;
  dtcCodes: string[];
}

export function VehicleTechData() {
  const [data, setData] = useState<TechData>({
    engineTemp: 98,
    batteryVoltage: 11.8,
    fuelLevel: 45,
    rpm: 1850,
    dtcCodes: ['P0301', 'P0171']
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        engineTemp: prev.engineTemp + (Math.random() - 0.5) * 2,
        batteryVoltage: prev.batteryVoltage + (Math.random() - 0.5) * 0.2,
        rpm: prev.rpm + (Math.random() - 0.5) * 100
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getTempStatus = (temp: number) => {
    if (temp > 95) return { color: 'text-destructive', status: 'Crítico' };
    if (temp > 85) return { color: 'text-orange-500', status: 'Alto' };
    return { color: 'text-green-500', status: 'Normal' };
  };

  const getBatteryStatus = (voltage: number) => {
    if (voltage < 12) return { color: 'text-destructive', status: 'Bajo' };
    if (voltage < 12.5) return { color: 'text-orange-500', status: 'Medio' };
    return { color: 'text-green-500', status: 'Normal' };
  };

  const tempStatus = getTempStatus(data.engineTemp);
  const batteryStatus = getBatteryStatus(data.batteryVoltage);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Thermometer className="h-4 w-4" />
            <span className="text-sm font-medium">Temperatura Motor</span>
          </div>
          <p className="text-lg font-bold">{data.engineTemp.toFixed(1)}°C</p>
          <Badge variant="outline" className={tempStatus.color}>
            {tempStatus.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Battery className="h-4 w-4" />
            <span className="text-sm font-medium">Voltaje Batería</span>
          </div>
          <p className="text-lg font-bold">{data.batteryVoltage.toFixed(1)}V</p>
          <Badge variant="outline" className={batteryStatus.color}>
            {batteryStatus.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">Nivel Combustible</span>
          </div>
          <p className="text-lg font-bold">{data.fuelLevel}%</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Gauge className="h-4 w-4" />
            <span className="text-sm font-medium">RPM</span>
          </div>
          <p className="text-lg font-bold">{data.rpm.toFixed(0)}</p>
        </div>
      </div>

      {data.dtcCodes.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Códigos DTC Activos</label>
          <div className="flex flex-wrap gap-2">
            {data.dtcCodes.map((code) => (
              <Badge key={code} variant="destructive">
                {code}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}