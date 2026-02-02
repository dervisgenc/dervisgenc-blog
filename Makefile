# ============================================
# Makefile - Blog Application
# ============================================
# Common commands for development and deployment
# ============================================

.PHONY: help build up down logs restart clean deploy backup

# Default target
help:
	@echo "Blog Application - Available Commands"
	@echo "======================================"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start development environment"
	@echo "  make dev-down     - Stop development environment"
	@echo "  make dev-logs     - View development logs"
	@echo ""
	@echo "Production:"
	@echo "  make build        - Build all Docker images"
	@echo "  make up           - Start production environment"
	@echo "  make down         - Stop production environment"
	@echo "  make restart      - Restart all services"
	@echo "  make logs         - View logs (all services)"
	@echo "  make logs-backend - View backend logs"
	@echo "  make logs-frontend- View frontend logs"
	@echo "  make logs-db      - View database logs"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean        - Remove containers and images"
	@echo "  make clean-all    - Remove everything including volumes"
	@echo "  make backup       - Backup database"
	@echo "  make restore      - Restore database from backup"
	@echo "  make shell-db     - Access database shell"
	@echo "  make shell-backend- Access backend shell"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy       - Full deployment (pull, build, up)"
	@echo "  make update       - Update and restart services"

# ----------------------------------------
# Development Commands
# ----------------------------------------
dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

dev-down:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down

dev-logs:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# ----------------------------------------
# Production Commands
# ----------------------------------------
build:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml build

up:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

down:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down

restart:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml restart

logs:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

logs-backend:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f backend

logs-frontend:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f frontend

logs-db:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f database

# ----------------------------------------
# Maintenance Commands
# ----------------------------------------
clean:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down --rmi local
	docker image prune -f

clean-all:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down --rmi all --volumes
	docker system prune -af

shell-db:
	docker compose exec database psql -U $${DB_USER:-dervis} -d $${DB_NAME:-website}

shell-backend:
	docker compose exec backend sh

# ----------------------------------------
# Backup Commands
# ----------------------------------------
BACKUP_DIR := ./backups
BACKUP_FILE := $(BACKUP_DIR)/backup_$(shell date +%Y%m%d_%H%M%S).sql

backup:
	@mkdir -p $(BACKUP_DIR)
	docker compose exec -T database pg_dump -U $${DB_USER:-dervis} $${DB_NAME:-website} > $(BACKUP_FILE)
	@echo "Backup saved to: $(BACKUP_FILE)"

restore:
	@if [ -z "$(FILE)" ]; then \
		echo "Usage: make restore FILE=./backups/backup_file.sql"; \
		exit 1; \
	fi
	docker compose exec -T database psql -U $${DB_USER:-dervis} $${DB_NAME:-website} < $(FILE)
	@echo "Database restored from: $(FILE)"

# ----------------------------------------
# Deployment Commands
# ----------------------------------------
deploy: 
	@echo "🚀 Starting deployment..."
	git pull origin main
	$(MAKE) build
	$(MAKE) up
	@echo "✅ Deployment complete!"

update:
	@echo "🔄 Updating services..."
	git pull origin main
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
	@echo "✅ Update complete!"

# ----------------------------------------
# Health Check
# ----------------------------------------
health:
	@echo "Checking service health..."
	@docker compose ps
	@echo ""
	@echo "Backend health:"
	@curl -sf http://localhost:8080/api/health || echo "Backend not responding"
	@echo ""
	@echo "Frontend health:"
	@curl -sf http://localhost:3000 > /dev/null && echo "OK" || echo "Frontend not responding"
