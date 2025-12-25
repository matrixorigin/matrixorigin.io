#!/bin/bash

# MatrixOne Test Environment Management Script

set -e

COMPOSE_FILE="docker-compose.test.yml"
CONTAINER_NAME="mo-test"
MAX_WAIT=60

# Parse command line arguments
# Usage:
#   ./mo-test-env.sh start                                    # Use latest
#   ./mo-test-env.sh start v1.2.0                             # Use specific version
#   ./mo-test-env.sh start --image matrixorigin/matrixone:commit-abc1234
#   ./mo-test-env.sh start --image ccr.ccs.tencentyun.com/matrixone-dev/matrixone:commit-abc1234

ACTION="${1:-}"
shift || true

# Initialize variables
MO_IMAGE_ARG=""
MO_VERSION_ARG=""

# Parse remaining arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --image)
            MO_IMAGE_ARG="$2"
            shift 2
            ;;
        *)
            # Treat as version if not a flag
            MO_VERSION_ARG="$1"
            shift
            ;;
    esac
done

# Determine final image
# Priority: --image > version arg > MO_IMAGE env > MO_VERSION env > latest
if [ -n "$MO_IMAGE_ARG" ]; then
    export MO_IMAGE="$MO_IMAGE_ARG"
    export MO_VERSION=""  # Clear version when using full image
    DISPLAY_IMAGE="$MO_IMAGE"
elif [ -n "$MO_VERSION_ARG" ]; then
    export MO_VERSION="$MO_VERSION_ARG"
    export MO_IMAGE=""  # Let docker-compose use MO_VERSION
    DISPLAY_IMAGE="matrixorigin/matrixone:${MO_VERSION}"
elif [ -n "${MO_IMAGE:-}" ]; then
    DISPLAY_IMAGE="$MO_IMAGE"
elif [ -n "${MO_VERSION:-}" ]; then
    DISPLAY_IMAGE="matrixorigin/matrixone:${MO_VERSION}"
else
    export MO_VERSION="latest"
    DISPLAY_IMAGE="matrixorigin/matrixone:latest"
fi

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }

start_mo() {
    echo "🚀 Starting MatrixOne test instance..."
    echo "   Image: ${DISPLAY_IMAGE}"
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_warning "Container already exists, stopping old container first..."
        docker-compose -f "$COMPOSE_FILE" down
    fi
    docker-compose -f "$COMPOSE_FILE" up -d
    print_success "Container started (${DISPLAY_IMAGE})"
    echo "⏳ Waiting for MatrixOne to start completely..."
    wait_for_mo
}

wait_for_mo() {
    local elapsed=0
    local interval=3
    local max_wait=120  # Increased to 120 seconds, first startup needs more time

    while [ $elapsed -lt $max_wait ]; do
        # Method 1: Directly test connection if mysql client is installed locally
        if command -v mysql &> /dev/null; then
            if mysql -h127.0.0.1 -P6001 -uroot -p111 -e "SELECT 1" > /dev/null 2>&1; then
                print_success "MatrixOne is ready! (Elapsed time: ${elapsed}s)"
                return 0
            fi
        # Method 2: Check port using nc
        elif command -v nc &> /dev/null; then
            if nc -z 127.0.0.1 6001 > /dev/null 2>&1; then
                print_success "MatrixOne port is ready! (Elapsed time: ${elapsed}s)"
                return 0
            fi
        # Method 3: Check Docker health status
        else
            local health_status=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "unknown")
            if [ "$health_status" = "healthy" ]; then
                print_success "MatrixOne is ready! (Elapsed time: ${elapsed}s)"
                return 0
            fi
        fi

        echo -n "."
        sleep $interval
        elapsed=$((elapsed + interval))
    done

    echo ""
    print_error "MatrixOne startup timed out (${max_wait}s)"
    print_warning "Container may still be starting, please test manually after a few minutes"
    print_warning "View logs: docker logs $CONTAINER_NAME"
    print_warning "View status: docker ps"
    return 1
}

stop_mo() {
    echo "🛑 Stopping MatrixOne test instance..."
    docker-compose -f "$COMPOSE_FILE" down
    print_success "Stopped successfully"
}

status_mo() {
    echo "📊 MatrixOne status:"
    docker-compose -f "$COMPOSE_FILE" ps
}

test_mo() {
    echo "🧪 Testing MatrixOne connection..."

    # Method 1: Use local mysql client
    if command -v mysql &> /dev/null; then
        if mysql -h127.0.0.1 -P6001 -uroot -p111 -e "SELECT VERSION()"; then
            print_success "Connection successful!"
            return 0
        fi
    else
        print_warning "mysql client is not installed locally"
        print_warning "You can install it: brew install mysql-client"
        echo ""
    fi

    # Method 2: Check port using nc
    if command -v nc &> /dev/null; then
        if nc -z 127.0.0.1 6001 > /dev/null 2>&1; then
            print_success "Port 6001 is accessible"
            print_warning "But cannot test SQL connection (mysql client missing)"
            return 0
        else
            print_error "Port 6001 is not accessible"
            return 1
        fi
    fi

    # Method 3: Check container status
    local health_status=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "unknown")
    echo "Container health status: $health_status"

    if [ "$health_status" = "healthy" ]; then
        print_success "Container health check passed"
        return 0
    else
        print_warning "Container may still be starting up"
        print_warning "Please try again later or install mysql client for testing"
        return 1
    fi
}

case "${ACTION}" in
    start) start_mo ;;
    stop) stop_mo ;;
    status) status_mo ;;
    test) test_mo ;;
    *)
        echo "Usage: $0 {start|stop|status|test} [options]"
        echo ""
        echo "Options:"
        echo "  --image <image>    Use specific Docker image (e.g., matrixorigin/matrixone:commit-abc1234)"
        echo "  <version>          Use specific version tag (e.g., v1.2.0, latest)"
        echo ""
        echo "Examples:"
        echo "  $0 start                                    # Use latest"
        echo "  $0 start v1.2.0                             # Use version v1.2.0"
        echo "  $0 start --image matrixorigin/matrixone:commit-abc1234"
        exit 1
        ;;
esac