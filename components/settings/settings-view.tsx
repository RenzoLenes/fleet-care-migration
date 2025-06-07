"use client";

import { NotificationSettings } from './notification-settings';
import { ThemeSettings } from './theme-settings';
import { SystemSettings } from './system-settings';

export function SettingsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
        <p className="text-muted-foreground">
          Personaliza tu experiencia en FleetCare Monitor
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NotificationSettings />
        <ThemeSettings />
      </div>
      
      <SystemSettings />
    </div>
  );
}