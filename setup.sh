#!/usr/bin/env bash

# ==============================================================================
# Ocrolus Widget Quickstart - Setup Script
# ==============================================================================
# This script sets up the widget quickstart environment.
# Works on macOS, Linux, and Windows (Git Bash/WSL).
#
# Usage: ./setup.sh
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Dashboard URL
DASHBOARD_URL="https://dashboard.ocrolus.com/settings/widgets"

# ==============================================================================
# Helper Functions
# ==============================================================================

print_header() {
    echo ""
    echo -e "${MAGENTA}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${MAGENTA}  $1${NC}"
    echo -e "${MAGENTA}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_step() {
    echo -e "\n${BOLD}${BLUE}[$1]${NC} ${BOLD}$2${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

# Detect operating system
detect_os() {
    case "$(uname -s)" in
        Linux*)     OS="Linux";;
        Darwin*)    OS="macOS";;
        CYGWIN*)    OS="Windows";;
        MINGW*)     OS="Windows";;
        MSYS*)      OS="Windows";;
        *)          OS="Unknown";;
    esac
    echo "$OS"
}

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ==============================================================================
# Prerequisites Check
# ==============================================================================

check_prerequisites() {
    print_step "1" "Checking Prerequisites"
    
    local all_ok=true
    
    # Check mkcert
    if command_exists mkcert; then
        print_success "mkcert is installed"
    else
        print_error "mkcert is not installed"
        all_ok=false
    fi
    
    # Check Docker
    if command_exists docker; then
        print_success "Docker is installed"
        
        # Check if Docker is running
        if docker info >/dev/null 2>&1; then
            print_success "Docker is running"
        else
            print_warning "Docker is installed but not running"
            print_info "Start Docker Desktop to use Docker mode"
        fi
    else
        print_warning "Docker is not installed (required for Docker mode)"
    fi
    
    # Check Node.js
    if command_exists node; then
        local node_version=$(node --version)
        print_success "Node.js is installed ($node_version)"
    else
        print_warning "Node.js is not installed (required for local mode)"
    fi
    
    if [ "$all_ok" = false ]; then
        echo ""
        echo -e "${YELLOW}Please install the missing prerequisites:${NC}"
        echo ""
        echo -e "${BOLD}mkcert:${NC}"
        case "$(detect_os)" in
            "macOS")
                echo "  brew install mkcert"
                ;;
            "Linux")
                echo "  # Ubuntu/Debian:"
                echo "  sudo apt install libnss3-tools"
                echo "  curl -JLO \"https://dl.filippo.io/mkcert/latest?for=linux/amd64\""
                echo "  chmod +x mkcert-v*-linux-amd64"
                echo "  sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert"
                ;;
            "Windows")
                echo "  choco install mkcert"
                echo "  # Or download from: https://github.com/FiloSottile/mkcert/releases"
                ;;
        esac
        echo ""
        echo -e "${BOLD}Docker:${NC}"
        echo "  https://docs.docker.com/get-docker/"
        echo ""
        exit 1
    fi
}

# ==============================================================================
# Hosts File Configuration
# ==============================================================================

check_hosts_file() {
    print_step "2" "Checking Hosts File Configuration"
    
    local os=$(detect_os)
    local hosts_file
    local needs_update=false
    
    case "$os" in
        "Windows")
            hosts_file="/c/Windows/System32/drivers/etc/hosts"
            # Also try the Windows path format
            if [ ! -f "$hosts_file" ]; then
                hosts_file="C:\\Windows\\System32\\drivers\\etc\\hosts"
            fi
            ;;
        *)
            hosts_file="/etc/hosts"
            ;;
    esac
    
    # Check if entries exist
    if grep -q "www.ocrolusexample.com" "$hosts_file" 2>/dev/null; then
        print_success "www.ocrolusexample.com is configured"
    else
        needs_update=true
    fi
    
    if grep -q "auth.ocrolusexample.com" "$hosts_file" 2>/dev/null; then
        print_success "auth.ocrolusexample.com is configured"
    else
        needs_update=true
    fi
    
    if [ "$needs_update" = true ]; then
        print_warning "Hosts file needs to be updated"
        echo ""
        echo -e "${YELLOW}Please add the following entries to your hosts file:${NC}"
        echo ""
        
        case "$os" in
            "macOS"|"Linux")
                echo -e "${CYAN}File: /etc/hosts${NC}"
                echo ""
                echo "  127.0.0.1 www.ocrolusexample.com"
                echo "  127.0.0.1 auth.ocrolusexample.com"
                echo ""
                echo -e "${BOLD}Run these commands:${NC}"
                echo "  sudo sh -c 'echo \"127.0.0.1 www.ocrolusexample.com\" >> /etc/hosts'"
                echo "  sudo sh -c 'echo \"127.0.0.1 auth.ocrolusexample.com\" >> /etc/hosts'"
                ;;
            "Windows")
                echo -e "${CYAN}File: C:\\Windows\\System32\\drivers\\etc\\hosts${NC}"
                echo ""
                echo "  127.0.0.1 www.ocrolusexample.com"
                echo "  127.0.0.1 auth.ocrolusexample.com"
                echo ""
                echo -e "${BOLD}Steps:${NC}"
                echo "  1. Open Notepad as Administrator"
                echo "  2. Open C:\\Windows\\System32\\drivers\\etc\\hosts"
                echo "  3. Add the two lines above"
                echo "  4. Save and close"
                ;;
        esac
        
        echo ""
        read -p "Press Enter after updating your hosts file (or 'skip' to continue anyway): " response
        if [ "$response" != "skip" ]; then
            # Re-check
            if ! grep -q "www.ocrolusexample.com" "$hosts_file" 2>/dev/null; then
                print_warning "Hosts file still not updated. You may have issues accessing the demo."
            else
                print_success "Hosts file updated successfully"
            fi
        fi
    else
        print_success "Hosts file is properly configured"
    fi
}

# ==============================================================================
# Get Widget Credentials
# ==============================================================================

get_credentials() {
    print_step "3" "Widget Configuration"
    
    echo ""
    echo -e "${BOLD}Get your Widget credentials from the Ocrolus Dashboard:${NC}"
    echo -e "${CYAN}$DASHBOARD_URL${NC}"
    echo ""
    echo "1. Log in to your Ocrolus account"
    echo "2. Go to Account & Settings → Embedded Widget"
    echo "3. Create a new widget or select an existing one"
    echo "4. Copy the Widget UUID, Client ID, and Client Secret"
    echo ""
    echo -e "${YELLOW}IMPORTANT: Add 'www.ocrolusexample.com' to your widget's Allowed URLs!${NC}"
    echo ""
    
    # Check if .env already exists
    if [ -f ".env" ]; then
        print_info "Existing .env file found"
        read -p "Do you want to reconfigure? (y/n): " reconfigure
        if [ "$reconfigure" != "y" ] && [ "$reconfigure" != "Y" ]; then
            print_info "Keeping existing configuration"
            return 0
        fi
    fi
    
    # Prompt for credentials
    read -p "Widget UUID: " WIDGET_UUID
    read -p "Client ID: " CLIENT_ID
    read -p "Client Secret: " CLIENT_SECRET
    
    # Validate inputs
    if [ -z "$WIDGET_UUID" ] || [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
        print_error "All credentials are required"
        exit 1
    fi
    
    # Create .env file
    cat > .env << EOF
# Ocrolus Widget Quickstart Configuration
# Generated by setup.sh on $(date)

# Widget credentials from $DASHBOARD_URL
OCROLUS_WIDGET_UUID=$WIDGET_UUID
OCROLUS_CLIENT_ID=$CLIENT_ID
OCROLUS_CLIENT_SECRET=$CLIENT_SECRET

# Environment (always production for widget)
OCROLUS_WIDGET_ENVIRONMENT=production
EOF
    
    print_success ".env file created"
    
    # Update widget UUID in HTML files
    update_widget_uuid "$WIDGET_UUID"
}

# ==============================================================================
# Update Widget UUID in HTML Files
# ==============================================================================

update_widget_uuid() {
    local uuid="$1"
    
    print_step "4" "Updating Widget Configuration"
    
    # Files to update
    local html_files=(
        "frontend/public/index.html"
    )
    
    # Update HTML files (initializer script pattern)
    for file in "${html_files[@]}"; do
        if [ -f "$file" ]; then
            # Use different sed syntax for macOS vs Linux
            if [ "$(detect_os)" = "macOS" ]; then
                # Replace 'YOUR_WIDGET_UUID' or any existing UUID in single quotes
                sed -i '' "s/'YOUR_WIDGET_UUID'/'$uuid'/g" "$file"
                # Also update if a UUID already exists
                sed -i '' "s/'\([0-9a-f]\{8\}-[0-9a-f]\{4\}-[0-9a-f]\{4\}-[0-9a-f]\{4\}-[0-9a-f]\{12\}\)',\(.*\/\* <--\)/'$uuid',\2/g" "$file"
            else
                sed -i "s/'YOUR_WIDGET_UUID'/'$uuid'/g" "$file"
                sed -i "s/'\([0-9a-f]\{8\}-[0-9a-f]\{4\}-[0-9a-f]\{4\}-[0-9a-f]\{4\}-[0-9a-f]\{12\}\)',\(.*\/\* <--\)/'$uuid',\2/g" "$file"
            fi
            print_success "Updated $file"
        fi
    done
}

# ==============================================================================
# Generate SSL Certificates
# ==============================================================================

generate_certificates() {
    print_step "5" "Setting Up SSL Certificates"
    
    # Check if certificates already exist
    if [ -f "reverse-proxy/www.ocrolusexample.com+3.pem" ] && \
       [ -f "reverse-proxy/auth.ocrolusexample.com+3.pem" ]; then
        print_info "SSL certificates already exist"
        read -p "Regenerate certificates? (y/n): " regenerate
        if [ "$regenerate" != "y" ] && [ "$regenerate" != "Y" ]; then
            print_info "Keeping existing certificates"
            return 0
        fi
    fi
    
    # Install mkcert CA
    print_info "Installing mkcert CA certificate..."
    mkcert -install
    
    # Generate certificates
    print_info "Generating SSL certificates..."
    mkcert www.ocrolusexample.com localhost 127.0.0.1 ::1
    mkcert auth.ocrolusexample.com localhost 127.0.0.1 ::1
    
    # Move to reverse-proxy folder
    mv www.ocrolusexample.com+3.pem reverse-proxy/
    mv www.ocrolusexample.com+3-key.pem reverse-proxy/
    mv auth.ocrolusexample.com+3.pem reverse-proxy/
    mv auth.ocrolusexample.com+3-key.pem reverse-proxy/
    
    print_success "SSL certificates generated and installed"
}

# ==============================================================================
# Main
# ==============================================================================

main() {
    print_header "Ocrolus Widget Quickstart Setup"
    
    echo "This script will set up the Ocrolus Widget Quickstart on your machine."
    echo "It works on macOS, Linux, and Windows (Git Bash/WSL)."
    echo ""
    echo -e "Detected OS: ${BOLD}$(detect_os)${NC}"
    echo ""
    
    # Run setup steps
    check_prerequisites
    check_hosts_file
    get_credentials
    generate_certificates
    
    # Done!
    print_header "Setup Complete!"
    
    echo -e "${GREEN}Your quickstart is configured and ready to run!${NC}"
    echo ""
    echo -e "${BOLD}To start the quickstart:${NC}"
    echo ""
    echo -e "  ${BOLD}Option 1: Docker Mode${NC}"
    echo -e "    ${CYAN}make run_docker${NC}"
    echo ""
    echo -e "  ${BOLD}Option 2: Local Mode${NC} (run each in separate terminals)"
    echo -e "    ${CYAN}make run_node${NC}            # Terminal 1: Backend"
    echo -e "    ${CYAN}make run_caddy_local${NC}     # Terminal 2: Reverse proxy"
    echo -e "    ${CYAN}make run_frontend${NC}        # Terminal 3: Frontend"
    echo ""
    echo -e "Then open: ${CYAN}https://www.ocrolusexample.com${NC}"
    echo ""
}

# Run main function
main

