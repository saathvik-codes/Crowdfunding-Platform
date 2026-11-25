const db = require('../database/dbHelper');

const isAdmin = (req) => req.user && req.user.role === 'admin';
const SELECT = `
  SELECT t.id, t.user_id, t.transaction_type, t.amount, t.balance_before, t.balance_after, t.reference_type, t.reference_id,
         t.description, t.timestamp, u.name AS user_name,
         CASE WHEN t.reference_type = 'pledge' THEN c.id END AS campaign_id,
         CASE WHEN t.reference_type = 'pledge' THEN c.title END AS campaign_title
  FROM wallet_transactions t
  JOIN users u ON u.id = t.user_id
  LEFT JOIN pledges p ON t.reference_type = 'pledge' AND p.id = t.reference_id
  LEFT JOIN campaigns c ON c.id = p.campaign_id`;

// A user's own wallet ledger (admins can read anyone's)
exports.getTransactionsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!isAdmin(req) && String(req.user.userId) !== String(userId)) return res.status(403).json({ error: 'Not allowed' });
    const transactions = await db.all(`${SELECT} WHERE t.user_id = ? ORDER BY t.timestamp DESC, t.id DESC LIMIT 200`, [userId]);
    res.json({ transactions });
  } catch (error) { next(error); }
};

// Everything on the platform (admin only)
exports.getAllTransactions = async (req, res, next) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });
    const transactions = await db.all(`${SELECT} ORDER BY t.timestamp DESC, t.id DESC LIMIT 500`);
    res.json({ transactions });
  } catch (error) { next(error); }
};

// Totals by type; a non-admin sees their own
exports.getTransactionStats = async (req, res, next) => {
  try {
    const scope = isAdmin(req) ? '' : 'WHERE user_id = ?';
    const params = isAdmin(req) ? [] : [req.user.userId];
    const stats = await db.get(`
      SELECT COUNT(*) AS total_count,
        COALESCE(SUM(CASE WHEN transaction_type = 'debit' THEN amount ELSE 0 END), 0) AS total_debited,
        COALESCE(SUM(CASE WHEN transaction_type = 'credit' THEN amount ELSE 0 END), 0) AS total_credited,
        COALESCE(SUM(CASE WHEN transaction_type = 'refund' THEN amount ELSE 0 END), 0) AS total_refunded
      FROM wallet_transactions ${scope}`, params);
    res.json({ stats });
  } catch (error) { next(error); }
};
