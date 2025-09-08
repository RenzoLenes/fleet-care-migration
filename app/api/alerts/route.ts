// app/api/alerts/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq, and, desc, count } from 'drizzle-orm';
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

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

    // Obtener total count
    const totalCountResult = await db
      .select({ count: count() })
      .from(alerts)
      .where(and(...whereConditions));
      
    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const offset = (page - 1) * limit;

    // Obtener alertas con paginación
    const alertsData = await db
      .select()
      .from(alerts)
      .where(and(...whereConditions))
      .orderBy(desc(alerts.created_at))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ 
      alerts: alertsData,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error obteniendo alertas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { alertId, status } = await request.json();

    if (!alertId || !status) {
      return NextResponse.json({ error: 'ID de alerta y estado requeridos' }, { status: 400 });
    }

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

    // Actualizar la alerta
    const updatedAlert = await db
      .update(alerts)
      .set({ 
        status, 
        updated_at: new Date() 
      })
      .where(and(
        eq(alerts.id, alertId),
        eq(alerts.tenant_id, tenantId)
      ))
      .returning();

    if (updatedAlert.length === 0) {
      return NextResponse.json({ error: 'Alerta no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      alert: updatedAlert[0],
      message: 'Alerta actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando alerta:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}