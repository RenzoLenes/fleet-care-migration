import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env' });


export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        realtime: {
            heartbeatIntervalMs: 30000,
            params: {
                eventsPerSecond: 10,
            },
        }
    }
);


export interface RealtimeAlert {
    id: string;
    tenant_id: string;
    vehicle_id: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high';
    alert_type: string;
    description: string;
    recommendation: string;
    status: 'pending' | 'acknowledged' | 'in_progress' | 'resolved';
    created_at: string;
    updated_at: string;
  }