import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Graceful error handling
pool.on("error", (err) => {
  console.error("Unexpected PG idle client error", err);
});

// Optional: test and reconnect
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL");
    client.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
}

testConnection();

export default pool;
