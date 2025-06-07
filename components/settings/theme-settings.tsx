"use client";

import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      value: 'light',
      label: 'Claro',
      icon: Sun,
      description: 'Tema claro para uso diurno'
    },
    {
      value: 'dark',
      label: 'Oscuro',
      icon: Moon,
      description: 'Tema oscuro para uso nocturno'
    },
    {
      value: 'system',
      label: 'Sistema',
      icon: Monitor,
      description: 'Sigue la configuración del sistema'
    }
  ];

  return (
    <Card className='fleetcare-card'>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Monitor className="h-5 w-5" />
          <span>Apariencia</span>
        </CardTitle>
        <CardDescription>
          Personaliza la apariencia de la interfaz
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {themes.map((themeOption) => (
          <div key={themeOption.value} className="flex items-center justify-between p-3 rounded-lg border fleetcare-card">
            <div className="flex items-center space-x-3">
              <themeOption.icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{themeOption.label}</p>
                <p className="text-sm text-muted-foreground">{themeOption.description}</p>
              </div>
            </div>
            <Button
              className='bg-blue-500 text-white hover:bg-blue-600'
              variant={theme === themeOption.value ? "default" : "default"}
              size="sm"
              onClick={() => setTheme(themeOption.value)}
            >
              {theme === themeOption.value ? 'Activo' : 'Seleccionar'}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}