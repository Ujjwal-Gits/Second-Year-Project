// This file handles the PostgreSQL database connection using Sequelize ORM.
// It also auto-creates the database if it doesn't exist yet, so you don't have to do it manually.

const { Sequelize } = require("sequelize");
const { Client } = require("pg");
require("dotenv").config();

// Connect to the default 'postgres' DB first, then create our app DB if missing
const createDatabaseIfNotExists = async () => {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: "postgres",
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname='${process.env.DB_NAME}'`,
    );
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
      console.log(`Database ${process.env.DB_NAME} Created Successfully.`);
    } else {
      console.log(`Database ${process.env.DB_NAME} Already Exists.`);
    }
  } catch (err) {
    console.error("Error creating database:", err.message);
  } finally {
    await client.end();
  }
};

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

const connectDB = async () => {
  try {
    await createDatabaseIfNotExists();
    await sequelize.authenticate();
    console.log("PostgreSQL Connected...");
  } catch (err) {
    console.error("Database Connection Error:", err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
