# 🚀 CyberTron Blog

A modern full-stack blogging platform built with Next.js and Go, featuring a cyberpunk-inspired design.

## ✨ Key Features

- 🔐 **Secure Authentication** with JWT
- 📝 **Rich Text Editor** powered by TinyMCE
- 🌓 **Dark/Light Mode** support
- 📊 **Analytics Dashboard**
- 🎯 **Matrix Rain & Glitch Effects**
- 🔍 **Smart Search** with pagination
- 📱 **Responsive Design**
- 🐳 **Docker Support** for easy deployment

## 🏗️ Tech Stack

### Frontend
- Next.js 15
- Tailwind CSS
- TypeScript
- TinyMCE Editor

### Backend
- Go (Golang)
- PostgreSQL with pg_cron
- GORM
- JWT Authentication

### Infrastructure
- Docker & Docker Compose
- Cloudflare (CDN & SSL)

## 🚀 Quick Start

### Docker Deployment (Recommended)

1. **Clone the repo**
   ```bash
   git clone https://github.com/dervisgenc/dervisgenc-blog.git
   cd dervisgenc-blog
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   nano .env
   ```

3. **Start with Docker Compose**
   ```bash
   # Production
   make up
   
   # Or using docker compose directly
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

4. **View logs**
   ```bash
   make logs
   ```

### Manual Development

1. **Start Database**
   ```bash
   docker compose up database -d
   ```

2. **Start Backend**
   ```bash
   cd backend
   go mod download
   go run ./cmd/website
   ```

3. **Start Frontend**
   ```bash
   cd next-frontend
   npm install
   npm run dev
   ```

## 🐳 Docker Commands

| Command | Description |
|---------|-------------|
| `make up` | Start production environment |
| `make down` | Stop all services |
| `make logs` | View all logs |
| `make build` | Rebuild all images |
| `make backup` | Backup database |
| `make restore FILE=backup.sql` | Restore database |
| `make deploy` | Full deployment (pull, build, up) |
| `make health` | Check service health |

## 📁 Project Structure

```
├── backend/           # Go backend API
├── next-frontend/     # Next.js frontend
├── database/          # PostgreSQL with pg_cron
├── docker-compose.yml # Main compose file
├── docker-compose.prod.yml # Production overrides
├── docker-compose.dev.yml  # Development overrides
├── Makefile           # Common commands
└── .env.example       # Environment template
```

## 🔧 Environment Variables

See `.env.example` for all available configuration options.

## 📸 Screenshots

[Added soon]

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.