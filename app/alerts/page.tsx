"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { AlertsView } from '@/components/alerts/alerts-view';

export default function AlertsPage() {
  return (
    <AppLayout>
      <AlertsView />
    </AppLayout>
  );
}