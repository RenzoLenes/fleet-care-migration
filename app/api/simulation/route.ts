// app/api/simulation/route.ts
import { Tenant } from '@/app/(routes)/dashboard/_components/dashboard-view';
import { config } from 'dotenv';
import { NextRequest, NextResponse } from 'next/server';
config({ path: '.env' });

interface SimulationRequest {
    status: 'activado' | 'desactivado';
    sensor_count?: number;
    tenant: Tenant;
}

const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_SECRET_WEBHOOK_SIMULATION_URL;
const VALID_USERNAME = process.env.NEXT_PUBLIC_WEBHOOK_USERNAME || '';
const VALID_PASSWORD = process.env.NEXT_PUBLIC_WEBHOOK_PASSWORD || '';

// Crear las credenciales de Basic Auth desde las variables de entorno
const createBasicAuthHeader = (): string => {
    if (!VALID_USERNAME || !VALID_PASSWORD) {
        throw new Error('Credenciales de autenticación no configuradas en el servidor');
    }
    const credentials = btoa(`${VALID_USERNAME}:${VALID_PASSWORD}`);
    return `Basic ${credentials}`;
};

export async function POST(request: NextRequest) {
    try {
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
            tenant: body.tenant || null
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

