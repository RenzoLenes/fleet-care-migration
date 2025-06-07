"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { SettingsView } from '@/components/settings/settings-view';

export default function SettingsPage() {
  return (
    <AppLayout>
      <SettingsView />
    </AppLayout>
  );
}