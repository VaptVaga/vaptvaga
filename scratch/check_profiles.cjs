const { Client } = require('pg');

async function check() {
  const connectionString = 'postgresql://postgres:1374261962008gabriel1962008137426@db.piwbunhhahiebevkgdlv.supabase.co:5432/postgres';
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to Supabase DB');
    
    const res = await client.query("SELECT id, name, role FROM profiles ORDER BY created_at DESC LIMIT 5;");
    console.log('Recent profiles:', res.rows);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

check();
