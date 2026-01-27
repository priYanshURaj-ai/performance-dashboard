# 🚀 Deployment Guide - Performance Dashboard

## Quick Deploy (Internal Network)

### Prerequisites
- Node.js 14+ installed on the server
- Network access between n8n server and dashboard server

---

## Option 1: Deploy on Internal VM/Server

### Step 1: Copy Files to Server

```bash
# From your local machine
scp -r PreformanceDashboard/ user@your-server:/path/to/deploy/
```

### Step 2: Start the Server

```bash
ssh user@your-server
cd /path/to/deploy/PreformanceDashboard

# Install dependencies (none required - pure Node.js!)
# Start server
node server.js

# Or with custom port
PORT=3000 node server.js
```

### Step 3: Run as Background Service

```bash
# Using nohup
nohup node server.js > server.log 2>&1 &

# Or using PM2 (recommended)
npm install -g pm2
pm2 start server.js --name "performance-dashboard"
pm2 save
pm2 startup  # Auto-start on reboot
```

### Step 4: Get Server IP

```bash
# Find your server's internal IP
hostname -I
# or
ip addr show | grep "inet "
```

---

## Option 2: Docker Deployment

### Create Dockerfile (optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
EXPOSE 8080
CMD ["node", "server.js"]
```

### Build and Run

```bash
docker build -t performance-dashboard .
docker run -d -p 8080:8080 --name dashboard performance-dashboard
```

---

## Configure n8n

Once deployed, update n8n with your server URL:

### Method 1: Environment Variable (Recommended)

In n8n, set environment variable:
```
DASHBOARD_SERVER_URL=http://your-server-ip:8080
```

### Method 2: Direct in Node

Edit the "🌐 Send to Dashboard" node URL:
```
http://your-server-ip:8080/api/update-performance
```

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/update-performance` | POST | Receive data from n8n |
| `/api/performance-data` | GET | Get current data |
| `/api/last-updated` | GET | Check last update time |
| `/api/health` | GET | Health check |
| `/api/info` | GET | Server info |

---

## Verify Deployment

### 1. Health Check
```bash
curl http://your-server-ip:8080/api/health
# Should return: {"status":"healthy","timestamp":"..."}
```

### 2. Test n8n Connection
```bash
curl -X POST http://your-server-ip:8080/api/update-performance \
  -H "Content-Type: application/json" \
  -d '{"test": true, "lastUpdated": "2025-01-01"}'
# Should return: {"success":true,"message":"Data updated successfully",...}
```

### 3. View Dashboard
Open in browser: `http://your-server-ip:8080`

---

## Troubleshooting

### Server not accessible from n8n?
1. Check firewall: `sudo ufw allow 8080`
2. Check if server is running: `curl localhost:8080/api/health`
3. Check network connectivity from n8n server

### Data not updating?
1. Check n8n execution logs
2. Verify URL in n8n node
3. Check server logs: `pm2 logs performance-dashboard`

---

## Security Recommendations

For production:
1. Use HTTPS (add SSL certificate)
2. Add authentication to `/api/update-performance`
3. Restrict CORS to specific origins
4. Use a reverse proxy (nginx)

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────┐
│  Performance Dashboard Server                           │
├─────────────────────────────────────────────────────────┤
│  Start:    node server.js                               │
│  Port:     8080 (or set PORT env var)                   │
│  Host:     0.0.0.0 (accessible on network)              │
├─────────────────────────────────────────────────────────┤
│  n8n URL:  http://YOUR_SERVER_IP:8080                   │
│  Webhook:  /api/update-performance (POST)               │
│  Data:     /api/performance-data (GET)                  │
└─────────────────────────────────────────────────────────┘
```

