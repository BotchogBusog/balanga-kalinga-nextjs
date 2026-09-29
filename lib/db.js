// Port of includes/config.php + includes/db_init.php
// Uses the SAME MySQL database as the PHP app (default: balanga_kalinga_php).
import mysql from "mysql2/promise";

// Vercel must receive DB_HOST from its environment. Keep the configured
// Aiven host as a production fallback so a missing Vercel variable cannot
// accidentally make the app try to connect to Vercel's own localhost.
const DEFAULT_AIVEN_HOST = "mysql-ae2707-shopeepayyy2-6fad.b.aivencloud.com";
const DB_HOST = process.env.DB_HOST || (process.env.NODE_ENV === "production" ? DEFAULT_AIVEN_HOST : "127.0.0.1");
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || (process.env.NODE_ENV === "production" ? "avnadmin" : "root");
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || (process.env.NODE_ENV === "production" ? "defaultdb" : "balanga_kalinga_php");
const DB_SSL = process.env.DB_SSL
  ? process.env.DB_SSL === "true" || process.env.DB_SSL === "1"
  : process.env.NODE_ENV === "production";
const DB_SSL_CA = process.env.DB_SSL_CA || "";
// Managed MySQL services usually do not allow CREATE DATABASE. Local
// development keeps the old auto-create behavior; production connects to
// the database directly and only creates missing tables.
const DB_AUTO_CREATE = process.env.DB_AUTO_CREATE
  ? process.env.DB_AUTO_CREATE === "true" || process.env.DB_AUTO_CREATE === "1"
  : process.env.NODE_ENV !== "production";

const connectionOptions = {
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  charset: "utf8mb4",
  ...(DB_SSL ? {
    // Aiven deployments can provide DB_SSL_CA for certificate verification.
    // If only DB_SSL=true is configured, allow the managed provider's
    // certificate so Vercel can still establish the connection.
    ssl: DB_SSL_CA
      ? { ca: DB_SSL_CA.replace(/\\n/g, "\n"), rejectUnauthorized: true }
      : { rejectUnauthorized: false },
  } : {}),
};

let pool = null;
let initDone = false;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...connectionOptions,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 5,
      dateStrings: true,
    });
  }
  return pool;
}

// Create DB + tables if missing (mirrors bk_init_db, never drops).
export async function initDb() {
  if (initDone) return getPool();
  if (DB_AUTO_CREATE) {
    const bootstrap = await mysql.createConnection(connectionOptions);
    await bootstrap.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await bootstrap.end();
  }

  const p = getPool();
  await p.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    student_id VARCHAR(40) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    course VARCHAR(120) DEFAULT '',
    year_level VARCHAR(40) DEFAULT '',
    school VARCHAR(120) DEFAULT '',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await p.query(`CREATE TABLE IF NOT EXISTS wellness_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    answers TEXT NOT NULL,
    overall_level VARCHAR(40) NOT NULL,
    summary TEXT NOT NULL,
    suggested_actions TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await p.query(`CREATE TABLE IF NOT EXISTS moods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mood VARCHAR(30) NOT NULL,
    note TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await p.query(`CREATE TABLE IF NOT EXISTS journal_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) DEFAULT '',
    content TEXT NOT NULL,
    mood VARCHAR(30) DEFAULT 'okay',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await p.query(`CREATE TABLE IF NOT EXISTS ai_conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) DEFAULT 'Talk with Kalinga AI',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await p.query(`CREATE TABLE IF NOT EXISTS ai_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await p.query(`CREATE TABLE IF NOT EXISTS self_care_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(60) NOT NULL,
    title VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT NOT NULL,
    duration_min INT DEFAULT 5
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await p.query(`CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES self_care_activities(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await p.query(`CREATE TABLE IF NOT EXISTS counselors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    specialization VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    schedule TEXT NOT NULL,
    is_available TINYINT(1) NOT NULL DEFAULT 1
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  // Contact fields were added after the original schema. Keep existing
  // installations working without requiring a manual migration.
  for (const statement of [
    "ALTER TABLE counselors ADD COLUMN email VARCHAR(190) DEFAULT NULL",
    "ALTER TABLE counselors ADD COLUMN phone VARCHAR(40) DEFAULT NULL",
  ]) {
    try { await p.query(statement); } catch (error) {
      if (error?.code !== "ER_DUP_FIELDNAME") throw error;
    }
  }
  await p.query("UPDATE counselors SET email=COALESCE(NULLIF(email, ''), 'counseling@balanga.edu.ph'), phone=COALESCE(NULLIF(phone, ''), '+63 47 237 0000')");
  await p.query(`CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    counselor_id INT NOT NULL,
    requested_date DATE NOT NULL,
    requested_time VARCHAR(20) NOT NULL,
    method VARCHAR(30) DEFAULT 'In-person',
    notes TEXT,
    status VARCHAR(30) DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (counselor_id) REFERENCES counselors(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await p.query(`CREATE TABLE IF NOT EXISTS emergency_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(40) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(30) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  initDone = true;
  return p;
}

export async function query(sql, params = []) {
  try {
    const p = await initDb();
    const [rows] = await p.execute(sql, params);
    return rows;
  } catch (error) {
    // Never log credentials or query parameters. These details are enough to
    // diagnose Vercel/Aiven connection and schema errors from Function Logs.
    console.error("[DB] query failed", {
      code: error?.code,
      errno: error?.errno,
      message: error?.message,
      sqlState: error?.sqlState,
    });
    throw error;
  }
}

export function timeAgo(datetime) {
  const t = new Date(datetime).getTime();
  const diff = Math.floor((Date.now() - t) / 1000);
  if (Number.isNaN(diff)) return "";
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(datetime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
