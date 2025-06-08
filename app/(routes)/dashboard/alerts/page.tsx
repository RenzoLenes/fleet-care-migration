"use client";

import { AppLayout } from '@/app/_components/layout/app-layout';
import { AlertsView } from '@/app/(routes)/dashboard/alerts/_components/alerts-view';

export default function AlertsPage() {
  return (
    <AppLayout>
      <AlertsView />
    </AppLayout>
  );
}