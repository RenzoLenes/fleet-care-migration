import { create } from 'zustand';

interface SimulationState {
  // Estado visual
  active: boolean;
  dataFlow: boolean;
  activeSensors: number;
  connectionProgress: number;
  isConnecting: boolean;
  isLoading: boolean;
  isSendingWebhook: boolean;

  // Acciones
  setActive: (active: boolean) => void;
  setDataFlow: (dataFlow: boolean) => void;
  setActiveSensors: (count: number) => void;
  setConnectionProgress: (progress: number) => void;
  setIsConnecting: (connecting: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setIsSendingWebhook: (sending: boolean) => void;

  // Acción para actualizar todo el estado desde el servidor
  updateFromServer: (serverState: {
    active: boolean;
    dataFlow: boolean;
    activeSensors: number;
    connectionProgress: number;
    isConnecting: boolean;
  }) => void;

  // Reset completo
  reset: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  // Estado inicial
  active: false,
  dataFlow: false,
  activeSensors: 0,
  connectionProgress: 0,
  isConnecting: false,
  isLoading: false,
  isSendingWebhook: false,

  // Acciones individuales
  setActive: (active) => set({ active }),
  setDataFlow: (dataFlow) => set({ dataFlow }),
  setActiveSensors: (activeSensors) => set({ activeSensors }),
  setConnectionProgress: (connectionProgress) => set({ connectionProgress }),
  setIsConnecting: (isConnecting) => set({ isConnecting }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsSendingWebhook: (isSendingWebhook) => set({ isSendingWebhook }),

  // Actualización masiva desde servidor
  updateFromServer: (serverState) => set({
    active: serverState.active,
    dataFlow: serverState.dataFlow,
    activeSensors: serverState.activeSensors,
    connectionProgress: serverState.connectionProgress,
    isConnecting: serverState.isConnecting,
  }),

  // Reset
  reset: () => set({
    active: false,
    dataFlow: false,
    activeSensors: 0,
    connectionProgress: 0,
    isConnecting: false,
    isLoading: false,
    isSendingWebhook: false,
  }),
}));
