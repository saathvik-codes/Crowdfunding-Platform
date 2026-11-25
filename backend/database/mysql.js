// MySQL-compatible (TiDB Cloud) driver with the same callback surface the app already uses on SQLite:
// db.run / db.get / db.all / db.serialize, plus db.transaction(fn) that pins one connection for the whole callback.
const mysql = require('mysql2/promise');
const { AsyncLocalStorage } = require('node:async_hooks');
const schema = require('./mysqlSchema');

const pool = mysql.createPool({
  host: process.env.TIDB_HOST,
  port: Number(process.env.TIDB_PORT || 4000),
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE || 'crowdfunding',
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: Number(process.env.TIDB_POOL || 8),
  enableKeepAlive: true,
  decimalNumbers: true,
  dateStrings: true,
});
pool.on('connection', (conn) => {
  conn.query("SET SESSION sql_mode = ''");
  conn.query("SET SESSION time_zone = '+00:00'");
});

const tx = new AsyncLocalStorage();

// SQLite flavoured SQL used across the services, rewritten for MySQL
function translate(sql) {
  return String(sql)
    .replace(/INSERT\s+OR\s+IGNORE/gi, 'INSERT IGNORE')
    .replace(/INSERT\s+OR\s+REPLACE/gi, 'REPLACE')
    .replace(/datetime\('now',\s*'-'\s*\|\|\s*\?\s*\|\|\s*' days'\)/gi, 'DATE_SUB(NOW(), INTERVAL ? DAY)')
    .replace(/julianday\('now'\)/gi, '(UNIX_TIMESTAMP(NOW())/86400)')
    .replace(/julianday\(([\w.]+)\)/gi, '(UNIX_TIMESTAMP($1)/86400)')
    .replace(/datetime\('now'\)/gi, 'NOW()')
    .replace(/datetime\(([\w.]+)\)/gi, '$1')
    .replace(/strftime\('([^']+)',\s*([\w.]+)\)/gi, (_m, fmt, col) => `DATE_FORMAT(${col}, '${fmt}')`);
}

const exec = () => tx.getStore() || pool;

function normalise(args) {
  const params = Array.isArray(args[1]) ? args[1] : [];
  const cb = args.find((a) => typeof a === 'function');
  return [args[0], params, cb];
}

const db = {
  run(...args) {
    const [sql, params, cb] = normalise(args);
    const text = translate(sql).trim();
    // sqlite pragmas and transaction keywords have no meaning here (transactions go through db.transaction)
    if (/^(PRAGMA|BEGIN|COMMIT|ROLLBACK)/i.test(text)) { if (cb) cb.call({ lastID: 0, changes: 0 }, null); return Promise.resolve(); }
    const p = exec().query(text, params).then(([res]) => ({ lastID: res.insertId || 0, changes: res.affectedRows || 0 }));
    if (cb) p.then((r) => cb.call(r, null), (e) => cb(e));
    return p;
  },
  get(...args) {
    const [sql, params, cb] = normalise(args);
    const p = exec().query(translate(sql), params).then(([rows]) => rows[0]);
    if (cb) p.then((r) => cb(null, r), (e) => cb(e));
    return p;
  },
  all(...args) {
    const [sql, params, cb] = normalise(args);
    const p = exec().query(translate(sql), params).then(([rows]) => rows);
    if (cb) p.then((r) => cb(null, r), (e) => cb(e));
    return p;
  },
  serialize(fn) { if (fn) fn(); },
  async transaction(fn) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const result = await tx.run(conn, fn);
      await conn.commit();
      return result;
    } catch (e) {
      try { await conn.rollback(); } catch (_) { /* connection already gone */ }
      throw e;
    } finally {
      conn.release();
    }
  },
  isMysql: true,
  ready: schema.apply(pool).then(() => console.log('Connected to TiDB, schema ready')).catch((e) => { console.error('TiDB schema error:', e.message); throw e; }),
};

module.exports = db;
