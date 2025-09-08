import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { appUsers } from '@/db/schema';
import { vehicleSchema, validateOrThrow } from '@/lib/validation/schemas';
import { eq } from 'drizzle-orm';

// Mock vehicles - should be imported from a shared location in real implementation
const mockVehicles = [
  {
    id: 'vehicle-1',
    tenant_id: '',
    vehicle_id: 'BUS-001',
    plate: 'ABC-123',
    model: 'Mercedes Benz O500',
    year: 2019,
    status: 'critical',
    driver: 'Carlos Mendoza',
    route: 'Ruta 45 - Centro Norte',
    last_maintenance: '2024-01-15',
    next_maintenance: '2024-02-15',
    mileage: 145234,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'vehicle-2',
    tenant_id: '',
    vehicle_id: 'BUS-002',
    plate: 'DEF-456',
    model: 'Volvo B7R',
    year: 2020,
    status: 'active',
    driver: 'María González',
    route: 'Ruta 12 - Norte Sur',
    last_maintenance: '2024-01-20',
    next_maintenance: '2024-02-20',
    mileage: 89456,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'vehicle-3',
    tenant_id: '',
    vehicle_id: 'BUS-003',
    plate: 'GHI-789',
    model: 'Scania K280',
    year: 2018,
    status: 'maintenance',
    driver: 'José Rodríguez',
    route: 'Ruta 8 - Este Oeste',
    last_maintenance: '2024-01-10',
    next_maintenance: '2024-02-10',
    mileage: 203567,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// GET /api/vehicles/[id] - Get specific vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant ID for the user
    const userTenant = await db
      .select({ tenant_id: appUsers.tenant_id })
      .from(appUsers)
      .where(eq(appUsers.id, userId))
      .limit(1);

    if (userTenant.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const tenantId = userTenant[0].tenant_id;
    const vehicleId = params.id;

    // Apply tenant_id to mock data and find vehicle
    const vehiclesWithTenant = mockVehicles.map(vehicle => ({
      ...vehicle,
      tenant_id: tenantId,
    }));

    const vehicle = vehiclesWithTenant.find(v => 
      v.vehicle_id === vehicleId && v.tenant_id === tenantId
    );

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      vehicle,
    });

  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/vehicles/[id] - Update specific vehicle
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant ID for the user
    const userTenant = await db
      .select({ tenant_id: appUsers.tenant_id })
      .from(appUsers)
      .where(eq(appUsers.id, userId))
      .limit(1);

    if (userTenant.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const tenantId = userTenant[0].tenant_id;
    const vehicleId = params.id;

    // Parse and validate request body
    const body = await request.json();
    const updateData = validateOrThrow(vehicleSchema.partial(), {
      ...body,
      tenant_id: tenantId,
      vehicle_id: vehicleId, // Ensure vehicle_id matches URL parameter
    });

    // Find existing vehicle
    const vehicleIndex = mockVehicles.findIndex(v => v.vehicle_id === vehicleId);
    
    if (vehicleIndex === -1) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Update vehicle
    const updatedVehicle = {
      ...mockVehicles[vehicleIndex],
      tenant_id: tenantId,
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    mockVehicles[vehicleIndex] = updatedVehicle;

    return NextResponse.json({
      success: true,
      message: 'Vehicle updated successfully',
      vehicle: updatedVehicle,
    });

  } catch (error) {
    console.error('Error updating vehicle:', error);
    
    if (error instanceof Error && error.message.includes('Validation error')) {
      return NextResponse.json(
        { error: 'Invalid vehicle data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/vehicles/[id] - Delete specific vehicle
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant ID for the user
    const userTenant = await db
      .select({ tenant_id: appUsers.tenant_id })
      .from(appUsers)
      .where(eq(appUsers.id, userId))
      .limit(1);

    if (userTenant.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const tenantId = userTenant[0].tenant_id;
    const vehicleId = params.id;

    // Find existing vehicle
    const vehicleIndex = mockVehicles.findIndex(v => v.vehicle_id === vehicleId);
    
    if (vehicleIndex === -1) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Check ownership (tenant_id)
    const vehicle = { ...mockVehicles[vehicleIndex], tenant_id: tenantId };
    if (vehicle.tenant_id !== tenantId) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Delete vehicle
    const deletedVehicle = mockVehicles.splice(vehicleIndex, 1)[0];

    return NextResponse.json({
      success: true,
      message: 'Vehicle deleted successfully',
      vehicle: { ...deletedVehicle, tenant_id: tenantId },
    });

  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}