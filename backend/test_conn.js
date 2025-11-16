import pkg from "pg";

const { Client } = pkg;

const client = new Client({
  user: "postgres",
  host: "db.xwxxavmgwmzmhudyzszm.supabase.co",
  database: "postgres",
  password: "Bayunca*832",
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log("🟢 Conectado a Supabase correctamente!");
    return client.query("SELECT NOW()");
  })
  .then(res => {
    console.log("Resultado:", res.rows);
  })
  .catch(err => {
    console.error("❌ Error conexión:", err.message);
  })
  .finally(() => client.end());
