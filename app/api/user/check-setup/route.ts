// app/api/user/check-setup/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { appUsers, } from '@/db/schema';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // Verificar si el usuario ya existe en app_users
        const appUser = await db.select().from(appUsers).where(eq(appUsers.id, userId)).limit(1);

        const isSetupComplete = appUser.length > 0;

        return NextResponse.json({ isSetupComplete });
    } catch (error) {
        console.error('Error verificando setup:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
