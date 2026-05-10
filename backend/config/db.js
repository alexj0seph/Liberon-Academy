const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const dbConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
  user: process.env.MYSQLUSER || process.env.DB_USER || "root",
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "",
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || "liberon_academy",
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log("[DB] MySQL config loaded:", {
  host: dbConfig.host,
  database: dbConfig.database,
  port: dbConfig.port,
  usingRailwayVars: Boolean(process.env.MYSQLHOST && process.env.MYSQLUSER && process.env.MYSQLDATABASE)
});
console.log("[DB] MYSQLHOST:", process.env.MYSQLHOST);
console.log("[DB] MYSQLUSER:", process.env.MYSQLUSER);
console.log("[DB] MYSQLDATABASE:", process.env.MYSQLDATABASE);

const pool = mysql.createPool({
  ...dbConfig
});

module.exports = pool;
