.PHONY: dev build up down logs clean install

## Install frontend dependencies
install:
	cd frontend && npm install

## Run development servers (backend + frontend separately)
dev-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

## Build Docker images
build:
	docker compose build

## Start all services with Docker
up:
	docker compose up -d

## Stop all services
down:
	docker compose down

## View logs
logs:
	docker compose logs -f

## Type-check frontend
type-check:
	cd frontend && npm run type-check

## Lint backend
lint-backend:
	cd backend && ruff check app/ && ruff format --check app/

## Full clean
clean:
	docker compose down -v --rmi local
	cd frontend && rm -rf dist node_modules

## Quick status
status:
	docker compose ps

## Open app in browser (Linux)
open:
	xdg-open http://localhost:8080 2>/dev/null || open http://localhost:8080
