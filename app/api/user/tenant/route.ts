import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { appUsers, tenants } from '@/db/schema';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener información del tenant del usuario
    const result = await db
      .select({
        tenant: tenants
      })
      .from(appUsers)
      .innerJoin(tenants, eq(appUsers.tenant_id, tenants.id))
      .where(eq(appUsers.id, userId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ tenant: result[0].tenant });
  } catch (error) {
    console.error('Error obteniendo tenant:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}