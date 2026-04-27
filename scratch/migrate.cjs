const { Client } = require('pg');

async function migrate() {
  const connectionString = 'postgresql://postgres:1374261962008gabriel1962008137426@db.piwbunhhahiebevkgdlv.supabase.co:5432/postgres';
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to Supabase DB');
    
    const queries = [
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experiencias jsonb;",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cpf text;",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS data_nascimento text;",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS titulo_profissional text;",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram text;"
    ];

    for (const q of queries) {
      console.log('Running:', q);
      await client.query(q);
    }
    console.log('Migration successful!');
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    await client.end();
  }
}

migrate();
