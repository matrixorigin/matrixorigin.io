#!/bin/bash

# MatrixOne Test Environment Management Script
#
# Usage:
#   ./mo-test-env.sh start              # Pull latest nightly and start
#   ./mo-test-env.sh start 3.0.4        # Try release 3.0.4, fallback to latest nightly
#   ./mo-test-env.sh stop               # Stop container
#   ./mo-test-env.sh status             # Show container status
#   ./mo-test-env.sh test               # Test database connection

set -e

COMPOSE_FILE="docker-compose.test.yml"
CONTAINER_NAME="mo-test"
DOCKER_HUB_REPO="matrixorigin/matrixone"
DOCKER_HUB_API="https://hub.docker.com/v2/repositories/matrixorigin/matrixone/tags"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_info() { echo -e "${CYAN}ℹ${NC} $1"; }

# Parse command line arguments
ACTION="${1:-}"
VERSION_ARG="${2:-}"

# Get latest nightly tag from Docker Hub
get_latest_nightly() {
    print_info "Fetching latest nightly tag from Docker Hub..."

    # Query Docker Hub API for tags starting with "nightly-"
    local latest_nightly
    latest_nightly=$(curl -s "${DOCKER_HUB_API}?page_size=50&ordering=last_updated" | \
        grep -o '"name":"nightly-[^"]*"' | \
        head -1 | \
        sed 's/"name":"//;s/"//')

    if [ -z "$latest_nightly" ]; then
        print_error "Failed to fetch latest nightly tag"
        return 1
    fi

    echo "$latest_nightly"
}

# Check if a Docker image exists on Docker Hub
image_exists() {
    local tag="$1"
    local response

    response=$(curl -s -o /dev/null -w "%{http_code}" "${DOCKER_HUB_API}/${tag}")

    if [ "$response" = "200" ]; then
        return 0
    else
        return 1
    fi
}

# Resolve which image to use
# - With version arg: try release first, fallback to nightly
# - Without version arg: use latest nightly
resolve_image() {
    local version="$1"

    if [ -n "$version" ]; then
        # Version specified, try release first
        print_info "Checking release image: ${DOCKER_HUB_REPO}:${version}"

        if image_exists "$version"; then
            print_success "Release image found: ${version}"
            echo "${DOCKER_HUB_REPO}:${version}"
            return 0
        else
            print_warning "Release image not found: ${version}"
            print_info "Falling back to latest nightly..."
        fi
    fi

    # Use latest nightly
    local nightly_tag
    nightly_tag=$(get_latest_nightly)

    if [ -z "$nightly_tag" ]; then
        print_error "Could not determine nightly tag"
        return 1
    fi

    print_success "Using nightly: ${nightly_tag}"
    echo "${DOCKER_HUB_REPO}:${nightly_tag}"
}

start_mo() {
    echo "============================================================"
    echo "🚀 Starting MatrixOne Test Environment"
    echo "============================================================"

    # Step 1: Resolve image
    echo ""
    echo "📌 Step 1: Resolving Docker image..."

    local image
    image=$(resolve_image "$VERSION_ARG")

    if [ -z "$image" ]; then
        print_error "Failed to resolve Docker image"
        exit 1
    fi

    echo "   Final image: ${image}"

    # Export for docker-compose
    export MO_IMAGE="$image"

    # Step 2: Clean up old container
    echo ""
    echo "🧹 Step 2: Cleaning up old container..."

    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_warning "Container '${CONTAINER_NAME}' exists, removing..."
        docker-compose -f "$COMPOSE_FILE" down 2>/dev/null || true
    else
        print_success "No existing container"
    fi

    # Step 3: Pull image
    echo ""
    echo "📥 Step 3: Pulling Docker image..."

    if docker pull "$image"; then
        print_success "Image pulled successfully"
    else
        print_error "Failed to pull image: ${image}"
        exit 1
    fi

    # Step 4: Start container
    echo ""
    echo "🐳 Step 4: Starting container..."

    docker-compose -f "$COMPOSE_FILE" up -d
    print_success "Container started"

    # Step 5: Wait for database
    echo ""
    echo "⏳ Step 5: Waiting for database to be ready..."

    if wait_for_mo; then
        echo ""
        echo "============================================================"
        print_success "MatrixOne is ready!"
        echo "   Image: ${image}"
        echo "   Host: 127.0.0.1"
        echo "   Port: 6001"
        echo "   User: root"
        echo "   Password: 111"
        echo "============================================================"
        return 0
    else
        echo ""
        echo "============================================================"
        print_error "MatrixOne failed to start"
        echo "   Check logs: docker logs ${CONTAINER_NAME}"
        echo "============================================================"
        return 1
    fi
}

wait_for_mo() {
    local elapsed=0
    local interval=3
    local max_wait=180  # 3 minutes max

    while [ $elapsed -lt $max_wait ]; do
        # Try MySQL connection
        if command -v mysql &> /dev/null; then
            if mysql -h127.0.0.1 -P6001 -uroot -p111 -e "SELECT 1" > /dev/null 2>&1; then
                print_success "Database connection verified (${elapsed}s)"
                return 0
            fi
        # Fallback: check port
        elif command -v nc &> /dev/null; then
            if nc -z 127.0.0.1 6001 > /dev/null 2>&1; then
                print_success "Port 6001 is accessible (${elapsed}s)"
                return 0
            fi
        # Fallback: check container health
        else
            local health
            health=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "unknown")
            if [ "$health" = "healthy" ]; then
                print_success "Container is healthy (${elapsed}s)"
                return 0
            fi
        fi

        # Progress indicator
        if [ $((elapsed % 15)) -eq 0 ] && [ $elapsed -gt 0 ]; then
            echo "   Still waiting... (${elapsed}s)"
        else
            echo -n "."
        fi

        sleep $interval
        elapsed=$((elapsed + interval))
    done

    echo ""
    print_error "Timeout after ${max_wait}s"
    return 1
}

stop_mo() {
    echo "🛑 Stopping MatrixOne..."
    docker-compose -f "$COMPOSE_FILE" down 2>/dev/null || true
    print_success "Stopped"
}

status_mo() {
    echo "📊 MatrixOne Status:"
    docker-compose -f "$COMPOSE_FILE" ps
}

test_mo() {
    echo "🧪 Testing MatrixOne connection..."

    if command -v mysql &> /dev/null; then
        if mysql -h127.0.0.1 -P6001 -uroot -p111 -e "SELECT VERSION() as 'MatrixOne Version'"; then
            print_success "Connection successful!"
            return 0
        else
            print_error "Connection failed"
            return 1
        fi
    else
        print_warning "mysql client not installed"

        if command -v nc &> /dev/null; then
            if nc -z 127.0.0.1 6001; then
                print_success "Port 6001 is accessible"
                print_warning "Install mysql-client for full connection test"
                return 0
            else
                print_error "Port 6001 is not accessible"
                return 1
            fi
        fi

        print_warning "Install mysql-client: brew install mysql-client"
        return 1
    fi
}

# Main
case "${ACTION}" in
    start)
        start_mo
        ;;
    stop)
        stop_mo
        ;;
    status)
        status_mo
        ;;
    test)
        test_mo
        ;;
    *)
        echo "MatrixOne Test Environment"
        echo ""
        echo "Usage: $0 {start|stop|status|test} [version]"
        echo ""
        echo "Commands:"
        echo "  start [version]  Start MatrixOne container"
        echo "                   - With version: try release, fallback to nightly"
        echo "                   - Without version: use latest nightly"
        echo "  stop             Stop and remove container"
        echo "  status           Show container status"
        echo "  test             Test database connection"
        echo ""
        echo "Examples:"
        echo "  $0 start              # Latest nightly"
        echo "  $0 start 3.0.4        # Release 3.0.4 or fallback to nightly"
        echo "  $0 stop"
        echo "  $0 test"
        exit 1
        ;;
esac
