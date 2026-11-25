// Schema for TiDB / MySQL. Idempotent: safe to run on every start. Also seeds the fixed lookup rows (roles, permissions).
const TABLES = [
  `CREATE TABLE IF NOT EXISTS user_roles (
    id INT PRIMARY KEY AUTO_INCREMENT, role_name VARCHAR(32) UNIQUE NOT NULL, description VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(120) NOT NULL, email VARCHAR(190) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL,
    role VARCHAR(16) NOT NULL DEFAULT 'investor', wallet_balance DECIMAL(14,2) DEFAULT 1000.00, profile_image VARCHAR(500),
    bio TEXT, phone VARCHAR(40), location VARCHAR(160), is_verified TINYINT(1) DEFAULT 0, is_active TINYINT(1) DEFAULT 1,
    last_login DATETIME NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    onboarded TINYINT(1) DEFAULT 0, interests TEXT)`,
  `CREATE TABLE IF NOT EXISTS campaigns (
    id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(200) NOT NULL, description TEXT NOT NULL, goal_amount DECIMAL(14,2) NOT NULL,
    current_funds DECIMAL(14,2) DEFAULT 0, deadline DATETIME NOT NULL, creator_id INT NOT NULL, status VARCHAR(16) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    category VARCHAR(40) DEFAULT 'other', image_url VARCHAR(500), summary VARCHAR(300),
    INDEX idx_campaigns_creator (creator_id), INDEX idx_campaigns_status (status),
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS pledges (
    id INT PRIMARY KEY AUTO_INCREMENT, user_id INT NOT NULL, campaign_id INT NOT NULL, amount DECIMAL(14,2) NOT NULL,
    status VARCHAR(16) DEFAULT 'pending', timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_pledges_user (user_id), INDEX idx_pledges_campaign (campaign_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS wallet_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT, user_id INT NOT NULL, transaction_type VARCHAR(24) NOT NULL, amount DECIMAL(14,2) NOT NULL,
    balance_before DECIMAL(14,2) NOT NULL, balance_after DECIMAL(14,2) NOT NULL, reference_type VARCHAR(24), reference_id INT,
    description VARCHAR(255), timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, INDEX idx_wallet_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS permissions (
    id INT PRIMARY KEY AUTO_INCREMENT, role VARCHAR(32) NOT NULL, resource VARCHAR(48) NOT NULL, action VARCHAR(16) NOT NULL,
    granted TINYINT(1) DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY uq_perm (role, resource, action))`,
  `CREATE TABLE IF NOT EXISTS user_activity_log (
    id INT PRIMARY KEY AUTO_INCREMENT, user_id INT NOT NULL, activity_type VARCHAR(64) NOT NULL, activity_description VARCHAR(255),
    ip_address VARCHAR(64), user_agent VARCHAR(255), timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, INDEX idx_activity_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT, user_id INT NOT NULL, title VARCHAR(160) NOT NULL, message TEXT NOT NULL, type VARCHAR(16),
    is_read TINYINT(1) DEFAULT 0, reference_type VARCHAR(32), reference_id INT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notif_user (user_id), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS campaign_analytics (
    id INT PRIMARY KEY AUTO_INCREMENT, campaign_id INT NOT NULL, total_backers INT DEFAULT 0, total_pledged DECIMAL(14,2) DEFAULT 0,
    avg_pledge_amount DECIMAL(14,2) DEFAULT 0, funding_percentage DECIMAL(8,2) DEFAULT 0, days_remaining INT, prediction_score DECIMAL(8,4),
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP, INDEX idx_analytics_campaign (campaign_id),
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT, table_name VARCHAR(64) NOT NULL, action_type VARCHAR(16) NOT NULL, record_id INT NOT NULL,
    old_value TEXT, new_value TEXT, changed_by INT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, ip_address VARCHAR(64), user_agent VARCHAR(255))`,
  `CREATE TABLE IF NOT EXISTS campaign_updates (
    id INT PRIMARY KEY AUTO_INCREMENT, campaign_id INT NOT NULL, title VARCHAR(160) NOT NULL, body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, INDEX idx_updates_campaign (campaign_id),
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS campaign_comments (
    id INT PRIMARY KEY AUTO_INCREMENT, campaign_id INT NOT NULL, user_id INT NOT NULL, body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, INDEX idx_comments_campaign (campaign_id),
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS saved_campaigns (
    user_id INT NOT NULL, campaign_id INT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, campaign_id))`,
];


const VIEWS = [
  `CREATE OR REPLACE VIEW entrepreneur_dashboard AS
    SELECT u.id AS user_id, u.name, u.email, COUNT(DISTINCT c.id) AS total_campaigns,
      COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) AS active_campaigns,
      COUNT(DISTINCT CASE WHEN c.status = 'successful' THEN c.id END) AS successful_campaigns,
      COALESCE(SUM(c.current_funds), 0) AS total_raised, COUNT(DISTINCT p.user_id) AS total_backers
    FROM users u LEFT JOIN campaigns c ON u.id = c.creator_id LEFT JOIN pledges p ON c.id = p.campaign_id
    WHERE u.role = 'entrepreneur' GROUP BY u.id, u.name, u.email`,
  `CREATE OR REPLACE VIEW admin_dashboard AS
    SELECT (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM users WHERE role = 'entrepreneur') AS total_entrepreneurs,
      (SELECT COUNT(*) FROM users WHERE role = 'investor') AS total_investors,
      (SELECT COUNT(*) FROM campaigns) AS total_campaigns,
      (SELECT COUNT(*) FROM campaigns WHERE status = 'active') AS active_campaigns,
      (SELECT COUNT(*) FROM pledges) AS total_pledges,
      (SELECT COALESCE(SUM(current_funds), 0) FROM campaigns) AS total_funds_raised,
      (SELECT COALESCE(SUM(wallet_balance), 0) FROM users) AS total_wallet_balance,
      (SELECT COUNT(*) FROM user_activity_log WHERE DATE(timestamp) = CURDATE()) AS today_activities`,
];

const ROLES = [['admin', 'Platform administrator with full access'], ['entrepreneur', 'Campaign creator'], ['investor', 'Backer who can pledge to campaigns']];
const PERMS = [
  ['admin', 'users', 'manage'], ['admin', 'campaigns', 'manage'], ['admin', 'pledges', 'manage'], ['admin', 'analytics', 'read'],
  ['entrepreneur', 'campaigns', 'create'], ['entrepreneur', 'campaigns', 'update'], ['entrepreneur', 'campaigns', 'read'],
  ['investor', 'campaigns', 'read'], ['investor', 'pledges', 'create'], ['investor', 'pledges', 'read'],
];

async function apply(pool) {
  for (const sql of TABLES) await pool.query(sql);
  for (const sql of VIEWS) await pool.query(sql);
  for (const [name, description] of ROLES) await pool.query('INSERT IGNORE INTO user_roles (role_name, description) VALUES (?, ?)', [name, description]);
  for (const [role, resource, action] of PERMS) await pool.query('INSERT IGNORE INTO permissions (role, resource, action) VALUES (?, ?, ?)', [role, resource, action]);
}

module.exports = { apply };
