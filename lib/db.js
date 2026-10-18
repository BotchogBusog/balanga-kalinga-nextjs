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
  // Earlier versions used one shared fallback address for every counselor.
  // Give each known counselor a unique sign-in address, and use a unique
  // generated address for any additional counselor records.
  await p.query(`UPDATE counselors SET email=CASE
    WHEN LOWER(name) LIKE '%angela%mendoza%' THEN 'angela.mendoza@balanga.edu.ph'
    WHEN LOWER(name) LIKE '%ramon%torres%' THEN 'ramon.torres@balanga.edu.ph'
    WHEN LOWER(name) LIKE '%liza%fernandez%' THEN 'liza.fernandez@balanga.edu.ph'
    WHEN LOWER(name) LIKE '%marco%reyes%' THEN 'marco.reyes@balanga.edu.ph'
    ELSE CONCAT('counselor-', id, '@balanga.edu.ph')
  END WHERE email IS NULL OR email='' OR email='counseling@balanga.edu.ph'`);
  await p.query("UPDATE counselors SET phone=COALESCE(NULLIF(phone, ''), '+63 47 237 0000')");
  await p.query(`UPDATE counselors c
    JOIN counselors earlier ON c.email=earlier.email AND c.id>earlier.id
    SET c.email=CONCAT('counselor-', c.id, '@balanga.edu.ph')`);
  await p.query(`CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_ref VARCHAR(50) NOT NULL UNIQUE,
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
  // Existing installations receive a reference number without losing their
  // appointment records. New requests always provide one on insert.
  try {
    await p.query("ALTER TABLE appointments ADD COLUMN transaction_ref VARCHAR(50) NULL UNIQUE AFTER id");
  } catch (error) {
    if (error?.code !== "ER_DUP_FIELDNAME") throw error;
  }
  await p.query("UPDATE appointments SET transaction_ref=CONCAT('BK-', DATE_FORMAT(created_at, '%Y%m%d'), '-', LPAD(id, 6, '0')) WHERE transaction_ref IS NULL OR transaction_ref='' ");
  try {
    await p.query("CREATE INDEX appointments_counselor_slot_idx ON appointments (counselor_id, requested_date, requested_time, status)");
  } catch (error) {
    if (error?.code !== "ER_DUP_KEYNAME") throw error;
  }
  for (const statement of [
    "ALTER TABLE users ADD COLUMN counselor_id INT NULL UNIQUE",
  ]) {
    try { await p.query(statement); } catch (error) {
      if (error?.code !== "ER_DUP_FIELDNAME") throw error;
    }
  }
  // Create an account for every configured counselor. They are linked to only
  // their own counselor record; administrators can replace the temporary
  // password after first sign-in.
  // A counselor address must never collide with an existing users row (for
  // example a student who registered the same address). Give any such
  // counselor a unique generated address so seeding cannot fail.
  await p.query(`UPDATE counselors c
    JOIN users u ON u.email = c.email
    SET c.email = CONCAT('counselor-', c.id, '@balanga.edu.ph')
    WHERE COALESCE(u.counselor_id, 0) <> c.id`);
  await p.query(`UPDATE counselors c
    JOIN counselors earlier ON c.email=earlier.email AND c.id>earlier.id
    SET c.email=CONCAT('counselor-', c.id, '@balanga.edu.ph')`);
  await p.query(`INSERT IGNORE INTO users (name,email,student_id,password_hash,role,counselor_id)
    SELECT c.name, c.email, NULL, ?, 'counselor', c.id
    FROM counselors c
    WHERE c.email IS NOT NULL AND c.email <> ''
      AND NOT EXISTS (SELECT 1 FROM users u WHERE u.counselor_id = c.id)
      AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = c.email)`, ["$2a$10$DlslPjJsFEFw0jvjRfctK.vNQePHHpoPvt4lm13YgxJlv9IS.0K1i"]);

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
