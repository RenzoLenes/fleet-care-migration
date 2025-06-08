// index.ts

import { supabase } from "./lib/supabase";

async function main() {
  console.log('👂 Escuchando cambios en Supabase...');

  // Suscribirse a cambios en la tabla "users"
  const channel = supabase.channel('realtime-users');

  channel
    .on(
      'postgres_changes',
      {
        event: '*', // puedes cambiar por 'INSERT' | 'UPDATE' | 'DELETE'
        schema: 'public',
        table: 'users',
      },
      (payload) => {
        console.log('🔔 Cambio detectado en la tabla "users":');
        console.log(JSON.stringify(payload, null, 2));
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Suscripción exitosa.');
      }
    });
}

main();
