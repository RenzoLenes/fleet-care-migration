// app/api/alerts/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/db';
import { alerts, appUsers } from '@/db/schema';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const severityFilter = searchParams.get('severity');
    const statusFilter = searchParams.get('status');

    // Obtener tenant del usuario
    const userTenant = await db
      .select({ tenant_id: appUsers.tenant_id })
      .from(appUsers)
      .where(eq(appUsers.id, userId))
      .limit(1);

    if (userTenant.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const tenantId = userTenant[0].tenant_id;

    // Construir filtros
    const whereConditions = [eq(alerts.tenant_id, tenantId)];
    
    if (severityFilter && severityFilter !== 'all') {
      whereConditions.push(eq(alerts.severity, severityFilter));
    }
    
    if (statusFilter && statusFilter !== 'all') {
      whereConditions.push(eq(alerts.status, statusFilter));
    }

    // Obtener alertas
    const alertsData = await db
      .select()
      .from(alerts)
      .where(and(...whereConditions))
      .orderBy(desc(alerts.created_at))
      .limit(100);

    return NextResponse.json({ alerts: alertsData });
  } catch (error) {
    console.error('Error obteniendo alertas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}