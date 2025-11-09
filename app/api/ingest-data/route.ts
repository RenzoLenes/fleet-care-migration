// Data ingestion endpoint for IoT simulator and external sources
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { vehicleStats, alerts } from '@/db/schema';

const WEBHOOK_USERNAME = process.env.NEXT_PUBLIC_WEBHOOK_USERNAME || '';
const WEBHOOK_PASSWORD = process.env.NEXT_PUBLIC_WEBHOOK_PASSWORD || '';

function verifyBasicAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  try {
    const base64Credentials = authHeader.slice(6);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    return username === WEBHOOK_USERNAME && password === WEBHOOK_PASSWORD;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Basic auth check
    if (!verifyBasicAuth(request)) {
      console.error('[Ingest] Unauthorized request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Handle vehicle IoT data
    if (body.type === 'vehicle_data') {
      const vehicleData = {
        tenant_id: body.tenant_id,
        vehicle_id: body.vehicle_id,
        timestamp: new Date(body.timestamp),
        rpm: body.rpm || null,
        speed: body.speed || null,
        engine_temp: body.engine_temp || null,
        battery_voltage: body.battery_voltage ? body.battery_voltage.toString() : null,
        brake_status: body.brake_status || null,
        dtc_codes: body.dtc_codes || null,
        fuel_level: body.fuel_level || null,
        gps_lat: body.gps?.lat ? body.gps.lat.toString() : null,
        gps_lng: body.gps?.lng ? body.gps.lng.toString() : null,
        gps_accuracy: body.gps?.accuracy ? body.gps.accuracy.toString() : null,
      };

      await db.insert(vehicleStats).values(vehicleData);

      console.log(`[Ingest] Vehicle data saved: ${body.vehicle_id}`);
    }

    // Handle alerts
    if (body.type === 'alert') {
      const alertData = {
        tenant_id: body.tenant_id,
        vehicle_id: body.vehicle_id,
        timestamp: new Date(body.timestamp),
        severity: body.severity,
        alert_type: body.alert_type,
        description: body.description,
        recomendation: body.recommendation || 'No recommendation provided',
        status: 'pending' as const,
      };

      await db.insert(alerts).values(alertData);

      console.log(`[Ingest] Alert created: ${body.alert_type} for ${body.vehicle_id}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Ingest] Error processing data:', error);
    if (error instanceof Error) {
      console.error('[Ingest] Error details:', error.message);
    }
    return NextResponse.json({
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}