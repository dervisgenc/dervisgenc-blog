COMPOSE        := docker compose
DEV_COMPOSE    := DB_PASSWORD=blog PUBLIC_URL=http://localhost:3000 JWT_SECRET=dev \
                  docker compose -f compose.yaml -f compose.dev.yaml
VOLUMES        := blog-postgres blog-uploads
BACKUP_DIR     ?= $(HOME)/backups/blog
ABOUT_ROOT     ?= /var/www/dervisgenc.com
TEST_DB_NAME   := blog-test-db
TEST_DB_URL    := postgres://postgres:test@127.0.0.1:55433/postgres?sslmode=disable
# Allocate a TTY only when there is one, so targets also work in scripts.
EXEC           := $(COMPOSE) exec $(if $(shell [ -t 0 ] && echo y),,-T)

.DEFAULT_GOAL := help
.PHONY: help up down restart build logs ps volumes admin-user db-psql db-backup \
        uploads-backup backup test test-integration dev-db dev-db-down about deploy-about

help: ## Show this help
	@awk 'BEGIN {FS = ":.*## "} /^[a-z-]+:.*## / {printf "  %-18s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

volumes:
	@for v in $(VOLUMES); do docker volume inspect $$v >/dev/null 2>&1 || docker volume create $$v >/dev/null; done

up: volumes ## Build the images and start the stack, waiting until it is healthy
	$(COMPOSE) up -d --build --wait

down: ## Stop the stack (data volumes are kept)
	$(COMPOSE) down

restart: ## Restart the application containers
	$(COMPOSE) restart backend frontend

build: ## Build the images without starting them
	$(COMPOSE) build

logs: ## Follow the logs; narrow down with: make logs SERVICE=backend
	$(COMPOSE) logs -f --tail=100 $(SERVICE)

ps: ## Show container status and health
	$(COMPOSE) ps

admin-user: ## Create an admin or reset its password: make admin-user USERNAME=name
	@test -n "$(USERNAME)" || { echo "usage: make admin-user USERNAME=name"; exit 1; }
	$(EXEC) backend admin-user -username '$(USERNAME)'

db-psql: ## Open psql, or run SQL from stdin: make db-psql < file.sql
	$(EXEC) db sh -c 'psql -v ON_ERROR_STOP=1 -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"'

db-backup: ## Dump the database to BACKUP_DIR (~/backups/blog)
	umask 077 && mkdir -p $(BACKUP_DIR) && \
		$(COMPOSE) exec -T db sh -c 'pg_dump -U "$$POSTGRES_USER" -d "$$POSTGRES_DB" -Fc' \
		> $(BACKUP_DIR)/blog-$$(date +%Y%m%d-%H%M%S).dump
	@ls -lh $(BACKUP_DIR) | tail -n 3

uploads-backup: ## Archive the uploaded images to BACKUP_DIR
	umask 077 && mkdir -p $(BACKUP_DIR) && \
		docker run --rm -v blog-uploads:/data:ro alpine tar -C /data -czf - . \
		> $(BACKUP_DIR)/uploads-$$(date +%Y%m%d-%H%M%S).tar.gz
	@ls -lh $(BACKUP_DIR) | tail -n 3

backup: db-backup uploads-backup ## Back up the database and the uploaded images

test: ## Run unit tests and linters
	cd backend && go vet ./... && go test -race ./...
	cd frontend && npm run lint && npx tsc --noEmit

test-integration: ## Run all backend tests against a throwaway PostgreSQL
	docker run -d --rm --name $(TEST_DB_NAME) -e POSTGRES_PASSWORD=test \
		-p 127.0.0.1:55433:5432 postgres:18-trixie >/dev/null
	until docker exec $(TEST_DB_NAME) pg_isready -h 127.0.0.1 -q; do sleep 1; done
	cd backend && TEST_DATABASE_URL='$(TEST_DB_URL)' go test -race -count=1 ./...; \
		status=$$?; docker rm -fv $(TEST_DB_NAME) >/dev/null; exit $$status

dev-db: ## Start a development PostgreSQL on 127.0.0.1:55432
	@for v in blog-dev-postgres blog-dev-uploads; do docker volume inspect $$v >/dev/null 2>&1 || docker volume create $$v >/dev/null; done
	$(DEV_COMPOSE) up -d --wait db

dev-db-down: ## Stop the development PostgreSQL
	$(DEV_COMPOSE) down

about: ## Build the static about site into about/out/
	cd about && npm ci --no-audit --no-fund && npm run build

deploy-about: about ## Publish the about site to ABOUT_ROOT
	rsync -rlpt --delete --chmod=D755,F644 about/out/ $(ABOUT_ROOT)/
