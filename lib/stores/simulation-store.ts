import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Estado que se persiste (sobrevive recargas y navegaciones)
interface PersistedState {
  dataFlow: boolean;
  activeSensors: number;
  active: boolean;
}

// Estado completo (persistente + temporal)
interface SimulationState extends PersistedState {
  // Estado temporal (NO se persiste)
  isConnecting: boolean;
  isLoading: boolean;
  isSendingWebhook: boolean;

  // Acciones
  setActive: (active: boolean) => void;
  setDataFlow: (dataFlow: boolean) => void;
  setActiveSensors: (count: number) => void;
  setIsConnecting: (connecting: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setIsSendingWebhook: (sending: boolean) => void;

  // Acción para actualizar todo el estado desde el servidor
  updateFromServer: (serverState: {
    active: boolean;
    dataFlow: boolean;
    activeSensors: number;
    isConnecting: boolean;
  }) => void;

  // Reset completo
  reset: () => void;
}

export const useSimulationStore = create<SimulationState>()(
  persist(
    (set) => ({
      // Estado inicial (se sobrescribe con lo guardado en localStorage)
      active: false,
      dataFlow: false,
      activeSensors: 0,

      // Estado temporal (siempre inicia en false, NO se persiste)
      isConnecting: false,
      isLoading: false,
      isSendingWebhook: false,

      // Acciones individuales
      setActive: (active) => set({ active }),
      setDataFlow: (dataFlow) => set({ dataFlow }),
      setActiveSensors: (activeSensors) => set({ activeSensors }),
      setIsConnecting: (isConnecting) => set({ isConnecting }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setIsSendingWebhook: (isSendingWebhook) => set({ isSendingWebhook }),

      // Actualización masiva desde servidor
      updateFromServer: (serverState) => set({
        active: serverState.active,
        dataFlow: serverState.dataFlow,
        activeSensors: serverState.activeSensors,
        isConnecting: serverState.isConnecting,
      }),

      // Reset
      reset: () => set({
        active: false,
        dataFlow: false,
        activeSensors: 0,
        isConnecting: false,
        isLoading: false,
        isSendingWebhook: false,
      }),
    }),
    {
      name: 'simulation-state', // nombre en localStorage
      storage: createJSONStorage(() => localStorage), // usar localStorage
      // Solo persistir estos campos
      partialize: (state) => ({
        dataFlow: state.dataFlow,
        activeSensors: state.activeSensors,
        active: state.active,
      }),
    }
  )
);
