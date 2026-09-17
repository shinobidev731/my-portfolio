/**
 * Ikeoluwa Makinwa Portfolio - Backend Server
 * Uses native node:sqlite (Node v22+) for relational storage
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'reviews.db');

// ============================================================
// DATABASE INITIALISATION (WAL mode for fast concurrent reads)
// ============================================================
const db = new DatabaseSync(DB_PATH);

db.exec(`PRAGMA journal_mode = WAL;`);
db.exec(`PRAGMA synchronous = NORMAL;`);
db.exec(`PRAGMA foreign_keys = ON;`);

db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        text        TEXT NOT NULL,
        author_token TEXT,
        created_at  INTEGER NOT NULL,
        updated_at  INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_reviews_created
        ON reviews (created_at DESC);
`);

// Prepared statements — compiled once, reused on every request
const stmtGetAll = db.prepare(
    `SELECT id, name, text, author_token AS authorToken,
            created_at AS createdAt, updated_at AS updatedAt
     FROM   reviews
     ORDER  BY created_at DESC`
);

const stmtInsert = db.prepare(
    `INSERT OR IGNORE INTO reviews (id, name, text, author_token, created_at)
     VALUES (?, ?, ?, ?, ?)`
);

const stmtUpdate = db.prepare(
    `UPDATE reviews
     SET    name = ?, text = ?, updated_at = ?
     WHERE  id = ?
       AND  (author_token = ? OR author_token IS NULL)`
);

const stmtDelete = db.prepare(
    `DELETE FROM reviews
     WHERE  id = ?
       AND  (author_token = ? OR author_token IS NULL)`
);

const stmtGetById = db.prepare(
    `SELECT id, author_token AS authorToken FROM reviews WHERE id = ?`
);

// ============================================================
// HELPERS
// ============================================================

/** MIME type map for static file serving */
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.pdf':  'application/pdf',
    '.webp': 'image/webp',
};

/** Read and JSON-parse the request body */
function readBody(req) {
    return new Promise((resolve, reject) => {
        let raw = '';
        req.on('data', chunk => { raw += chunk; });
        req.on('end', () => {
            try { resolve(raw ? JSON.parse(raw) : {}); }
            catch (e) { reject(e); }
        });
        req.on('error', reject);
    });
}

/** Send a JSON response */
function json(res, status, body) {
    const payload = JSON.stringify(body);
    res.writeHead(status, {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(payload),
    });
    res.end(payload);
}

/** Generate a random short ID */
function genId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ============================================================
// HTTP SERVER
// ============================================================
const server = http.createServer(async (req, res) => {

    // --- CORS ---
    res.setHeader('Access-Control-Allow-Origin',  '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-author-token');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname  = parsedUrl.pathname;

    // --------------------------------------------------------
    // GET /api/health
    // --------------------------------------------------------
    if (req.method === 'GET' && pathname === '/api/health') {
        const count = db.prepare('SELECT COUNT(*) AS c FROM reviews').get().c;
        json(res, 200, { ok: true, reviews: count, ts: Date.now() });
        return;
    }

    // --------------------------------------------------------
    // GET /api/reviews
    // --------------------------------------------------------
    if (req.method === 'GET' && pathname === '/api/reviews') {
        const reviews = stmtGetAll.all();
        json(res, 200, { success: true, reviews });
        return;
    }

    // --------------------------------------------------------
    // POST /api/reviews
    // --------------------------------------------------------
    if (req.method === 'POST' && pathname === '/api/reviews') {
        let body;
        try { body = await readBody(req); }
        catch { json(res, 400, { error: 'Invalid JSON body.' }); return; }

        const { name, text, authorToken, id, createdAt } = body;

        if (!name || !text || !name.trim() || !text.trim()) {
            json(res, 400, { error: 'Name and review text are required.' });
            return;
        }

        const token    = authorToken || req.headers['x-author-token'] || genId('auth');
        const reviewId = id          || genId('rev');
        const now      = createdAt   || Date.now();

        try {
            stmtInsert.run(reviewId, name.trim(), text.trim(), token, now);
        } catch (e) {
            console.error('DB insert error:', e);
            json(res, 500, { error: 'Failed to save review.' });
            return;
        }

        const saved = stmtGetById.get(reviewId);
        json(res, 201, {
            success: true,
            review: {
                id: reviewId,
                name: name.trim(),
                text: text.trim(),
                authorToken: token,
                createdAt: now,
            },
            authorToken: token,
        });
        return;
    }

    // --------------------------------------------------------
    // PUT /api/reviews/:id
    // --------------------------------------------------------
    if (req.method === 'PUT' && pathname.startsWith('/api/reviews/')) {
        const reviewId   = decodeURIComponent(pathname.slice('/api/reviews/'.length));
        const clientToken = req.headers['x-author-token'] || '';

        let body;
        try { body = await readBody(req); }
        catch { json(res, 400, { error: 'Invalid JSON body.' }); return; }

        const { name, text } = body;
        if (!name || !text || !name.trim() || !text.trim()) {
            json(res, 400, { error: 'Name and text are required.' });
            return;
        }

        const existing = stmtGetById.get(reviewId);
        if (!existing) {
            json(res, 404, { error: 'Review not found.' });
            return;
        }

        // Ownership check: if the review has a token, the client must match
        if (existing.authorToken && clientToken && existing.authorToken !== clientToken) {
            json(res, 403, { error: 'Forbidden: you can only edit your own reviews.' });
            return;
        }

        const now = Date.now();
        stmtUpdate.run(name.trim(), text.trim(), now, reviewId, clientToken || existing.authorToken);
        json(res, 200, {
            success: true,
            review: { id: reviewId, name: name.trim(), text: text.trim(), updatedAt: now },
        });
        return;
    }

    // --------------------------------------------------------
    // DELETE /api/reviews/:id
    // --------------------------------------------------------
    if (req.method === 'DELETE' && pathname.startsWith('/api/reviews/')) {
        const reviewId    = decodeURIComponent(pathname.slice('/api/reviews/'.length));
        const clientToken = req.headers['x-author-token'] || '';

        const existing = stmtGetById.get(reviewId);
        if (!existing) {
            // Already gone — reply 200 so the UI stays in sync
            json(res, 200, { success: true, message: 'Review already deleted.' });
            return;
        }

        if (existing.authorToken && clientToken && existing.authorToken !== clientToken) {
            json(res, 403, { error: 'Forbidden: you can only delete your own reviews.' });
            return;
        }

        stmtDelete.run(reviewId, clientToken || existing.authorToken);
        json(res, 200, { success: true, message: 'Review deleted.' });
        return;
    }

    // --------------------------------------------------------
    // STATIC FILE SERVER
    // --------------------------------------------------------
    const cleanPath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const filePath  = path.resolve(__dirname, cleanPath);

    // Directory traversal guard
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        const ext         = path.extname(filePath).toLowerCase();
        const contentType = MIME[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Portfolio server running → http://localhost:${PORT}`);
    console.log(`   SQLite DB: ${DB_PATH}`);
});
