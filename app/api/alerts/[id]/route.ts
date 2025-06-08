import { db } from "@/db";
import { alerts, appUsers } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { and, eq } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ idAlert: string }> }
) {
  try {
    const { userId } = await auth();
    const { idAlert } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

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

    // Actualizar alerta
    const updatedAlert = await db
      .update(alerts)
      .set({
        status,
        updated_at: new Date()
      })
      .where(and(
        eq(alerts.id, idAlert),
        eq(alerts.tenant_id, tenantId)
      ))
      .returning();

    if (updatedAlert.length === 0) {
      return NextResponse.json({ error: 'Alerta no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ alert: updatedAlert[0] });
  } catch (error) {
    console.error('Error actualizando alerta:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}