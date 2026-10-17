/**
 * Centralized Express Error Handling Middleware
 * Ensures consistent JSON error responses across all API endpoints.
 * Course Outcome: CO-4 (Node.js and Express)
 */
function errorHandler(err, req, res, next) {
  console.error('[API Exception]:', err.stack || err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An internal server error occurred.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
