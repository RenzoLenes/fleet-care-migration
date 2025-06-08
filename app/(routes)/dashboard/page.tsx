// app/(routes)/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { AppLayout } from '@/app/_components/layout/app-layout';
import { DashboardView } from '@/app/(routes)/dashboard/_components/dashboard-view';
import { InitialSetupModal } from '@/app/_components/initial-setup';

export default function Home() {
  const { user, isLoaded } = useUser();
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [isCheckingSetup, setIsCheckingSetup] = useState(true);
  const [setupCompleted, setSetupCompleted] = useState(false); // Nuevo estado para controlar cuando se completa el setup

  useEffect(() => {
    if (isLoaded && user) {
      checkIfSetupNeeded();
    }
  }, [isLoaded, user]);

  const checkIfSetupNeeded = async () => {
    try {
      // Verificar si el usuario ya completó el setup inicial
      const response = await fetch('/api/user/check-setup');
      const data = await response.json();
      
      setShowSetupModal(!data.isSetupComplete);
    } catch (error) {
      console.error('Error verificando setup:', error);
      // En caso de error, mostrar el modal para estar seguros
      setShowSetupModal(true);
    } finally {
      setIsCheckingSetup(false);
    }
  };

  const handleSetupComplete = async (setupData: { organizationName: string; phoneNumber: string }) => {
    try {
      const response = await fetch('/api/user/complete-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          organizationName: setupData.organizationName,
          phoneNumber: setupData.phoneNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar información');
      }

      setShowSetupModal(false);
      setSetupCompleted(true); // Marcar que el setup se completó
    } catch (error) {
      console.error('Error completando setup:', error);
      // Aquí podrías mostrar un toast de error
      alert('Error al guardar la información. Por favor, intenta de nuevo.');
    }
  };

  // Mostrar loading mientras verificamos el setup
  if (!isLoaded || isCheckingSetup) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <DashboardView 
        refreshTrigger={setupCompleted} // Pasar el trigger para refrescar
      />
      <InitialSetupModal 
        isOpen={showSetupModal}
        onComplete={handleSetupComplete}
      />
    </AppLayout>
  );
}