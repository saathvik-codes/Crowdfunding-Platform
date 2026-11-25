const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../database/dbHelper');
const auth = require('../middleware/auth');

const PUBLIC = 'id, name, email, role, phone, location, bio, profile_image, wallet_balance, created_at';
const canAccess = (req) => req.user.role === 'admin' || String(req.user.userId) === String(req.params.id);


// Public creator profile: name, bio and their campaigns. No email, wallet or other private fields.
router.get('/:id/public', async (req, res, next) => {
  try {
    const user = await db.get('SELECT id, name, bio, location, role, created_at FROM users WHERE id = ? AND is_active = 1', [req.params.id]);
    if (!user) return res.status(404).json({ error: 'Creator not found' });
    const campaigns = await db.all(`SELECT c.id, c.title, c.summary, c.description, c.category, c.image_url, c.goal_amount, c.current_funds, c.deadline, c.status, c.created_at,
        (SELECT COUNT(DISTINCT p.user_id) FROM pledges p WHERE p.campaign_id = c.id) AS backers_count
      FROM campaigns c WHERE c.creator_id = ? AND c.status IN ('active', 'successful') ORDER BY c.created_at DESC`, [user.id]);
    const now = Date.now();
    const shaped = campaigns.map((c) => ({
      ...c, total_pledged: Number(c.current_funds || 0), progress_percentage: Math.min(100, (Number(c.current_funds || 0) / Number(c.goal_amount || 1)) * 100).toFixed(2),
      is_expired: new Date(c.deadline) < now, days_remaining: Math.max(0, Math.ceil((new Date(c.deadline) - now) / 86400000)),
    }));
    res.json({
      user,
      campaigns: shaped,
      stats: { campaigns: shaped.length, raised: shaped.reduce((t, c) => t + Number(c.current_funds || 0), 0), backers: shaped.reduce((t, c) => t + Number(c.backers_count || 0), 0) },
    });
  } catch (e) { next(e); }
});

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
