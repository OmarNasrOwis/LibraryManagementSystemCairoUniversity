const { Client } = require("pg");
require("dotenv").config();
const pool = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
});


pool.connect().then(() => console.log("connected"));

module.exports = pool;
