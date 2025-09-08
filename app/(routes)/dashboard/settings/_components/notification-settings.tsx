"use client";

import { useState, useEffect } from 'react';
import { Bell, Mail, Phone, MessageSquare, Volume2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { setSoundEnabled, getSoundEnabled, playAlertSound } from '@/lib/sound';

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    phoneAlerts: true,
    criticalOnly: false,
    immediateNotification: true,
    dailyReport: true,
    soundNotifications: true
  });

  // Load sound settings on component mount
  useEffect(() => {
    const soundEnabled = getSoundEnabled();
    setSettings(prev => ({ ...prev, soundNotifications: soundEnabled }));
  }, []);

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Handle sound settings immediately
    if (key === 'soundNotifications') {
      setSoundEnabled(value);
      if (value) {
        // Play a test sound when enabling
        playAlertSound('info');
      }
    }
  };

  const handleSave = () => {
    // Save sound settings to localStorage
    setSoundEnabled(settings.soundNotifications);
    
    toast.success('Configuración guardada', {
      description: 'Las preferencias de notificación han sido actualizadas.'
    });
  };

  return (
    <Card className='fleetcare-card'>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Notificaciones</span>
        </CardTitle>
        <CardDescription>
          Configura cómo y cuándo recibir notificaciones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="email-alerts">Alertas por Email</Label>
            </div>


            <Switch
              className='fleetcare-switch'
              id="email-alerts"
              checked={settings.emailAlerts}
              onCheckedChange={(value) => handleSettingChange('emailAlerts', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="sms-alerts">Alertas por SMS</Label>
            </div>
            <Switch
              className='fleetcare-switch'
              id="sms-alerts"
              checked={settings.smsAlerts}
              onCheckedChange={(value) => handleSettingChange('smsAlerts', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="phone-alerts">Llamadas de Emergencia</Label>
            </div>
            <Switch
              className='fleetcare-switch'
              id="phone-alerts"
              checked={settings.phoneAlerts}
              onCheckedChange={(value) => handleSettingChange('phoneAlerts', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <Label htmlFor="sound-notifications">Sonidos de Alerta</Label>
                <span className="text-xs text-muted-foreground">
                  Reproducir sonido cuando lleguen nuevas alertas
                </span>
              </div>
            </div>
            <Switch
              className='fleetcare-switch'
              id="sound-notifications"
              checked={settings.soundNotifications}
              onCheckedChange={(value) => handleSettingChange('soundNotifications', value)}
            />
          </div>

          {settings.soundNotifications && (
            <div className="ml-7 mt-2 space-y-2">
              <p className="text-xs text-muted-foreground mb-2">Probar sonidos:</p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => playAlertSound('info')}
                  className="text-xs"
                >
                  Información
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => playAlertSound('warning')}
                  className="text-xs"
                >
                  Advertencia
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => playAlertSound('critical')}
                  className="text-xs"
                >
                  Crítica
                </Button>
              </div>
            </div>
          )}
        </div>

        <hr />

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Preferencias de Entrega</h4>

          <div className="flex items-center justify-between">
            <Label htmlFor="critical-only">Solo alertas críticas</Label>
            <Switch
              className='fleetcare-switch'
              id="critical-only"
              checked={settings.criticalOnly}
              onCheckedChange={(value) => handleSettingChange('criticalOnly', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="immediate">Notificación inmediata</Label>
            <Switch
              className='fleetcare-switch'
              id="immediate"
              checked={settings.immediateNotification}
              onCheckedChange={(value) => handleSettingChange('immediateNotification', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="daily-report">Reporte diario</Label>
            <Switch
              className='fleetcare-switch'
              id="daily-report"
              checked={settings.dailyReport}
              onCheckedChange={(value) => handleSettingChange('dailyReport', value)}
            />
          </div>
        </div>

        <Button onClick={handleSave} className="w-full bg-blue-500 hover:bg-blue-600">
          Guardar Configuración
        </Button>
      </CardContent>
    </Card>
  );
}