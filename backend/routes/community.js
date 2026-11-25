const express = require('express');
const router = express.Router();
const db = require('../database/dbHelper');
const auth = require('../middleware/auth');

const ownCampaign = async (campaignId, userId) => {
  const c = await db.get('SELECT creator_id FROM campaigns WHERE id = ?', [campaignId]);
  return c && String(c.creator_id) === String(userId);
};
const COMMENT_SQL = `SELECT c.id, c.body, c.created_at, c.user_id, u.name AS user_name
  FROM campaign_comments c JOIN users u ON u.id = c.user_id`;

// Updates from the creator
router.get('/campaigns/:id/updates', async (req, res, next) => {
  try {
    res.json({ updates: await db.all('SELECT * FROM campaign_updates WHERE campaign_id = ? ORDER BY created_at DESC', [req.params.id]) });
  } catch (e) { next(e); }
});
router.post('/campaigns/:id/updates', auth, async (req, res, next) => {
  try {
    const { title, body } = req.body || {};
    if (!title || !body) return res.status(400).json({ error: 'Title and body are required' });
    if (!(await ownCampaign(req.params.id, req.user.userId))) return res.status(403).json({ error: 'Only the creator can post updates' });
    const r = await db.run('INSERT INTO campaign_updates (campaign_id, title, body) VALUES (?, ?, ?)',
      [req.params.id, String(title).slice(0, 140), String(body).slice(0, 4000)]);
    res.status(201).json({ update: await db.get('SELECT * FROM campaign_updates WHERE id = ?', [r.lastID]) });
  } catch (e) { next(e); }
});

// Comments
router.get('/campaigns/:id/comments', async (req, res, next) => {
  try {
    res.json({ comments: await db.all(`${COMMENT_SQL} WHERE c.campaign_id = ? ORDER BY c.created_at DESC LIMIT 100`, [req.params.id]) });
  } catch (e) { next(e); }
});
router.post('/campaigns/:id/comments', auth, async (req, res, next) => {
  try {
    const body = String((req.body && req.body.body) || '').trim();
    if (!body) return res.status(400).json({ error: 'Write something first' });
    const r = await db.run('INSERT INTO campaign_comments (campaign_id, user_id, body) VALUES (?, ?, ?)', [req.params.id, req.user.userId, body.slice(0, 1000)]);
    res.status(201).json({ comment: await db.get(`${COMMENT_SQL} WHERE c.id = ?`, [r.lastID]) });
  } catch (e) { next(e); }
});
router.delete('/comments/:id', auth, async (req, res, next) => {
  try {
    const c = await db.get('SELECT * FROM campaign_comments WHERE id = ?', [req.params.id]);
    if (!c) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'admin' && String(c.user_id) !== String(req.user.userId)) return res.status(403).json({ error: 'Not allowed' });
    await db.run('DELETE FROM campaign_comments WHERE id = ?', [c.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Saved campaigns
router.get('/saved', auth, async (req, res, next) => {
  try {
    const rows = await db.all('SELECT campaign_id FROM saved_campaigns WHERE user_id = ?', [req.user.userId]);
    res.json({ saved: rows.map((r) => r.campaign_id) });
  } catch (e) { next(e); }
});
router.post('/saved/:campaignId', auth, async (req, res, next) => {
  try {
    const has = await db.get('SELECT 1 AS x FROM saved_campaigns WHERE user_id = ? AND campaign_id = ?', [req.user.userId, req.params.campaignId]);
    if (has) await db.run('DELETE FROM saved_campaigns WHERE user_id = ? AND campaign_id = ?', [req.user.userId, req.params.campaignId]);
    else await db.run('INSERT INTO saved_campaigns (user_id, campaign_id) VALUES (?, ?)', [req.user.userId, req.params.campaignId]);
    res.json({ saved: !has });
  } catch (e) { next(e); }
});

// Onboarding: pick how you will use the platform, add a short profile and interests
router.post('/onboarding', auth, async (req, res, next) => {
  try {
    const { role, bio, location, interests } = req.body || {};
    const cur = await db.get('SELECT role FROM users WHERE id = ?', [req.user.userId]);
    const nextRole = cur && cur.role === 'admin' ? 'admin' : (['entrepreneur', 'investor'].includes(role) ? role : (cur && cur.role) || 'investor');
    await db.run('UPDATE users SET role = ?, bio = COALESCE(?, bio), location = COALESCE(?, location), interests = ?, onboarded = 1 WHERE id = ?',
      [nextRole, bio || null, location || null, JSON.stringify(Array.isArray(interests) ? interests.slice(0, 8) : []), req.user.userId]);
    res.json({ user: await db.get('SELECT id, name, email, role, bio, location, interests, onboarded FROM users WHERE id = ?', [req.user.userId]) });
  } catch (e) { next(e); }
});

module.exports = router;
