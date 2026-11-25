const express = require('express');
const router = express.Router();
const db = require('../database/dbHelper');
const adminOnly = require('../middleware/admin');

router.use(adminOnly);

router.get('/users', async (req, res, next) => {
  try {
    const users = await db.all('SELECT id, name, email, role, wallet_balance, is_verified, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 500');
    res.json({ count: users.length, users });
  } catch (e) { next(e); }
});

// Change a user's role or switch the account on/off
router.patch('/users/:id', async (req, res, next) => {
  try {
    const { role, is_active } = req.body || {};
    if (String(req.params.id) === String(req.user.userId)) return res.status(400).json({ error: 'You cannot change your own account here' });
    if (role !== undefined && !['admin', 'entrepreneur', 'investor'].includes(role)) return res.status(400).json({ error: 'Unknown role' });
    const user = await db.get('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (role !== undefined) await db.run('UPDATE users SET role = ? WHERE id = ?', [role, user.id]);
    if (is_active !== undefined) await db.run('UPDATE users SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, user.id]);
    res.json({ user: await db.get('SELECT id, name, email, role, is_active FROM users WHERE id = ?', [user.id]) });
  } catch (e) { next(e); }
});

router.get('/pledges', async (req, res, next) => {
  try {
    const pledges = await db.all(`SELECT p.*, u.name AS user_name, u.email AS user_email, c.title AS campaign_title
      FROM pledges p LEFT JOIN users u ON p.user_id = u.id LEFT JOIN campaigns c ON p.campaign_id = c.id ORDER BY p.timestamp DESC LIMIT 500`);
    res.json({ count: pledges.length, pledges });
  } catch (e) { next(e); }
});

router.get('/campaigns', async (req, res, next) => {
  try {
    const campaigns = await db.all(`SELECT c.*, u.name AS creator_name FROM campaigns c LEFT JOIN users u ON u.id = c.creator_id ORDER BY c.created_at DESC LIMIT 500`);
    res.json({ count: campaigns.length, campaigns });
  } catch (e) { next(e); }
});

// Take a campaign down (status only; refunds follow the normal deadline process)
router.patch('/campaigns/:id', async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!['active', 'cancelled'].includes(status)) return res.status(400).json({ error: 'Status must be active or cancelled' });
    await db.run('UPDATE campaigns SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ campaign: await db.get('SELECT id, title, status FROM campaigns WHERE id = ?', [req.params.id]) });
  } catch (e) { next(e); }
});

router.get('/stats', async (req, res, next) => {
  try {
    res.json(await db.get(`SELECT (SELECT COUNT(*) FROM users) AS total_users, (SELECT COUNT(*) FROM campaigns) AS total_campaigns,
      (SELECT COUNT(*) FROM pledges) AS total_pledges, (SELECT COALESCE(SUM(wallet_balance), 0) FROM users) AS total_wallet_balance`));
  } catch (e) { next(e); }
});

module.exports = router;
