const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

// Load adhkar data
const dataPath = path.join(__dirname, 'data', 'adhkar.json');
const adhkarData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// MIME types
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

function setCORS(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJSON(res, data, status = 200) {
    setCORS(res);
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data, null, 2));
}

function handleRandomDhikr(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const categoryID = url.searchParams.get('category') || '';

    let pool = [];

    for (const cat of adhkarData.categories) {
        if (categoryID && cat.id !== categoryID) continue;
        for (const item of cat.items) {
            pool.push({ ...item, categoryLabel: cat.label });
        }
    }

    if (pool.length === 0) {
        return sendJSON(res, { success: false, text: 'لا توجد نتائج للتصنيف المطلوب' }, 404);
    }

    const picked = pool[Math.floor(Math.random() * pool.length)];
    sendJSON(res, {
        success: true,
        category: picked.categoryLabel,
        type: picked.type,
        text: picked.text,
        source: picked.source,
        full_ayah: picked.full_ayah || '',
    });
}

function handleCategories(req, res) {
    const cats = adhkarData.categories.map(cat => ({
        id: cat.id,
        label: cat.label,
        icon: cat.icon,
        count: cat.items.length,
    }));
    sendJSON(res, { success: true, categories: cats });
}

function handleCategoryItems(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = url.searchParams.get('id') || '';

    if (!id) {
        return sendJSON(res, { success: false, error: 'يرجى تحديد التصنيف' }, 400);
    }

    const cat = adhkarData.categories.find(c => c.id === id);
    if (!cat) {
        return sendJSON(res, { success: false, error: 'التصنيف غير موجود' }, 404);
    }

    sendJSON(res, { success: true, category: cat.label, items: cat.items });
}

function serveStatic(req, res) {
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, 'static', filePath);

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>404 — الصفحة غير موجودة</h1>');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

const server = http.createServer((req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        setCORS(res);
        res.writeHead(204);
        res.end();
        return;
    }

    const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;

    // API routes
    if (pathname === '/api/random-dhikr') return handleRandomDhikr(req, res);
    if (pathname === '/api/categories') return handleCategories(req, res);
    if (pathname === '/api/category') return handleCategoryItems(req, res);

    // Static files
    serveStatic(req, res);
});

server.listen(PORT, () => {
    console.log(`🕌 زادي (za-di.com) يعمل على المنفذ ${PORT}`);
    console.log(`🌐 افتح المتصفح: http://localhost:${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api/random-dhikr`);
});
