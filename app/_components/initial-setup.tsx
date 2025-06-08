// components/initial-setup-modal.tsx
"use client";
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface InitialSetupModalProps {
    isOpen: boolean;
    onComplete: (data: { organizationName: string; phoneNumber: string }) => void;
}

export function InitialSetupModal({ isOpen, onComplete }: InitialSetupModalProps) {
    const [organizationName, setOrganizationName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ organizationName?: string; phoneNumber?: string }>({});

    // Función para limpiar el número de teléfono (eliminar espacios, guiones, paréntesis)
    const cleanPhoneNumber = (phone: string) => {
        return phone.replace(/[\s\-\(\)\.]/g, '');
    };

    // Función para formatear el número mientras escribe (solo visual)
    const formatPhoneDisplay = (value: string) => {
        // Limpiar caracteres no válidos (permitir números, +, espacios, guiones, paréntesis)
        const cleaned = value.replace(/[^\d\+\s\-\(\)]/g, '');
        return cleaned;
    };

    const validateForm = () => {
        const newErrors: { organizationName?: string; phoneNumber?: string } = {};

        if (!organizationName.trim()) {
            newErrors.organizationName = 'El nombre de la organización es requerido';
        }

        const cleanedPhone = cleanPhoneNumber(phoneNumber);

        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = 'El número de teléfono es requerido';
        } else if (cleanedPhone.length < 8) {
            newErrors.phoneNumber = 'El número debe tener al menos 8 dígitos';
        } else if (cleanedPhone.length > 15) {
            newErrors.phoneNumber = 'El número es demasiado largo (máximo 15 dígitos)';
        } else if (!/^[\+]?[\d]+$/.test(cleanedPhone)) {
            newErrors.phoneNumber = 'Formato inválido. Use solo números y opcionalmente +';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatPhoneDisplay(e.target.value);
        setPhoneNumber(formattedValue);

        // Limpiar error si existe
        if (errors.phoneNumber) {
            setErrors(prev => ({ ...prev, phoneNumber: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // Limpiar el número de teléfono antes de enviar
            const cleanedPhone = cleanPhoneNumber(phoneNumber);

            await onComplete({
                organizationName: organizationName.trim(),
                phoneNumber: cleanedPhone
            });

            toast.success('Registro Completado', {
                description: 'Organización creada correctamente'
            });

        } catch (error) {
            console.error('Error al completar setup inicial:', error);
            toast.error('Error', {
                description: 'Hubo un problema al completar el registro. Inténtalo nuevamente.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Mostrar el número limpio que se enviará
    const cleanPreview = phoneNumber ? cleanPhoneNumber(phoneNumber) : '';

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-semibold">
                        ¡Bienvenido! 🎉
                    </DialogTitle>
                    <p className="text-center text-gray-600 mt-2">
                        Para completar tu registro, necesitamos algunos datos adicionales
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="organizationName">
                            Nombre de la Organización *
                        </Label>
                        <Input
                            id="organizationName"
                            type="text"
                            placeholder="Ej: Mi Empresa S.A."
                            value={organizationName}
                            onChange={(e) => {
                                setOrganizationName(e.target.value);
                                if (errors.organizationName) {
                                    setErrors(prev => ({ ...prev, organizationName: undefined }));
                                }
                            }}
                            className={errors.organizationName ? 'border-red-500' : ''}
                        />
                        {errors.organizationName && (
                            <p className="text-sm text-red-500">{errors.organizationName}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">
                            Número de Teléfono del Responsable *
                        </Label>
                        <Input
                            id="phoneNumber"
                            type="tel"
                            placeholder="+51 999 888 777 o 999888777"
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            className={errors.phoneNumber ? 'border-red-500' : ''}
                        />

                        {/* Preview del número que se enviará */}
                        {cleanPreview && cleanPreview !== phoneNumber && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                <Phone className="h-4 w-4" />
                                <span>Se enviará como: <strong>{cleanPreview}</strong></span>
                            </div>
                        )}

                        {errors.phoneNumber && (
                            <p className="text-sm text-red-500">{errors.phoneNumber}</p>
                        )}

                        <p className="text-xs text-gray-500">
                            Puede incluir código de país. Ej: +51999888777 o 999888777
                        </p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full mt-6"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            'Completar Registro'
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}