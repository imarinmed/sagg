.PHONY: help status dev dev-backend dev-frontend stop clean restart logs check verify

# Default target
help:
	@echo "Blod Wiki - Development Commands"
	@echo ""
	@echo "Status & Control:"
	@echo "  make status          - Check if backend/frontend are running"
	@echo "  make dev             - Start both backend and frontend"
	@echo "  make dev-backend     - Start backend only (port 6698)"
	@echo "  make dev-frontend    - Start frontend only (port 6699)"
	@echo "  make sync-images     - Sync screenshots from data/ to public/"
	@echo "  make stop            - Stop all running services"
	@echo "  make restart         - Stop and restart both services"
	@echo "  make logs            - Tail logs from both services"
	@echo ""
	@echo "Verification:"
	@echo "  make check           - Quick health check (curl endpoints)"
	@echo "  make verify          - Full verification (typecheck + build)"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean           - Clean caches and stop services"
	@echo "  make clean-deep      - Deep clean (including node_modules, .venv)"
	@echo ""
	@echo "Database:"
	@echo "  make migrate         - Run database migrations"
	@echo "  make migrate-create  - Create new migration (pass MSG='description')"
	@echo ""
	@echo "Access:"
	@echo "  Frontend:  http://localhost:6699"
	@echo "  Backend:   http://localhost:6698"
	@echo "  API Docs:  http://localhost:6698/docs"

# Check if services are running
status:
	@echo "=== Service Status ==="
	@echo ""
	@echo "Backend (port 6698):"
	@ps aux | grep "[u]vicorn src.main:app" || echo "  ❌ Not running"
	@echo ""
	@echo "Frontend (port 6699):"
	@ps aux | grep "[n]ext-server" || echo "  ❌ Not running"
	@echo ""
	@echo "Ports in use:"
	@lsof -i :6698 -i :6699 | grep LISTEN || echo "  No services listening"

# Start both services (parallel) - kills prior instances first
dev:
	@echo "🚀 Starting Blod Wiki platform..."
	@echo ""
	@echo "🖼️  Syncing screenshots..."
	@bash scripts/sync-screenshots.sh || echo "⚠️  Screenshot sync failed, continuing..."
	@echo ""
	@echo "🛑 Stopping any existing services..."
	@pkill -9 -f "uvicorn src.main:app" 2>/dev/null || true
	@pkill -9 -f "next-server" 2>/dev/null || true
	@pkill -9 -f "bun run dev" 2>/dev/null || true
	@sleep 1
	@echo "✅ Prior instances stopped"
	@echo ""
	@echo "Backend will start on:  http://localhost:6698"
	@echo "Frontend will start on: http://localhost:6699"
	@echo ""
	@echo "Press Ctrl+C to stop both services"
	@echo ""
	@trap 'make stop' INT; \
		(cd backend && uv run uvicorn src.main:app --reload --port 6698) & \
		BACKEND_PID=$$!; \
		sleep 2; \
		(cd frontend && bun run dev) & \
		FRONTEND_PID=$$!; \
		wait $$BACKEND_PID $$FRONTEND_PID

# Start backend only - kills prior instance first
dev-backend:
	@echo "🔧 Starting backend on http://localhost:6698"
	@pkill -9 -f "uvicorn src.main:app" 2>/dev/null || true
	@sleep 1
	cd backend && uv run uvicorn src.main:app --reload --port 6698

# Start frontend only - kills prior instance first
dev-frontend:
	@echo "🌐 Starting frontend on http://localhost:6699"
	@pkill -9 -f "next-server" 2>/dev/null || true
	@pkill -9 -f "bun run dev" 2>/dev/null || true
	@sleep 1
	cd frontend && bun run dev

# Stop all services
stop:
	@echo "🛑 Stopping services..."
	@pkill -9 -f "uvicorn src.main:app" 2>/dev/null || true
	@pkill -9 -f "next-server" 2>/dev/null || true
	@pkill -9 -f "bun run dev" 2>/dev/null || true
	@echo "✅ All services stopped"

# Clean caches
clean: stop
	@echo "🧹 Cleaning caches..."
	find backend -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	cd frontend && rm -rf .next node_modules/.cache 2>/dev/null || true
	@echo "✅ Caches cleaned"

# Deep clean (removes dependencies)
clean-deep: clean
	@echo "🧹 Deep cleaning (removes dependencies)..."
	rm -rf backend/.venv
	cd frontend && rm -rf node_modules
	@echo "✅ Deep clean complete"
	@echo "⚠️  Run 'make setup' to reinstall dependencies"

# Setup/install dependencies
setup:
	@echo "📦 Installing dependencies..."
	cd backend && uv sync
	cd frontend && bun install
	@echo "✅ Dependencies installed"

# Restart services
restart: stop
	@sleep 1
	@make dev

# Quick health check
check:
	@echo "🏥 Running health checks..."
	@echo ""
	@echo "Backend API:"
	@curl -s http://localhost:6698/api/episodes | head -c 100 && echo "... ✅" || echo "❌ Backend not responding"
	@echo ""
	@echo "Frontend:"
	@curl -s http://localhost:6699 | head -c 100 && echo "... ✅" || echo "❌ Frontend not responding"

# Full verification
verify:
	@echo "✅ Running full verification..."
	@echo ""
	@echo "=== Backend Linting ==="
	cd backend && uv run ruff check .
	@echo ""
	@echo "=== Frontend TypeScript ==="
	cd frontend && bun run typecheck
	@echo ""
	@echo "=== Frontend Build ==="
	cd frontend && bun run build
	@echo ""
	@echo "✅ All verification passed!"

# Sync screenshots from data/ to frontend/public/
sync-images:
	@echo "🖼️  Syncing screenshots from data/ to public/..."
	@bash scripts/sync-screenshots.sh

# Database migrations
migrate:
	@echo "📊 Running database migrations..."
	cd backend && alembic upgrade head
	@echo "✅ Migrations complete"

migrate-create:
	@if [ -z "$(MSG)" ]; then \
		echo "❌ Usage: make migrate-create MSG='your migration description'"; \
		exit 1; \
	fi
	@echo "📝 Creating migration: $(MSG)"
	cd backend && alembic revision --autogenerate -m "$(MSG)"

# View logs (requires running in separate terminal)
logs:
	@echo "📜 Tailing logs (Ctrl+C to exit)..."
	@echo "Note: This works best if services are running in background"
	@tail -f backend/logs/*.log 2>/dev/null || echo "No log files found"
