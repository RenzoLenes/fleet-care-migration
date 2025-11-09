// Script to apply migration to Supabase
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';

config({ path: '.env' });

async function applyMigration() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error('DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const client = postgres(DATABASE_URL, { max: 1 });
  const db = drizzle(client);

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/0001_add_gps_fuel_to_vehicle_stats.sql');
    const migration = fs.readFileSync(migrationPath, 'utf-8');

    console.log('Applying migration...');

    // Split migration by statement breakpoints
    const statements = migration
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await client.unsafe(statement);
      }
    }

    console.log('✅ Migration applied successfully!');
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
