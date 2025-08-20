const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;
  
  // Check if the request has an authorization header and it starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (e.g., "Bearer eyJhbGciOi...")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using your secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user's ID to the request object for later use
      req.user = decoded.user;
      
      next(); // Move on to the next middleware or the route handler
    } catch (error) {
      res.status(401).json({ msg: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ msg: 'Not authorized, no token' });
  }
};

module.exports = { protect };