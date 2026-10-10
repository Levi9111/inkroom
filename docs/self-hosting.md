# Inkroom Self-Hosting Guide

Inkroom is 100% open source and designed to be effortlessly self-hosted on any VPS, cloud server, or on-premise school hardware in a single command using Docker Compose.

## One-Command Deployment

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  inkroom:
    image: ghcr.io/levi9111/inkroom:latest
    container_name: inkroom-app
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
      - MONGODB_URI=mongodb://mongo:27017/inkroom
      - JWT_SECRET=change-this-to-a-very-secure-random-secret
      - ALLOWED_ORIGINS=http://localhost:8080,https://board.myschool.edu
      - ASSET_STORAGE=local
      - UPLOAD_DIR=/app/uploads
      - BOARD_RETENTION_DAYS=30
    volumes:
      - inkroom-uploads:/app/uploads
    depends_on:
      - mongo

  mongo:
    image: mongo:7
    container_name: inkroom-mongo
    restart: unless-stopped
    volumes:
      - inkroom-db:/data/db

volumes:
  inkroom-uploads:
  inkroom-db:
```

Start the service:
```bash
docker compose up -d
```

Your whiteboard is now running on `http://localhost:8080`!

## Environment Variables Reference

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | Port for the HTTP & WebSocket server |
| `MONGODB_URI` | `mongodb://localhost:27017/inkroom` | MongoDB connection string |
| `JWT_SECRET` | Required | Cryptographic secret for signing room tokens |
| `ALLOWED_ORIGINS` | `*` | Comma-separated list of allowed origins for CORS & WebSockets |
| `ASSET_STORAGE` | `local` | Storage driver (`local` or `s3`) |
| `UPLOAD_DIR` | `./uploads` | Local upload directory if `ASSET_STORAGE=local` |
| `BOARD_RETENTION_DAYS`| `30` | Auto-cleanup period for inactive boards |
| `MAX_PARTICIPANTS` | `60` | Maximum concurrent participants per board |
