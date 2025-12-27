#!/bin/bash

# MatrixOne Test Environment Management Script
#
# Usage:
#   ./mo-test-env.sh start              # Try latest commit from Tencent TCR, fallback to Docker Hub nightly
#   ./mo-test-env.sh start 3.0.4        # Try release 3.0.4, fallback to latest nightly
#   ./mo-test-env.sh stop               # Stop container
#   ./mo-test-env.sh status             # Show container status
#   ./mo-test-env.sh test               # Test database connection

set -e

COMPOSE_FILE="docker-compose.test.yml"
CONTAINER_NAME="mo-test"
DOCKER_HUB_REPO="matrixorigin/matrixone"
DOCKER_HUB_API="https://hub.docker.com/v2/repositories/matrixorigin/matrixone/tags"
ALIYUN_REPO="registry.cn-shanghai.aliyuncs.com/matrixorigin/matrixone"
TENCENT_TCR_REPO="ccr.ccs.tencentyun.com/matrixone-dev/matrixone"
MO_GITHUB_API_BASE="https://api.github.com/repos/matrixorigin/matrixone"
FALLBACK_NIGHTLY_TAG="nightly-d4051aeb"

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

# Find the latest x.x-dev branch (e.g., 3.0-dev > 2.2-dev)
# Returns: branch name (e.g., "3.0-dev") or empty if not found
get_latest_dev_branch() {
    local branches_response
    branches_response=$(curl -s --connect-timeout 10 --max-time 30 "${MO_GITHUB_API_BASE}/branches?per_page=100" 2>/dev/null)

    if [ -z "$branches_response" ]; then
        return 1
    fi

    # Extract branch names matching x.x-dev pattern, sort by version number descending
    local latest_dev
    latest_dev=$(echo "$branches_response" | grep '"name":' | grep '\-dev"' | \
        sed 's/.*"name": "//;s/".*//' | \
        sort -t. -k1,1nr -k2,2nr | \
        head -1)

    if [ -n "$latest_dev" ]; then
        echo "$latest_dev"
        return 0
    fi

    return 1
}

# Fetch commits from a branch with timestamp
# Returns: lines of "timestamp sha branch" format
fetch_branch_commits() {
    local branch="$1"
    local api_url="${MO_GITHUB_API_BASE}/commits?sha=${branch}&per_page=5"

    local response
    response=$(curl -s --connect-timeout 10 --max-time 30 "$api_url" 2>/dev/null)

    if [ -z "$response" ]; then
        return 1
    fi

    # Extract commit SHA and date, output as "ISO_DATE SHORT_SHA BRANCH"
    # The date field appears as "date": "2024-01-15T10:30:00Z"
    echo "$response" | \
        grep -E '("sha":|"date":)' | \
        paste - - | \
        grep -E '"sha":.*"date":' | \
        sed 's/.*"sha": "\([^"]*\)".*"date": "\([^"]*\)".*/\2 \1/' | \
        while read -r date sha; do
            # Output: ISO date + short SHA (7 chars) + branch name
            echo "$date ${sha:0:7} $branch"
        done
}

# Get latest commits from MatrixOne main and latest dev branch
# Merges, deduplicates, sorts by time, and tries to pull from Tencent TCR
# Returns: full image path if successful, empty string if failed
get_latest_mo_commit_image() {
    print_info "Fetching commits from main and latest dev branch..." >&2

    local all_commits=""

    # Fetch from main branch
    print_info "Fetching from main branch..." >&2
    local main_commits
    main_commits=$(fetch_branch_commits "main")
    if [ -n "$main_commits" ]; then
        all_commits="$main_commits"
        print_success "Got commits from main" >&2
    else
        print_warning "Failed to fetch from main branch" >&2
    fi

    # Find and fetch from latest dev branch
    local dev_branch
    dev_branch=$(get_latest_dev_branch)
    if [ -n "$dev_branch" ]; then
        print_info "Found latest dev branch: ${dev_branch}" >&2
        local dev_commits
        dev_commits=$(fetch_branch_commits "$dev_branch")
        if [ -n "$dev_commits" ]; then
            if [ -n "$all_commits" ]; then
                all_commits="${all_commits}"$'\n'"${dev_commits}"
            else
                all_commits="$dev_commits"
            fi
            print_success "Got commits from ${dev_branch}" >&2
        else
            print_warning "Failed to fetch from ${dev_branch}" >&2
        fi
    else
        print_warning "No dev branch found" >&2
    fi

    if [ -z "$all_commits" ]; then
        print_warning "Failed to fetch commits from any branch" >&2
        return 1
    fi

    # Sort by timestamp (newest first), deduplicate by SHA, take top 5
    # Note: Using sort -uk2,2 for macOS compatibility instead of awk
    local sorted_commits
    sorted_commits=$(echo "$all_commits" | sort -rk1 | sort -uk2,2 | sort -rk1 | head -5)

    if [ -z "$sorted_commits" ]; then
        print_warning "No commits after deduplication" >&2
        return 1
    fi

    print_info "Top 5 commits (sorted by time):" >&2
    echo "$sorted_commits" | while read -r date sha branch; do
        echo "   ${sha} ${date} (${branch})" >&2
    done

    # Try each commit in order (latest first)
    # Note: Using for loop instead of while to avoid subshell issues
    local commit_count=0
    local commit_array
    commit_array=$(echo "$sorted_commits")

    while IFS= read -r line; do
        commit_count=$((commit_count + 1))
        local date=$(echo "$line" | cut -d' ' -f1)
        local commit_sha=$(echo "$line" | cut -d' ' -f2)
        local branch=$(echo "$line" | cut -d' ' -f3)

        if [ -z "$commit_sha" ]; then
            continue
        fi

        print_info "[${commit_count}/5] Trying commit: ${commit_sha} (${branch})" >&2

        local tcr_image="${TENCENT_TCR_REPO}:commit-${commit_sha}"

        # Try to pull from Tencent TCR
        if docker pull "$tcr_image" >&2 2>&1; then
            print_success "Pulled from Tencent TCR: commit-${commit_sha}" >&2
            echo "$tcr_image"
            return 0
        else
            print_warning "Image not available: commit-${commit_sha}" >&2
        fi
    done <<< "$commit_array"

    print_warning "No available image found in latest 5 commits" >&2
    return 1
}

# Get latest nightly tag from Docker Hub
get_latest_nightly() {
    print_info "Fetching latest nightly tag from Docker Hub..." >&2

    # Query Docker Hub API for tags starting with "nightly-"
    local api_response
    local latest_nightly

    api_response=$(curl -s --connect-timeout 10 --max-time 30 "${DOCKER_HUB_API}?page_size=20&name=nightly" 2>/dev/null)

    if [ -n "$api_response" ]; then
        # Extract first nightly tag name from JSON response
        latest_nightly=$(echo "$api_response" | grep -o '"name":"nightly-[^"]*"' | head -1 | sed 's/"name":"//;s/"$//')
    fi

    if [ -n "$latest_nightly" ]; then
        echo "$latest_nightly"
    else
        # Fallback to hardcoded nightly tag
        print_warning "API failed, using fallback nightly tag: ${FALLBACK_NIGHTLY_TAG}" >&2
        echo "$FALLBACK_NIGHTLY_TAG"
    fi
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

# Resolve which image tag to use
# - With version arg: try release first, fallback to nightly
# - Without version arg: use latest nightly
# Returns: tag only (not full image path)
resolve_image_tag() {
    local version="$1"

    if [ -n "$version" ]; then
        # Version specified, try release first
        print_info "Checking release tag: ${version}" >&2

        if image_exists "$version"; then
            print_success "Release tag found: ${version}" >&2
            echo "${version}"
            return 0
        else
            print_warning "Release tag not found: ${version}" >&2
            print_info "Falling back to latest nightly..." >&2
        fi
    fi

    # Use latest nightly
    local nightly_tag
    nightly_tag=$(get_latest_nightly)

    if [ -z "$nightly_tag" ]; then
        print_error "Could not determine nightly tag" >&2
        return 1
    fi

    print_success "Using nightly: ${nightly_tag}" >&2
    echo "${nightly_tag}"
}

# Try to pull image, returns 0 on success, 1 on failure
try_pull() {
    local image="$1"

    print_info "Pulling ${image}..." >&2

    if docker pull "$image" >&2; then
        return 0
    else
        return 1
    fi
}

# Pull image with fallback: Docker Hub -> Aliyun
pull_image_with_fallback() {
    local tag="$1"
    local dockerhub_image="${DOCKER_HUB_REPO}:${tag}"
    local aliyun_image="${ALIYUN_REPO}:${tag}"

    # Try Docker Hub first
    print_info "Trying Docker Hub: ${dockerhub_image}" >&2
    if try_pull "$dockerhub_image"; then
        print_success "Pulled from Docker Hub" >&2
        echo "$dockerhub_image"
        return 0
    fi

    # Fallback to Aliyun
    echo "" >&2
    print_warning "Docker Hub failed, trying Aliyun mirror..." >&2
    print_info "Trying Aliyun: ${aliyun_image}" >&2
    if try_pull "$aliyun_image"; then
        print_success "Pulled from Aliyun mirror" >&2
        echo "$aliyun_image"
        return 0
    fi

    # Both failed
    print_error "Failed to pull from both Docker Hub and Aliyun" >&2
    return 1
}

start_mo() {
    echo "============================================================"
    echo "🚀 Starting MatrixOne Test Environment"
    echo "============================================================"

    local image=""

    # Step 1: Clean up old container first
    echo ""
    echo "🧹 Step 1: Cleaning up old container..."

    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_warning "Container '${CONTAINER_NAME}' exists, removing..."
        docker compose -f "$COMPOSE_FILE" down 2>/dev/null || true
    else
        print_success "No existing container"
    fi

    # Step 2: Try to get image (priority: Tencent TCR with latest commit > Docker Hub nightly > Aliyun)
    echo ""
    echo "📥 Step 2: Pulling Docker image..."

    # Priority 1: Try latest commit from Tencent TCR (if no version specified)
    if [ -z "$VERSION_ARG" ]; then
        echo ""
        print_info "Trying to get latest commit image from Tencent TCR..."
        image=$(get_latest_mo_commit_image) || true
    fi

    # Priority 2: Fall back to Docker Hub nightly / Aliyun
    if [ -z "$image" ]; then
        echo ""
        print_info "Falling back to Docker Hub / Aliyun..."

        local tag
        tag=$(resolve_image_tag "$VERSION_ARG")

        if [ -z "$tag" ]; then
            print_error "Failed to resolve image tag"
            exit 1
        fi

        echo "   Tag: ${tag}"
        image=$(pull_image_with_fallback "$tag")
    fi

    if [ -z "$image" ]; then
        print_error "Failed to pull image"
        exit 1
    fi

    # Export for docker compose
    export MO_IMAGE="$image"

    # Step 3: Start container
    echo ""
    echo "🐳 Step 3: Starting container..."

    docker compose -f "$COMPOSE_FILE" up -d
    print_success "Container started"

    # Step 4: Wait for database
    echo ""
    echo "⏳ Step 4: Waiting for database to be ready..."

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
    docker compose -f "$COMPOSE_FILE" down 2>/dev/null || true
    print_success "Stopped"
}

status_mo() {
    echo "📊 MatrixOne Status:"
    docker compose -f "$COMPOSE_FILE" ps
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
        echo "                   - Without version: try latest commit from Tencent TCR, fallback to Docker Hub nightly"
        echo "                   - With version: try release, fallback to nightly"
        echo "  stop             Stop and remove container"
        echo "  status           Show container status"
        echo "  test             Test database connection"
        echo ""
        echo "Examples:"
        echo "  $0 start              # Latest commit from Tencent TCR or Docker Hub nightly"
        echo "  $0 start 3.0.4        # Release 3.0.4 or fallback to nightly"
        echo "  $0 stop"
        echo "  $0 test"
        exit 1
        ;;
esac
