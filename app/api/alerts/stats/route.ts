import { db } from "@/db";
import { alerts, appUsers } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq } from 'drizzle-orm';

// app/api/alerts/stats/route.ts
export async function GET() {
    try {
      const { userId } = await auth();
      
      if (!userId) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
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
  
      // Obtener estadísticas
      const allAlerts = await db
        .select()
        .from(alerts)
        .where(eq(alerts.tenant_id, tenantId));
  
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const stats = {
        critical: allAlerts.filter(a => a.severity === 'high' && a.status !== 'resolved').length,
        medium: allAlerts.filter(a => a.severity === 'medium' && a.status !== 'resolved').length,
        pending: allAlerts.filter(a => a.status === 'pending').length,
        resolvedToday: allAlerts.filter(a => 
          a.status === 'resolved' && 
          new Date(a.updated_at) >= today
        ).length,
      };
  
      return NextResponse.json({ stats });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
  }