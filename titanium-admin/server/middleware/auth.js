const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Member = require('../models/Member');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized, please log in' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    
    // Check if token belongs to an Admin
    let user = await Admin.findById(decoded.id);
    if (user) {
      req.user = user;
      req.admin = user;
      req.user.role = 'admin';
      return next();
    }
    
    // Check if token belongs to a Member
    user = await Member.findById(decoded.id);
    if (user) {
      req.user = user;
      req.member = user;
      req.user.role = 'member';
      return next();
    }

    return res.status(401).json({ success: false, message: 'User not found' });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Role '${req.user ? req.user.role : 'guest'}' is not authorized to access this resource` });
    }
    next();
  };
};
