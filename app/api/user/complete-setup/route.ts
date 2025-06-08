import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { appUsers, tenants } from '@/db/schema';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { organizationName, phoneNumber } = await request.json();

    if (!organizationName || !phoneNumber) {
      return NextResponse.json({ 
        error: 'Faltan datos requeridos' 
      }, { status: 400 });
    }

    // Verificar si el usuario ya existe en app_users
    const existingAppUser = await db.select().from(appUsers).where(eq(appUsers.id, userId)).limit(1);

    if (existingAppUser.length > 0) {
      return NextResponse.json({ 
        error: 'El usuario ya completó el setup' 
      }, { status: 400 });
    }

    // Crear el tenant primero
    const [newTenant] = await db.insert(tenants).values({
      name: organizationName,
      email: user.emailAddresses[0]?.emailAddress || '',
      phone_number: phoneNumber,
    }).returning();

    // Crear el app_user vinculado al tenant
    await db.insert(appUsers).values({
      id: userId,
      tenant_id: newTenant.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error completando setup:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}