// Simple data ingestion endpoint for n8n
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Handle vehicle data from n8n
    if (body.type === 'vehicle_data') {
      await db.insert(vehicleStats).values({
        tenant_id: body.tenant_id,
        vehicle_id: body.vehicle_id,
        timestamp: new Date(body.timestamp),
        rpm: body.rpm,
        speed: body.speed,
        engine_temp: body.engine_temp,
        battery_voltage: body.battery_voltage?.toString(),
        brake_status: body.brake_status,
        dtc_codes: body.dtc_codes,
      });
    }
    
    // Handle alerts from n8n (with OpenAI diagnosis)
    if (body.type === 'alert') {
      await db.insert(alerts).values({
        tenant_id: body.tenant_id,
        vehicle_id: body.vehicle_id,
        timestamp: new Date(body.timestamp),
        severity: body.severity,
        alert_type: body.alert_type,
        description: body.description,
        recomendation: body.recommendation, // From OpenAI
        status: 'pending',
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Ingest error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}