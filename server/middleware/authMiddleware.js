const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      const token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token and attach to request object
      req.user = await User.findById(decoded.user.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ msg: 'The user belonging to this token does no longer exist.' });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ msg: 'Not authorized, token failed' });
    }
  }
  return res.status(401).json({ msg: 'Not authorized, no token' });
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };