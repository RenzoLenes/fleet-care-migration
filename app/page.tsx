"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { DashboardView } from '@/components/dashboard/dashboard-view';

export default function Home() {
  return (
    <AppLayout>
      <DashboardView />
    </AppLayout>
  );
}