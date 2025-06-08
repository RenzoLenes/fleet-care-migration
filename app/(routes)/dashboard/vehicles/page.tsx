"use client";

import { AppLayout } from '@/app/_components/layout/app-layout';
import { VehiclesView } from '@/app/(routes)/dashboard/vehicles/_components/vehicles-view';

export default function VehiclesPage() {
  return (
    <AppLayout>
      <VehiclesView />
    </AppLayout>
  );
} 