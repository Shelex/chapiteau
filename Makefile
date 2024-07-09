# Makefile
include .env

# Export all variables
export


# Define variables
BINARY_NAME=chapiteau
BUILD_DIR=bin
AIR_CMD=air -c .air.toml --build.bin "$(BUILD_DIR)/$(BINARY_NAME)"
GOOSE_CMD=goose
MIGRATION_DIR=migrations

# Default target
.PHONY: all
all: build

# Build the binary
.PHONY: build
build:
	@echo "Building the binary..."
	@go build -o $(BUILD_DIR)/$(BINARY_NAME) ./cmd

# Run the binary
.PHONY: run
run: build
	@echo "Running the binary..."
	@./$(BUILD_DIR)/$(BINARY_NAME)

# Development with live reload
.PHONY: dev
dev:
	@echo "Starting development with live reload..."
	@$(AIR_CMD)

# Clean the build directory
.PHONY: clean
clean:
	@echo "Cleaning the build directory..."
	@rm -rf $(BUILD_DIR)

# Install dependencies
.PHONY: deps
deps:
	@echo "Installing dependencies..."
	@go mod tidy

# Run tests
.PHONY: test
test:
	@echo "Running tests..."
	@go test ./...

.PHONY: migrate-create
migrate-create:
	@read -p "Enter migration name: " name; \
	$(GOOSE_CMD) -dir $(MIGRATION_DIR) create $$name sql

# Apply migrations
.PHONY: migrate-up
migrate-up:
	@$(GOOSE_CMD) -dir $(MIGRATION_DIR) postgres "$(DATABASE_URL)" up

# Rollback migrations
.PHONY: migrate-down
migrate-down:
	@$(GOOSE_CMD) -dir $(MIGRATION_DIR) postgres "$(DATABASE_URL)" down


# Help
.PHONY: help
help:
	@echo "Makefile commands:"
	@echo "  make          - Build the binary"
	@echo "  make build    - Build the binary"
	@echo "  make run      - Build and run the binary"
	@echo "  make dev      - Start development with live reload"
	@echo "  make clean    - Clean the build directory"
	@echo "  make deps     - Install dependencies"
	@echo "  make test     - Run tests"
	@echo "  make migrate-create - Create a new migration"
	@echo "  make migrate-up     - Apply migrations"
	@echo "  make migrate-down   - Rollback migrations"
	@echo "  make help     - Show this help message"