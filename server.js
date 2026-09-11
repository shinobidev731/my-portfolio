const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'reviews.json');

// Ensure database file exists
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf8');
}

function getReviews() {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        console.error('Error reading reviews file:', err);
        return [];
    }
}

function saveReviews(reviews) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(reviews, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Error saving reviews file:', err);
        return false;
    }
}

// MIME types for static file serving
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', reject);
    });
}

const server = http.createServer(async (req, res) => {
    // Enable CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-author-token');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // ==========================================
    // API ENDPOINTS
    // ==========================================

    // 1. GET /api/reviews
    if (req.method === 'GET' && pathname === '/api/reviews') {
        const reviews = getReviews();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, reviews }));
        return;
    }

    // 2. POST /api/reviews
    if (req.method === 'POST' && pathname === '/api/reviews') {
        try {
            const body = await parseBody(req);
            const { name, text, authorToken } = body;

            if (!name || !text) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Name and review text are required.' }));
                return;
            }

            const token = authorToken || ('auth_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
            const newReview = {
                id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                name: name.trim(),
                text: text.trim(),
                authorToken: token,
                createdAt: Date.now()
            };

            const reviews = getReviews();
            reviews.unshift(newReview);
            saveReviews(reviews);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, review: newReview, authorToken: token }));
            return;
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON body.' }));
            return;
        }
    }

    // 3. PUT /api/reviews/:id (Author Only)
    if (req.method === 'PUT' && pathname.startsWith('/api/reviews/')) {
        const reviewId = pathname.replace('/api/reviews/', '');
        const clientToken = req.headers['x-author-token'];

        try {
            const body = await parseBody(req);
            const { name, text } = body;

            if (!name || !text) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Name and text are required.' }));
                return;
            }

            const reviews = getReviews();
            const review = reviews.find(r => r.id === reviewId);

            if (!review) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Review not found.' }));
                return;
            }

            // Verify author ownership
            if (!clientToken || review.authorToken !== clientToken) {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Forbidden: Only the author can edit this review.' }));
                return;
            }

            review.name = name.trim();
            review.text = text.trim();
            review.updatedAt = Date.now();

            saveReviews(reviews);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, review }));
            return;
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON payload.' }));
            return;
        }
    }

    // 4. DELETE /api/reviews/:id (Author Only)
    if (req.method === 'DELETE' && pathname.startsWith('/api/reviews/')) {
        const reviewId = pathname.replace('/api/reviews/', '');
        const clientToken = req.headers['x-author-token'];

        const reviews = getReviews();
        const review = reviews.find(r => r.id === reviewId);

        if (!review) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Review not found.' }));
            return;
        }

        // Verify author ownership
        if (!clientToken || review.authorToken !== clientToken) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Forbidden: Only the author can delete this review.' }));
            return;
        }

        const filtered = reviews.filter(r => r.id !== reviewId);
        saveReviews(filtered);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Review deleted successfully.' }));
        return;
    }

    // ==========================================
    // STATIC FILE SERVER
    // ==========================================
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

    // Prevent directory traversal attacks
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

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`Portfolio Server running at http://localhost:${PORT}`);
});
