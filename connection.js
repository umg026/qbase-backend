

// Load environment variables from .env file
require('dotenv').config();

const mysql = require("mysql2/promise");

const MySqlPool = mysql.createPool({
    host: process.env.DB_HOST,         // Database host
    user: process.env.DB_USER,         // Database user
    password: process.env.DB_PASSWORD, // Database password
    database: process.env.DB_NAME      // Database name
});

module.exports = MySqlPool;
