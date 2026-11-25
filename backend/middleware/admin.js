const auth = require('./auth');
const db = require('../database/dbHelper');

// Signed-in AND currently an admin in the database (a stale token cannot keep admin rights)
module.exports = [
  auth,
  async (req, res, next) => {
    try {
      const row = await db.get('SELECT role, is_active FROM users WHERE id = ?', [req.user.userId]);
      if (!row || row.role !== 'admin' || Number(row.is_active) === 0) return res.status(403).json({ error: 'Admin access required' });
      next();
    } catch (e) { next(e); }
  },
];
