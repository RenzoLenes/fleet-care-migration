"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface TenantData {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  created_at: string;
}

export function useTenant() {
  const { user, isLoaded } = useUser();
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      fetchTenant();
    }
  }, [isLoaded, user]);

  const fetchTenant = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/tenant');
      
      if (!response.ok) {
        throw new Error('Error al obtener información del tenant');
      }
      
      const data = await response.json();
      setTenant(data.tenant);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    tenant,
    isLoading,
    error,
    refetch: fetchTenant
  };
}