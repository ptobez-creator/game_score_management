const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ msg: 'Authorization header is missing. Access denied.' });
    }

    const token = authHeader.split(' ')[1]; // Extract the token part from 'Bearer <token>'
    if (!token) {
      return res.status(401).json({ msg: 'Token is missing. Access denied.' });
    }

    // Verify and decode the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('JWT verification failed:', err.message);
        return res.status(403).json({ msg: 'Invalid or expired token. Access denied.' });
      }

      // If decoded token is malformed or missing expected fields, return 403
      if (!decoded || !decoded.user || !decoded.user.id) {
        return res.status(403).json({ msg: 'Malformed token payload. Access denied.' });
      }

      // Attach user info to request object (this will be available in subsequent route handlers)
      req.user = decoded.user;

      // Proceed to the next middleware or route handler
      next();
    });
  } catch (error) {
    console.error('Error in authMiddleware:', error.message);
    res.status(500).json({ msg: 'Server error. Please try again later.' });
  }
};

module.exports = authMiddleware;