const session = require('express-session');

// A minimal express-session Store backed by the same async db shim used
// everywhere else, so admin login sessions persist across serverless
// instances instead of living in per-process memory (the default
// MemoryStore, which is explicitly unsafe for production and breaks
// entirely on Vercel where each request can hit a different instance).
class TursoSessionStore extends session.Store {
  constructor(db) {
    super();
    this.db = db;
  }

  get(sid, callback) {
    this.db
      .prepare('SELECT sess, expires_at FROM sessions WHERE sid = ?')
      .get(sid)
      .then((row) => {
        if (!row) return callback(null, null);
        if (row.expires_at && row.expires_at < Date.now()) {
          return this.destroy(sid, () => callback(null, null));
        }
        callback(null, JSON.parse(row.sess));
      })
      .catch((error) => callback(error));
  }

  set(sid, sess, callback) {
    const expiresAt = sess?.cookie?.expires ? new Date(sess.cookie.expires).getTime() : Date.now() + 1000 * 60 * 60 * 12;

    this.db
      .prepare(
        `INSERT INTO sessions (sid, sess, expires_at) VALUES (?, ?, ?)
         ON CONFLICT(sid) DO UPDATE SET sess = excluded.sess, expires_at = excluded.expires_at`
      )
      .run(sid, JSON.stringify(sess), expiresAt)
      .then(() => callback(null))
      .catch((error) => callback(error));
  }

  destroy(sid, callback) {
    this.db
      .prepare('DELETE FROM sessions WHERE sid = ?')
      .run(sid)
      .then(() => callback(null))
      .catch((error) => callback(error));
  }

  touch(sid, sess, callback) {
    this.set(sid, sess, callback);
  }
}

module.exports = TursoSessionStore;
