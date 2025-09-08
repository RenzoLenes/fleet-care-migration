import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { appUsers } from '@/db/schema';
import { vehicleSchema, vehicleFiltersSchema, validateOrThrow, validateOrNull } from '@/lib/validation/schemas';
import { eq } from 'drizzle-orm';

// Mock vehicles table - In real implementation, this would be a proper DB table
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

// GET /api/vehicles - List vehicles with filters and pagination
export async function GET(request: NextRequest) {
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

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const filters = validateOrNull(vehicleFiltersSchema, queryParams) || {
      status: 'all',
      page: 1,
      limit: 20,
    };

    // Apply tenant_id to mock data
    const vehiclesWithTenant = mockVehicles.map(vehicle => ({
      ...vehicle,
      tenant_id: tenantId,
    }));

    // Apply filters
    let filteredVehicles = vehiclesWithTenant;

    // Status filter
    if (filters.status !== 'all') {
      filteredVehicles = filteredVehicles.filter(v => v.status === filters.status);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredVehicles = filteredVehicles.filter(v => 
        v.vehicle_id.toLowerCase().includes(searchLower) ||
        v.plate.toLowerCase().includes(searchLower) ||
        v.model.toLowerCase().includes(searchLower) ||
        v.driver?.toLowerCase().includes(searchLower) ||
        v.route?.toLowerCase().includes(searchLower)
      );
    }

    // Calculate pagination
    const total = filteredVehicles.length;
    const totalPages = Math.ceil(total / filters.limit);
    const offset = (filters.page - 1) * filters.limit;
    const paginatedVehicles = filteredVehicles.slice(offset, offset + filters.limit);

    return NextResponse.json({
      success: true,
      vehicles: paginatedVehicles,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages,
      }
    });

  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/vehicles - Create new vehicle
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const vehicleData = validateOrThrow(vehicleSchema, {
      ...body,
      tenant_id: tenantId, // Ensure tenant_id is set from authenticated user
    });

    // Check if vehicle_id already exists for this tenant
    const existingVehicle = mockVehicles.find(v => v.vehicle_id === vehicleData.vehicle_id);
    if (existingVehicle) {
      return NextResponse.json(
        { error: 'Vehicle ID already exists' },
        { status: 409 }
      );
    }

    // Create new vehicle (in real implementation, this would be a DB insert)
    const newVehicle = {
      id: `vehicle-${Date.now()}`,
      ...vehicleData,
      driver: vehicleData.driver ?? '', // Ensure driver is always a string
      route: vehicleData.route ?? '', // Ensure route is always a string
      last_maintenance: vehicleData.last_maintenance ?? '', // Ensure last_maintenance is always a string
      next_maintenance: vehicleData.next_maintenance ?? '', // Ensure next_maintenance is always a string
      mileage: vehicleData.mileage ?? 0, // Ensure mileage is always a number
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add to mock data (in real implementation, this would be a DB insert)
    mockVehicles.push(newVehicle);

    return NextResponse.json({
      success: true,
      message: 'Vehicle created successfully',
      vehicle: newVehicle,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating vehicle:', error);
    
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

// PUT /api/vehicles - Bulk update vehicles
export async function PUT(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    
    if (!body.vehicles || !Array.isArray(body.vehicles)) {
      return NextResponse.json(
        { error: 'Invalid request format. Expected { vehicles: Vehicle[] }' },
        { status: 400 }
      );
    }

    const updates = body.vehicles;
    const results = [];
    const errors = [];

    for (let i = 0; i < updates.length; i++) {
      try {
        const update = updates[i];
        
        // Validate update data
        const validatedUpdate = validateOrThrow(vehicleSchema.partial(), {
          ...update,
          tenant_id: tenantId,
        });

        // Find existing vehicle
        const vehicleIndex = mockVehicles.findIndex(v => 
          v.vehicle_id === validatedUpdate.vehicle_id && v.tenant_id === tenantId
        );

        if (vehicleIndex === -1) {
          errors.push(`Vehicle ${validatedUpdate.vehicle_id} not found`);
          continue;
        }

        // Update vehicle
        mockVehicles[vehicleIndex] = {
          ...mockVehicles[vehicleIndex],
          ...validatedUpdate,
          updated_at: new Date().toISOString(),
        };

        results.push(mockVehicles[vehicleIndex]);

      } catch (error) {
        errors.push(`Vehicle ${i}: ${error instanceof Error ? error.message : 'Update failed'}`);
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      message: `Updated ${results.length} vehicles`,
      vehicles: results,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Error bulk updating vehicles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}