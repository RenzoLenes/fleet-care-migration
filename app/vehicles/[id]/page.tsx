import { AppLayout } from '@/components/layout/app-layout';
import { VehicleDetailView } from '@/components/vehicles/vehicle-detail-view';

export interface VehicleDetailPageProps {
  params: { id: string };
}

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AppLayout>
      <VehicleDetailView vehicleId={id} />
    </AppLayout>
  );
}
