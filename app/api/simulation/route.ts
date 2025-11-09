// app/api/simulation/route.ts
import { Tenant } from '@/app/(routes)/dashboard/_components/dashboard-view';
import { DataSimulationConfig } from '@/lib/types';
import { simulationManager } from '@/lib/simulation-manager';
import { config } from 'dotenv';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { appUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
config({ path: '.env' });

interface SimulationRequest {
    status: 'activado' | 'desactivado';
    sensor_count?: number;
    tenant: Tenant;
    config: DataSimulationConfig;
}

// In-memory storage for simulation state (in production, this should be in a database)
const simulationStates: Map<string, {
  active: boolean;
  activeSensors: number;
  totalSensors: number;
  connectionProgress: number;
  isConnecting: boolean;
  dataFlow: boolean;
  lastUpdate: string;
}> = new Map();

// GET endpoint to retrieve current simulation state
export async function GET() {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // Get tenant ID for the user
        const userTenant = await db
            .select({ tenant_id: appUsers.tenant_id })
            .from(appUsers)
            .where(eq(appUsers.id, userId))
            .limit(1);

        if (userTenant.length === 0) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        const tenantId = userTenant[0].tenant_id;
        
        // Get simulation state for this tenant
        const state = simulationStates.get(tenantId) || {
            active: false,
            activeSensors: 0,
            totalSensors: 127,
            connectionProgress: 0,
            isConnecting: false,
            dataFlow: false,
            lastUpdate: new Date().toISOString()
        };

        return NextResponse.json({
            success: true,
            state
        });

    } catch (error) {
        console.error('Error en GET simulation:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Error interno del servidor'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // Get tenant ID for the user
        const userTenant = await db
            .select({ tenant_id: appUsers.tenant_id })
            .from(appUsers)
            .where(eq(appUsers.id, userId))
            .limit(1);

        if (userTenant.length === 0) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        const tenantId = userTenant[0].tenant_id;

        // Obtener los datos del body
        const body: SimulationRequest = await request.json();

        if (!body.status || !['activado', 'desactivado'].includes(body.status)) {
            return NextResponse.json(
                { error: 'Status debe ser "activado" o "desactivado"' },
                { status: 400 }
            );
        }

        const isActive = body.status === 'activado';
        const timestamp = new Date().toISOString();

        // Use internal simulation manager instead of n8n
        if (isActive) {
            // Start internal simulation
            await simulationManager.startSimulation(tenantId, body.config);

            // Update simulation state
            simulationStates.set(tenantId, {
                active: true,
                activeSensors: body.sensor_count || 98,
                totalSensors: 127,
                connectionProgress: 100,
                isConnecting: false,
                dataFlow: true,
                lastUpdate: timestamp
            });

            console.log(`[API] Started internal simulation for tenant ${tenantId} with ${body.config.vehicles.length} vehicles`);
        } else {
            // Stop internal simulation
            await simulationManager.stopSimulation(tenantId);

            // Update simulation state
            simulationStates.set(tenantId, {
                active: false,
                activeSensors: 0,
                totalSensors: 127,
                connectionProgress: 0,
                isConnecting: false,
                dataFlow: false,
                lastUpdate: timestamp
            });

            console.log(`[API] Stopped internal simulation for tenant ${tenantId}`);
        }

        return NextResponse.json({
            success: true,
            message: `Simulación ${body.status} correctamente usando simulador interno`,
            data: {
                status: body.status,
                timestamp: timestamp,
                sensor_count: isActive ? (body.sensor_count || 98) : 0,
                tenant: body.tenant,
                vehicles: body.config.vehicles,
                interval: body.config.interval,
                duration: body.config.duration,
                simulation_type: 'internal'
            }
        });

    } catch (error) {
        console.error('Error en API simulation:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Error interno del servidor'
        }, {
            status: 500
        });
    }
}

