import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Create a shared connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 10,
  idleTimeoutMillis: 3000000,
  connectionTimeoutMillis: 10000,
});

// Simple connection test on startup
pool
  .connect()
  .then((client) => {
    console.log("✅ Connected to PostgreSQL");
    client.release();
  })
  .catch((err) => {
    console.error("❌ DB connection error:", err.message);
  });

// Handle idle disconnections gracefully
pool.on("error", (err) => {
  console.error("⚠️ Unexpected DB error, retrying:", err.message);
  // optional: reinitialize pool or reconnect logic here
});

export default pool;
