// Vercel serverless entry point - wraps the same Express app used by
// local dev, Docker, and Render. All routing, static file serving, and
// business logic lives in src/server.js; this file just exposes it in the
// shape Vercel's Node.js builder expects.
module.exports = require('../src/server.js');
