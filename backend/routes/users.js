const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../database/dbHelper');
const auth = require('../middleware/auth');

const PUBLIC = 'id, name, email, role, phone, location, bio, profile_image, wallet_balance, created_at';
const canAccess = (req) => req.user.role === 'admin' || String(req.user.userId) === String(req.params.id);

router.get('/:id', auth, async (req, res, next) => {
  try {
    if (!canAccess(req)) return res.status(403).json({ error: 'Not allowed' });
    const user = await db.get(`SELECT ${PUBLIC} FROM users WHERE id = ?`, [req.params.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (e) { next(e); }
});

router.put('/:id', auth, async (req, res, next) => {
  try {
    if (!canAccess(req)) return res.status(403).json({ error: 'Not allowed' });
    const row = await db.get('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'User not found' });
    const { name, phone, location, bio, currentPassword, newPassword } = req.body || {};
    if (newPassword) {
      if (String(newPassword).length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
      if (!(await bcrypt.compare(String(currentPassword || ''), row.password))) return res.status(400).json({ error: 'Current password is incorrect' });
      await db.run('UPDATE users SET password = ? WHERE id = ?', [await bcrypt.hash(String(newPassword), 10), row.id]);
    }
    await db.run('UPDATE users SET name = ?, phone = ?, location = ?, bio = ? WHERE id = ?', [
      (name ?? row.name).toString().trim() || row.name, phone ?? row.phone, location ?? row.location, bio ?? row.bio, row.id,
    ]);
    const user = await db.get(`SELECT ${PUBLIC} FROM users WHERE id = ?`, [row.id]);
    res.json({ user });
  } catch (e) { next(e); }
});

module.exports = router;
