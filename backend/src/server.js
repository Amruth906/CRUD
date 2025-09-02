const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { createLogger, transports, format } = require("winston");

const { errorHandler, notFoundHandler } = require("./utils/errors");
const db = require("./utils/db");

const customerRouter = require("./routes/customers");
const addressRouter = require("./routes/addresses");

const app = express();

// Logging
const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console()],
});

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/health/db", (req, res) => {
  try {
    // Check if customers table exists
    const tableCheck = db
      .prepare(
        `
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('customers', 'addresses')
    `
      )
      .all();

    const tables = tableCheck.map((row) => row.name);
    const hasCustomers = tables.includes("customers");
    const hasAddresses = tables.includes("addresses");

    if (hasCustomers && hasAddresses) {
      res.json({
        status: "healthy",
        tables: tables,
        message: "Database tables are ready",
      });
    } else {
      res.status(500).json({
        status: "unhealthy",
        tables: tables,
        message: "Missing required tables",
        required: ["customers", "addresses"],
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Database health check failed",
      error: error.message,
    });
  }
});

app.use("/api/customers", customerRouter);
app.use("/api/addresses", addressRouter);

app.use(notFoundHandler);
app.use(errorHandler(logger));

const PORT = process.env.PORT || 4000;

// Initialize database before starting server
async function startServer() {
  try {
    // Run migrations to ensure tables exist
    logger.info("Running database migrations...");
    require("./scripts/migrate");

    // Run seed data
    logger.info("Running database seed...");
    require("./scripts/seed");

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
