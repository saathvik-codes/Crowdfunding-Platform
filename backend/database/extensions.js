// Additive schema for features added after the first release. Safe to run on every start.
const db = require('./db');

// TiDB gets the full schema (including these tables) from mysqlSchema.js
if (db.isMysql) { module.exports = { ready: db.ready }; return; }

const exec = (sql) => new Promise((resolve) => db.run(sql, (err) => resolve(!err)));

async function migrate() {
  await exec("ALTER TABLE campaigns ADD COLUMN category TEXT DEFAULT 'other'");
  await exec('ALTER TABLE campaigns ADD COLUMN image_url TEXT');
  await exec('ALTER TABLE campaigns ADD COLUMN summary TEXT');
  await exec('ALTER TABLE users ADD COLUMN onboarded INTEGER DEFAULT 0');
  await exec('ALTER TABLE users ADD COLUMN interests TEXT');
  await exec(`CREATE TABLE IF NOT EXISTS campaign_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT, campaign_id INTEGER NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE)`);
  await exec(`CREATE TABLE IF NOT EXISTS campaign_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT, campaign_id INTEGER NOT NULL, user_id INTEGER NOT NULL, body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`);
  await exec(`CREATE TABLE IF NOT EXISTS saved_campaigns (
    user_id INTEGER NOT NULL, campaign_id INTEGER NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, campaign_id))`);
}

module.exports = { ready: new Promise((resolve) => setTimeout(() => migrate().then(resolve), 500)) };
