"use client";

import { useState } from 'react';
import { Database, Globe, Shield, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function SystemSettings() {
  const [language, setLanguage] = useState('es');
  const [dataRetention, setDataRetention] = useState('90');

  const handleExportData = () => {
    toast.info('Exportando datos...', {
      description: 'La exportación de datos puede tardar unos minutos.'
    });
  };

  const handleClearCache = () => {
    toast.success('Caché limpiado', {
      description: 'El caché del sistema ha sido limpiado correctamente.'
    });
  };

  return (
    <Card className='fleetcare-card'>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Configuración del Sistema</span>
        </CardTitle>
        <CardDescription>
          Configuraciones avanzadas del sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="language">Idioma</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full bg-gradient-to-br from-white to-blue-50/50 border border-blue-200 rounded-sm hover:bg-gradient-to-br hover:from-blue-5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='bg-white border border-gray-200 shadow-lg'>
                <SelectItem value="es"
                  className="!hover:bg-blue-50 !hover:text-blue-700 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 cursor-pointer transition-colors duration-150"
                >Español</SelectItem>
                <SelectItem value="en"
                  className="!hover:bg-blue-50 !hover:text-blue-700 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 cursor-pointer transition-colors duration-150"
                >English</SelectItem>
                <SelectItem value="pt"
                  className="!hover:bg-blue-50 !hover:text-blue-700 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 cursor-pointer transition-colors duration-150"
                >Português</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="retention">Retención de Datos</Label>
            <Select value={dataRetention} onValueChange={setDataRetention}>
              <SelectTrigger className="w-full bg-gradient-to-br from-white to-blue-50/50 border border-blue-200 rounded-sm hover:bg-gradient-to-br hover:from-blue-5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='bg-white border border-gray-200 shadow-lg'>
                <SelectItem value="30"
                  className="!hover:bg-blue-50 !hover:text-blue-700 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 cursor-pointer transition-colors duration-150"
                >30 días</SelectItem>
                <SelectItem value="90"
                  className="!hover:bg-blue-50 !hover:text-blue-700 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 cursor-pointer transition-colors duration-150"
                >90 días</SelectItem>
                <SelectItem value="180"
                  className="!hover:bg-blue-50 !hover:text-blue-700 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 cursor-pointer transition-colors duration-150"
                >6 meses</SelectItem>
                <SelectItem value="365"
                  className="!hover:bg-blue-50 !hover:text-blue-700 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 cursor-pointer transition-colors duration-150"
                >1 año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <hr />

        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Seguridad y Mantenimiento</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button variant="default" onClick={handleExportData} className="w-full text-white bg-blue-500 hover:bg-blue-600 border-blue-100">
              <Database className="h-4 w-4 mr-2" />
              Exportar Datos
            </Button>

            <Button variant="default" onClick={handleClearCache} className="w-full text-white bg-blue-500 hover:bg-blue-600 border-blue-100">
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpiar Caché
            </Button>

            <Button variant="default" className="w-full text-white bg-blue-500 hover:bg-blue-600 border-blue-100">
              <Globe className="h-4 w-4 mr-2" />
              Logs del Sistema
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}