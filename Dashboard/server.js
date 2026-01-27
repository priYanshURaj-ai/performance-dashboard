/**
 * Performance Dashboard Server
 * - Serves the web dashboard
 * - Receives webhook from n8n to update data
 * - Provides API for real-time updates
 * 
 * Environment Variables:
 *   PORT - Server port (default: 8080)
 *   HOST - Server host (default: 0.0.0.0 for network access)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration from environment variables
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0'; // 0.0.0.0 allows network access
const DATA_FILE = path.join(__dirname, 'web', 'data', 'performance-data.json');
const WEB_DIR = path.join(__dirname, 'web');

// MIME types for serving static files
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Create HTTP server
const server = http.createServer((req, res) => {
    // Enable CORS for all origins (adjust for production)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Health check endpoint for monitoring
    if (req.url === '/health' || req.url === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'healthy', 
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        }));
        return;
    }

    // API: Receive data from n8n webhook
    if (req.method === 'POST' && req.url === '/api/update-performance') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                
                // Add server timestamp
                data.lastUpdated = new Date().toISOString();
                
                // Ensure data directory exists
                const dataDir = path.dirname(DATA_FILE);
                if (!fs.existsSync(dataDir)) {
                    fs.mkdirSync(dataDir, { recursive: true });
                }
                
                // Save to file
                fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
                
                console.log('✅ Performance data updated!');
                console.log(`   📅 Time: ${data.lastUpdated}`);
                console.log(`   👥 Members: ${data.members?.length || 0}`);
                console.log(`   📊 7-day total: ${data.teamSummary?.['7days']?.total || 0}`);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    message: 'Data updated successfully',
                    timestamp: data.lastUpdated,
                    membersCount: data.members?.length || 0
                }));
            } catch (error) {
                console.error('❌ Error updating data:', error.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });
        return;
    }

    // API: Get current data (for dashboard polling)
    if (req.method === 'GET' && req.url === '/api/performance-data') {
        try {
            if (!fs.existsSync(DATA_FILE)) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'No data available yet' }));
                return;
            }
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to read data' }));
        }
        return;
    }

    // API: Get last update time (for checking freshness)
    if (req.method === 'GET' && req.url === '/api/last-updated') {
        try {
            if (!fs.existsSync(DATA_FILE)) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'No data available yet' }));
                return;
            }
            const stats = fs.statSync(DATA_FILE);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ lastModified: stats.mtime }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to get file stats' }));
        }
        return;
    }

    // API: Server info
    if (req.method === 'GET' && req.url === '/api/info') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            name: 'Performance Dashboard Server',
            version: '1.0.0',
            endpoints: {
                health: '/api/health',
                updateData: 'POST /api/update-performance',
                getData: 'GET /api/performance-data',
                lastUpdated: 'GET /api/last-updated'
            }
        }));
        return;
    }

    // Serve static files
    let filePath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    filePath = path.join(WEB_DIR, filePath);

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

// Start server
server.listen(PORT, HOST, () => {
    const networkInterfaces = require('os').networkInterfaces();
    const addresses = [];
    
    for (const iface of Object.values(networkInterfaces)) {
        for (const config of iface) {
            if (config.family === 'IPv4' && !config.internal) {
                addresses.push(config.address);
            }
        }
    }

    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║          🎯 PERFORMANCE DASHBOARD SERVER                          ║');
    console.log('╠═══════════════════════════════════════════════════════════════════╣');
    console.log(`║  📊 Local:     http://localhost:${PORT}                               ║`);
    if (addresses.length > 0) {
        console.log(`║  🌐 Network:   http://${addresses[0]}:${PORT}                        ║`);
    }
    console.log('╠═══════════════════════════════════════════════════════════════════╣');
    console.log('║  API Endpoints:                                                    ║');
    console.log('║    POST /api/update-performance  - Receive data from n8n          ║');
    console.log('║    GET  /api/performance-data    - Get current data               ║');
    console.log('║    GET  /api/health              - Health check                   ║');
    console.log('╠═══════════════════════════════════════════════════════════════════╣');
    console.log('║  ⏳ Waiting for n8n to send data...                                ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝');
    console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server stopped.');
        process.exit(0);
    });
});
