# Deployment Guide

## Deploying "My Free Sailing Coach"

This guide covers deploying the application to production environments.

## Option 1: Heroku Deployment

### Backend Deployment

1. **Create Heroku Account and Install CLI**
```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login
```

2. **Prepare Backend**
```bash
cd backend

# Create Heroku app
heroku create my-sailing-coach-api

# Set environment variables
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

3. **View Logs**
```bash
heroku logs --tail
```

### Frontend Deployment

1. **Build Frontend**
```bash
cd frontend
npm run build
```

2. **Deploy to Vercel** (recommended for React)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

3. **Update API URL**
   - In `frontend/src/pages/Home.jsx`, `Dashboard.jsx`, and `RaceDetail.jsx`
   - Change `API_URL` to your Heroku backend URL
   - Example: `https://my-sailing-coach-api.herokuapp.com/api`

## Option 2: Docker Deployment

### Create Dockerfile for Backend

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/sailingcoach.db:/app/sailingcoach.db

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

### Deploy with Docker

```bash
docker-compose up -d
```

## Option 3: VPS/Cloud Server (AWS, DigitalOcean, etc.)

### 1. SSH into Server
```bash
ssh root@your_server_ip
```

### 2. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 4. Clone Repository
```bash
git clone <your-repo-url>
cd sailing-coach
```

### 5. Install Dependencies
```bash
npm run install-all
```

### 6. Build Frontend
```bash
cd frontend
npm run build
cd ..
```

### 7. Start with PM2
```bash
pm2 start backend/server.js --name "sailing-coach-api"
pm2 startup
pm2 save
```

### 8. Setup Nginx (Reverse Proxy)
```bash
sudo apt-get install nginx

# Create config
sudo nano /etc/nginx/sites-available/default
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your_domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

### 9. Enable SSL with Let's Encrypt
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your_domain.com
```

### 10. Start Nginx
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Database Migration

For production, consider using PostgreSQL instead of SQLite:

### 1. Install PostgreSQL Driver
```bash
cd backend
npm install pg pg-promise
```

### 2. Update database.js
Replace SQLite connection with:
```javascript
const pgp = require('pg-promise')();
const db = pgp(process.env.DATABASE_URL);
```

### 3. Set DATABASE_URL
```bash
export DATABASE_URL="postgresql://user:password@host:5432/sailing_coach"
```

## Performance Optimization

1. **Enable Gzip Compression** in backend/server.js:
```javascript
import compression from 'compression';
app.use(compression());
```

2. **Add Response Caching**:
```javascript
app.get('/api/races/:id', (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  // ... handler
});
```

3. **Implement Rate Limiting**:
```bash
npm install express-rate-limit
```

4. **Use CDN** for static frontend assets

## Monitoring

### Setup Error Tracking (Sentry)

```bash
npm install @sentry/node
```

In backend/server.js:
```javascript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Logging

Use a service like:
- LogRocket (frontend)
- Datadog (infrastructure)
- ELK Stack (self-hosted)

## Backup Strategy

### Automated Database Backups

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/sailing-coach"
DATE=$(date +%Y%m%d_%H%M%S)
cp sailingcoach.db $BACKUP_DIR/sailingcoach_$DATE.db

# Keep only last 30 days
find $BACKUP_DIR -mtime +30 -delete
EOF

chmod +x backup.sh

# Schedule with cron
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

## Scaling Considerations

1. **Separate backend and frontend servers**
2. **Use load balancer** (nginx, HAProxy)
3. **Migrate to managed database** (AWS RDS, etc.)
4. **Implement caching layer** (Redis)
5. **Use object storage** (AWS S3) for uploaded GPX files
6. **Implement API pagination** for large datasets

## Troubleshooting Deployment

### App won't start
- Check logs: `pm2 logs` or `docker logs`
- Verify environment variables are set
- Check port availability: `sudo lsof -i :5000`

### Database errors
- Ensure database directory is writable
- Check SQLite permissions
- Verify database file isn't corrupted

### Frontend won't load
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Verify API_URL is correct
- Check CORS settings in backend

## Support

For deployment questions, refer to the platform-specific documentation:
- Heroku: https://devcenter.heroku.com
- Vercel: https://vercel.com/docs
- Docker: https://docs.docker.com
- Digital Ocean: https://www.digitalocean.com/community/tutorials
