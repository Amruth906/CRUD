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

app.use("/api/customers", customerRouter);
app.use("/api/addresses", addressRouter);

app.use(notFoundHandler);
app.use(errorHandler(logger));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});

module.exports = app;
