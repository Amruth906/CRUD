const { ZodError } = require("zod");

function notFoundHandler(req, res, next) {
  res.status(404).json({ error: "Not Found", message: "Resource not found" });
}

function errorHandler(logger) {
  return (err, req, res, next) => {
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ error: "ValidationError", details: err.errors });
    }
    const status = err.status || 500;
    logger.error({ message: err.message, stack: err.stack, status });
    res
      .status(status)
      .json({ error: err.name || "Error", message: err.message });
  };
}

module.exports = { notFoundHandler, errorHandler };
