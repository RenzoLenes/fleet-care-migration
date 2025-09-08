"use client";

import { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVehicleAdded: () => void;
}

interface VehicleFormData {
  vehicle_id: string;
  plate: string;
  model: string;
  year: number;
  status: 'active' | 'maintenance' | 'critical' | 'inactive';
  driver?: string;
  route?: string;
  mileage?: number;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 31 }, (_, i) => currentYear - i);

export function AddVehicleModal({ isOpen, onClose, onVehicleAdded }: AddVehicleModalProps) {
  const [formData, setFormData] = useState<VehicleFormData>({
    vehicle_id: '',
    plate: '',
    model: '',
    year: currentYear,
    status: 'active',
    driver: '',
    route: '',
    mileage: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicle_id.trim()) {
      newErrors.vehicle_id = 'ID del vehículo es requerido';
    }

    if (!formData.plate.trim()) {
      newErrors.plate = 'Placa es requerida';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Modelo es requerido';
    }

    if (formData.year < 1990 || formData.year > currentYear + 1) {
      newErrors.year = 'Año inválido';
    }

    if (formData.mileage && formData.mileage < 0) {
      newErrors.mileage = 'El kilometraje no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el vehículo');
      }

      toast.success('Vehículo agregado exitosamente', {
        description: `${formData.plate} ha sido registrado en el sistema`
      });

      onVehicleAdded();
      handleClose();
    } catch (error) {
      console.error('Error creating vehicle:', error);
      toast.error('Error al crear el vehículo', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      vehicle_id: '',
      plate: '',
      model: '',
      year: currentYear,
      status: 'active',
      driver: '',
      route: '',
      mileage: 0,
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const handleInputChange = (field: keyof VehicleFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="fleetcare-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-blue-600" />
                  Agregar Nuevo Vehículo
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full hover:bg-gray-100"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Row 1 - Vehicle ID and Plate */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicle_id">ID del Vehículo *</Label>
                      <Input
                        id="vehicle_id"
                        value={formData.vehicle_id}
                        onChange={(e) => handleInputChange('vehicle_id', e.target.value)}
                        placeholder="Ej: BUS001"
                        className={`bg-gradient-to-br from-white to-blue-50/50 border rounded-sm ${errors.vehicle_id ? 'border-red-500' : 'border-blue-200'}`}
                        disabled={isSubmitting}
                      />
                      {errors.vehicle_id && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.vehicle_id}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="plate">Placa *</Label>
                      <Input
                        id="plate"
                        value={formData.plate}
                        onChange={(e) => handleInputChange('plate', e.target.value.toUpperCase())}
                        placeholder="Ej: ABC-123"
                        className={`bg-gradient-to-br from-white to-blue-50/50 border rounded-sm ${errors.plate ? 'border-red-500' : 'border-blue-200'}`}
                        disabled={isSubmitting}
                      />
                      {errors.plate && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.plate}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 2 - Model and Year */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="model">Modelo *</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => handleInputChange('model', e.target.value)}
                        placeholder="Ej: Mercedes Sprinter"
                        className={`bg-gradient-to-br from-white to-blue-50/50 border rounded-sm ${errors.model ? 'border-red-500' : 'border-blue-200'}`}
                        disabled={isSubmitting}
                      />
                      {errors.model && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.model}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">Año *</Label>
                      <Select 
                        value={formData.year.toString()} 
                        onValueChange={(value) => handleInputChange('year', parseInt(value))}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className={`bg-gradient-to-br from-white to-blue-50/50 border rounded-sm ${errors.year ? 'border-red-500' : 'border-blue-200'}`}>
                          <SelectValue placeholder="Seleccionar año" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg max-h-[200px]">
                          {years.map((year) => (
                            <SelectItem 
                              key={year} 
                              value={year.toString()}
                              className="hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors duration-150"
                            >
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.year && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.year}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 3 - Status and Mileage */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Estado</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value: 'active' | 'maintenance' | 'critical' | 'inactive') => 
                          handleInputChange('status', value)
                        }
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="bg-gradient-to-br from-white to-blue-50/50 border border-blue-200 rounded-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                          <SelectItem value="active" className="hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors duration-150">
                            Activo
                          </SelectItem>
                          <SelectItem value="maintenance" className="hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors duration-150">
                            Mantenimiento
                          </SelectItem>
                          <SelectItem value="critical" className="hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors duration-150">
                            Crítico
                          </SelectItem>
                          <SelectItem value="inactive" className="hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors duration-150">
                            Inactivo
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mileage">Kilometraje</Label>
                      <Input
                        id="mileage"
                        type="number"
                        value={formData.mileage || ''}
                        onChange={(e) => handleInputChange('mileage', parseInt(e.target.value) || 0)}
                        placeholder="Ej: 50000"
                        className={`bg-gradient-to-br from-white to-blue-50/50 border rounded-sm ${errors.mileage ? 'border-red-500' : 'border-blue-200'}`}
                        disabled={isSubmitting}
                        min="0"
                      />
                      {errors.mileage && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.mileage}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 4 - Driver and Route (Optional) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="driver">Conductor</Label>
                      <Input
                        id="driver"
                        value={formData.driver || ''}
                        onChange={(e) => handleInputChange('driver', e.target.value)}
                        placeholder="Nombre del conductor"
                        className="bg-gradient-to-br from-white to-blue-50/50 border border-blue-200 rounded-sm"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="route">Ruta</Label>
                      <Input
                        id="route"
                        value={formData.route || ''}
                        onChange={(e) => handleInputChange('route', e.target.value)}
                        placeholder="Ej: Ruta 01 - Centro"
                        className="bg-gradient-to-br from-white to-blue-50/50 border border-blue-200 rounded-sm"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="bg-gradient-to-br from-white to-blue-50/50 border border-blue-200 rounded-sm hover:bg-gradient-to-br hover:from-blue-50"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-sm min-w-[120px]"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Guardando...
                        </div>
                      ) : (
                        'Agregar Vehículo'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}