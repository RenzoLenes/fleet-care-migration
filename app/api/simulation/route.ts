// app/api/simulation/route.ts
import { Tenant } from '@/app/(routes)/dashboard/_components/dashboard-view';
import { DataSimulationConfig } from '@/lib/types';
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

const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_SECRET_WEBHOOK_SIMULATION_URL;
const VALID_USERNAME = process.env.NEXT_PUBLIC_WEBHOOK_USERNAME || '';
const VALID_PASSWORD = process.env.NEXT_PUBLIC_WEBHOOK_PASSWORD || '';

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

// Crear las credenciales de Basic Auth desde las variables de entorno
const createBasicAuthHeader = (): string => {
    if (!VALID_USERNAME || !VALID_PASSWORD) {
        throw new Error('Credenciales de autenticación no configuradas en el servidor');
    }
    const credentials = btoa(`${VALID_USERNAME}:${VALID_PASSWORD}`);
    return `Basic ${credentials}`;
};

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

        // Preparar el payload para n8n
        const payload = {
            status: body.status,
            timestamp: new Date().toISOString(),
            sensor_count: body.status === 'activado' ? (body.sensor_count || 0) : 0,
            tenant: body.tenant || null,
            config: {
                vehicles: body.config.vehicles,
                interval: body.config.interval,
                duration: body.config.duration
            }
        };

        // Crear el header de autorización
        const authHeader = createBasicAuthHeader();

        // Hacer la petición al webhook de n8n con las credenciales del servidor
        const n8nResponse = await fetch(N8N_WEBHOOK_URL!, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify(payload)
        });

        if (!n8nResponse.ok) {
            throw new Error(`Error n8n: ${n8nResponse.status} ${n8nResponse.statusText}`);
        }

        const n8nResult = await n8nResponse.json().catch(() => ({}));

        // Update simulation state
        const isActive = body.status === 'activado';
        simulationStates.set(tenantId, {
            active: isActive,
            activeSensors: isActive ? (body.sensor_count || 98) : 0,
            totalSensors: 127,
            connectionProgress: isActive ? 100 : 0,
            isConnecting: false,
            dataFlow: isActive,
            lastUpdate: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            message: `Simulación ${body.status} correctamente`,
            data: {
                status: payload.status,
                timestamp: payload.timestamp,
                sensor_count: payload.sensor_count,
                tenant: payload.tenant,
                n8n_response: n8nResult
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

