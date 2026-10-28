const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Please sign in first.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'development_only_change_me');
    req.user = await User.findById(payload.id).select('-passwordHash');
    if (!req.user) return res.status(401).json({ message: 'Account not found.' });
    next();
  } catch (_err) { return res.status(401).json({ message: 'Invalid or expired token.' }); }
}
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });
  next();
}
module.exports = { requireAuth, requireAdmin };
