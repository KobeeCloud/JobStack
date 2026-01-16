#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load env vars
const envPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.+)$/);
  if (match) {
    const [, key, value] = match;
    process.env[key.trim()] = value.trim();
  }
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function runMigration() {
  const sql = readFileSync(join(process.cwd(), 'supabase/quick-apply-schema.sql'), 'utf-8');

  console.log('Running Quick Apply schema migration...');

  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('❌ Migration failed:', error);

    // Try executing statements one by one
    console.log('\nTrying to execute statements individually...');
    const statements = sql.split(';').filter(s => s.trim());

    for (const statement of statements) {
      if (!statement.trim()) continue;

      const { error: stmtError } = await supabase.rpc('exec_sql', {
        sql_query: statement.trim() + ';'
      });

      if (stmtError) {
        console.log('⚠️  Statement failed:', statement.substring(0, 50) + '...');
        console.log('   Error:', stmtError.message);
      } else {
        console.log('✅ Executed:', statement.substring(0, 50) + '...');
      }
    }
  } else {
    console.log('✅ Migration completed successfully!');
  }
}

runMigration();
