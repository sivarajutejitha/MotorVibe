/**
 * JWT Authentication Middleware
 * Validates bearer token and injects verified user identity into request context.
 * Course Outcome: CO-4 (Node.js and Express)
 */
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Missing or malformed authorization token.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'motorvibe_secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication session. Please log in again.',
    });
  }
}

/**
 * Optional authentication middleware: attaches user if token provided, but doesn't block
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'motorvibe_secret');
      req.user = decoded;
    } catch (e) {
      // Ignore invalid token in optional auth
    }
  }
  next();
}

module.exports = {
  requireAuth,
  optionalAuth,
};
