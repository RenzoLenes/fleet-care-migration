"use client";

import { AppLayout } from '@/app/_components/layout/app-layout';
import { SettingsView } from '@/app/(routes)/dashboard/settings/_components/settings-view';

export default function SettingsPage() {
  return (
    <AppLayout>
      <SettingsView />
    </AppLayout>
  );
}