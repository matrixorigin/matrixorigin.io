# Makefile for MatrixOne Documentation
# =====================================

.PHONY: help install install-python install-node serve serve-custom build build-strict clean lint lint-fix test check validate list-files count-pages watch version upgrade dev new-page check-links check-links-file check-links-changed check-sql-syntax check-sql-syntax-file check-sql-syntax-changed check-sql-exec check-sql-exec-file check-sql-exec-changed db-start db-stop db-status db-test check-all validate-all pre-commit setup

# Default target
.DEFAULT_GOAL := help

# Python executable
PYTHON := python3
PIP := pip3

# Node.js package manager
PNPM := pnpm

# MkDocs executable
MKDOCS := mkdocs

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)MatrixOne Documentation - Available Commands$(NC)"
	@echo "$(BLUE)=============================================$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

install: ## Install all dependencies (Python + Node.js)
	@echo "$(BLUE)Installing Python dependencies...$(NC)"
	$(PIP) install -r requirements.txt
	@echo "$(GREEN)✓ Python dependencies installed$(NC)"
	@echo "$(BLUE)Installing Node.js dependencies...$(NC)"
	$(PNPM) install --frozen-lockfile
	@echo "$(GREEN)✓ Node.js dependencies installed$(NC)"
	@echo "$(GREEN)✓ All dependencies installed successfully!$(NC)"

install-python: ## Install Python dependencies only
	@echo "$(BLUE)Installing Python dependencies...$(NC)"
	$(PIP) install -r requirements.txt
	@echo "$(GREEN)✓ Python dependencies installed$(NC)"

install-node: ## Install Node.js dependencies only
	@echo "$(BLUE)Installing Node.js dependencies...$(NC)"
	$(PNPM) install --frozen-lockfile
	@echo "$(GREEN)✓ Node.js dependencies installed$(NC)"

serve: ## Start local development server (with auto-reload)
	@echo "$(BLUE)Starting MkDocs development server...$(NC)"
	@echo "$(YELLOW)Access at: http://127.0.0.1:8000$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to stop$(NC)"
	@echo ""
	$(MKDOCS) serve

serve-custom: ## Start server on custom address (use ADDR=0.0.0.0:8080)
	@echo "$(BLUE)Starting MkDocs server on $(ADDR)...$(NC)"
	$(MKDOCS) serve -a $(ADDR)

build: ## Build static documentation site
	@echo "$(BLUE)Building documentation site...$(NC)"
	$(MKDOCS) build
	@echo "$(GREEN)✓ Documentation built successfully!$(NC)"
	@echo "$(YELLOW)Output directory: site/$(NC)"

build-strict: ## Build with strict mode (fail on warnings)
	@echo "$(BLUE)Building documentation with strict mode...$(NC)"
	$(MKDOCS) build --strict
	@echo "$(GREEN)✓ Documentation built successfully (strict mode)!$(NC)"

clean: ## Clean build artifacts and caches
	@echo "$(BLUE)Cleaning build artifacts...$(NC)"
	rm -rf site/
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@echo "$(GREEN)✓ Cleaned build artifacts$(NC)"

lint: ## Run linting checks (markdown and punctuation)
	@echo "$(BLUE)Running linting checks...$(NC)"
	$(PNPM) run lint
	@echo "$(GREEN)✓ Linting completed!$(NC)"

lint-fix: ## Auto-fix linting issues
	@echo "$(BLUE)Auto-fixing linting issues...$(NC)"
	$(PNPM) run lint:fix
	@echo "$(GREEN)✓ Linting fixes applied!$(NC)"

test: lint ## Run all tests (currently just linting)
	@echo "$(GREEN)✓ All tests passed!$(NC)"

check: ## Quick check (lint + build)
	@echo "$(BLUE)Running quick check...$(NC)"
	@$(MAKE) lint
	@$(MAKE) build-strict
	@echo "$(GREEN)✓ Quick check completed!$(NC)"

# ============================================
# Link Checking Commands
# ============================================

check-links: ## Check dead links in all markdown files
	@echo "$(BLUE)Checking dead links in all files...$(NC)"
	@$(PNPM) run check:links:files
	@echo "$(GREEN)✓ Link check completed!$(NC)"

check-links-file: ## Check dead links in a specific file (use FILE=path/to/file.md)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: FILE variable required$(NC)"; \
		echo "$(YELLOW)Usage: make check-links-file FILE=docs/MatrixOne/xxx.md$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Checking dead links in $(FILE)...$(NC)"
	@$(PNPM) run check:links:file $(FILE)
	@echo "$(GREEN)✓ Link check completed!$(NC)"

check-links-changed: ## Check dead links in changed files only
	@echo "$(BLUE)Checking dead links in changed files...$(NC)"
	@$(PNPM) run check:links:changed
	@echo "$(GREEN)✓ Link check completed!$(NC)"

# ============================================
# SQL Syntax Checking Commands
# ============================================

check-sql-syntax: ## Check SQL syntax in all markdown files
	@echo "$(BLUE)Checking SQL syntax in all files...$(NC)"
	@$(PNPM) run check:sql-syntax:files
	@echo "$(GREEN)✓ SQL syntax check completed!$(NC)"

check-sql-syntax-file: ## Check SQL syntax in a specific file (use FILE=path/to/file.md)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: FILE variable required$(NC)"; \
		echo "$(YELLOW)Usage: make check-sql-syntax-file FILE=docs/MatrixOne/xxx.md$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Checking SQL syntax in $(FILE)...$(NC)"
	@$(PNPM) run check:sql-syntax:file $(FILE)
	@echo "$(GREEN)✓ SQL syntax check completed!$(NC)"

check-sql-syntax-changed: ## Check SQL syntax in changed files only
	@echo "$(BLUE)Checking SQL syntax in changed files...$(NC)"
	@$(PNPM) run check:sql-syntax:changed
	@echo "$(GREEN)✓ SQL syntax check completed!$(NC)"

# ============================================
# SQL Execution Checking Commands
# ============================================

check-sql-exec: ## Check SQL execution in all markdown files (requires database)
	@echo "$(BLUE)Checking SQL execution in all files...$(NC)"
	@echo "$(YELLOW)Note: This requires a running database$(NC)"
	@$(PNPM) run check:sql-exec:files
	@echo "$(GREEN)✓ SQL execution check completed!$(NC)"

check-sql-exec-file: ## Check SQL execution in a specific file (use FILE=path/to/file.md)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: FILE variable required$(NC)"; \
		echo "$(YELLOW)Usage: make check-sql-exec-file FILE=docs/MatrixOne/xxx.md$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Checking SQL execution in $(FILE)...$(NC)"
	@$(PNPM) run check:sql-exec:file $(FILE)
	@echo "$(GREEN)✓ SQL execution check completed!$(NC)"

check-sql-exec-changed: ## Check SQL execution in changed files only (requires database)
	@echo "$(BLUE)Checking SQL execution in changed files...$(NC)"
	@echo "$(YELLOW)Note: This requires a running database$(NC)"
	@$(PNPM) run check:sql-exec:changed
	@echo "$(GREEN)✓ SQL execution check completed!$(NC)"

# ============================================
# Database Management Commands
# ============================================

db-start: ## Start MatrixOne test database (use VERSION=3.0.4 for specific version)
	@echo "$(BLUE)Starting MatrixOne test database...$(NC)"
	@if [ -n "$(VERSION)" ]; then \
		$(PNPM) run db:start $(VERSION); \
	else \
		$(PNPM) run db:start; \
	fi
	@echo "$(GREEN)✓ Database started!$(NC)"

db-stop: ## Stop MatrixOne test database
	@echo "$(BLUE)Stopping MatrixOne test database...$(NC)"
	@$(PNPM) run db:stop
	@echo "$(GREEN)✓ Database stopped!$(NC)"

db-status: ## Check MatrixOne test database status
	@echo "$(BLUE)Checking database status...$(NC)"
	@$(PNPM) run db:status

db-test: ## Test MatrixOne database connection
	@echo "$(BLUE)Testing database connection...$(NC)"
	@$(PNPM) run db:test

# ============================================
# Comprehensive Check Commands
# ============================================

check-all: ## Run all checks (lint + links + SQL syntax)
	@echo "$(BLUE)Running all checks...$(NC)"
	@echo "$(YELLOW)========================================$(NC)"
	@$(MAKE) lint
	@echo ""
	@$(MAKE) check-links-changed
	@echo ""
	@$(MAKE) check-sql-syntax-changed
	@echo ""
	@echo "$(GREEN)✓ All checks completed!$(NC)"

validate-all: ## Run full validation (lint + build + links + SQL syntax)
	@echo "$(BLUE)Running full validation...$(NC)"
	@echo "$(YELLOW)========================================$(NC)"
	@$(MAKE) lint
	@echo ""
	@$(MAKE) build-strict
	@echo ""
	@$(MAKE) check-links-changed
	@echo ""
	@$(MAKE) check-sql-syntax-changed
	@echo ""
	@echo "$(GREEN)✓ Full validation completed!$(NC)"

pre-commit: ## Run pre-commit checks (lint-fix + check-all)
	@echo "$(BLUE)Running pre-commit checks...$(NC)"
	@echo "$(YELLOW)========================================$(NC)"
	@$(MAKE) lint-fix
	@echo ""
	@$(MAKE) check-all
	@echo ""
	@echo "$(GREEN)✓ Pre-commit checks completed!$(NC)"

setup: install validate ## Complete setup (install + validate configuration)
	@echo "$(GREEN)✓ Setup completed!$(NC)"

deploy: ## Deploy documentation (requires proper setup)
	@echo "$(BLUE)Deploying documentation...$(NC)"
	$(MKDOCS) gh-deploy
	@echo "$(GREEN)✓ Documentation deployed!$(NC)"

new-page: ## Create new documentation page (use PAGE=path/to/page.md)
	@if [ -z "$(PAGE)" ]; then \
		echo "$(RED)Error: PAGE variable required$(NC)"; \
		echo "$(YELLOW)Usage: make new-page PAGE=docs/MatrixOne/Tutorial/my-page.md$(NC)"; \
		exit 1; \
	fi
	@mkdir -p $$(dirname $(PAGE))
	@if [ -f "$(PAGE)" ]; then \
		echo "$(RED)Error: File $(PAGE) already exists$(NC)"; \
		exit 1; \
	fi
	@echo "# Page Title\n\n## Overview\n\nYour content here.\n" > $(PAGE)
	@echo "$(GREEN)✓ Created new page: $(PAGE)$(NC)"
	@echo "$(YELLOW)Don't forget to add it to mkdocs.yml!$(NC)"

validate: ## Validate mkdocs.yml configuration
	@echo "$(BLUE)Validating mkdocs.yml...$(NC)"
	@$(PYTHON) -c "import yaml; yaml.safe_load(open('mkdocs.yml'))" && \
		echo "$(GREEN)✓ mkdocs.yml is valid$(NC)" || \
		(echo "$(RED)✗ mkdocs.yml has errors$(NC)" && exit 1)

list-files: ## List all documentation files
	@echo "$(BLUE)Documentation files:$(NC)"
	@find docs/MatrixOne -name "*.md" | sort

count-pages: ## Count total documentation pages
	@echo "$(BLUE)Total documentation pages:$(NC)"
	@find docs/MatrixOne -name "*.md" | wc -l | xargs echo "$(GREEN)" | xargs echo "$(NC)"

watch: ## Watch for changes and rebuild (alternative to serve)
	@echo "$(BLUE)Watching for changes...$(NC)"
	@echo "$(YELLOW)Building on file changes$(NC)"
	while true; do \
		$(MKDOCS) build; \
		sleep 2; \
	done

version: ## Show installed versions
	@echo "$(BLUE)Installed versions:$(NC)"
	@echo "  Python:  $$($(PYTHON) --version 2>&1 | cut -d' ' -f2)"
	@echo "  pip:     $$($(PIP) --version | cut -d' ' -f2)"
	@echo "  Node:    $$(node --version 2>/dev/null || echo 'Not installed')"
	@echo "  pnpm:    $$($(PNPM) --version 2>/dev/null || echo 'Not installed')"
	@echo "  MkDocs:  $$($(MKDOCS) --version 2>&1 | cut -d' ' -f3 || echo 'Not installed')"

upgrade: ## Upgrade dependencies
	@echo "$(BLUE)Upgrading Python dependencies...$(NC)"
	$(PIP) install --upgrade -r requirements.txt
	@echo "$(BLUE)Upgrading Node.js dependencies...$(NC)"
	$(PNPM) update
	@echo "$(GREEN)✓ Dependencies upgraded!$(NC)"

dev: install serve ## Setup dev environment and start server
	@echo "$(GREEN)✓ Development environment ready!$(NC)"

