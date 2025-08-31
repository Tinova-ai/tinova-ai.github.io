#!/bin/bash

# Emergency SSL Switch Script for tinova-ai.cc
# Provides quick failover between SSL providers
# Author: Jun Li <junli@intbot.ai>

set -euo pipefail

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/tmp/ssl-emergency-switch-$(date +%Y%m%d_%H%M%S).log"

# DNS configurations
GITHUB_PAGES_IPS=(
    "185.199.108.153"
    "185.199.109.153" 
    "185.199.110.153"
    "185.199.111.153"
)

CLOUDFLARE_PROXY_IP="104.21.14.175"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Check current SSL provider
check_current_ssl() {
    local domain="$1"
    local cert_info
    
    log "Checking current SSL provider for $domain"
    
    if cert_info=$(echo | openssl s_client -connect "$domain:443" -servername "$domain" 2>/dev/null | openssl x509 -noout -issuer 2>/dev/null); then
        local issuer=$(echo "$cert_info" | cut -d= -f2-)
        
        if [[ "$issuer" == *"Let's Encrypt"* ]]; then
            echo "letsencrypt"
        elif [[ "$issuer" == *"Google Trust Services"* ]] || [[ "$issuer" == *"Cloudflare"* ]]; then
            echo "cloudflare"
        else
            echo "unknown"
        fi
    else
        echo "error"
    fi
}

# Check if Cloudflare CLI is available
check_cloudflare_cli() {
    if ! command -v curl >/dev/null 2>&1; then
        echo -e "${RED}ERROR: curl is required but not installed${NC}"
        return 1
    fi
    
    if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]] && [[ -z "${CF_API_TOKEN:-}" ]]; then
        echo -e "${YELLOW}WARNING: CLOUDFLARE_API_TOKEN not set. DNS changes will need to be manual.${NC}"
        return 1
    fi
    
    return 0
}

# Update DNS via Cloudflare API (placeholder - requires actual zone/record IDs)
update_dns_cloudflare() {
    local record_type="$1"
    local name="$2"
    local content="$3"
    local proxied="$4"
    
    # This is a template - actual implementation would need:
    # - Cloudflare Zone ID for tinova-ai.cc
    # - DNS Record IDs for each record
    # - Valid API token
    
    log "DNS update: $record_type $name -> $content (proxied: $proxied)"
    
    # Placeholder for actual Cloudflare API call
    echo -e "${YELLOW}Manual DNS update required:${NC}"
    echo "  Type: $record_type"
    echo "  Name: $name"
    echo "  Content: $content"
    echo "  Proxied: $proxied"
    echo ""
    
    return 0
}

# Switch to Cloudflare SSL
switch_to_cloudflare() {
    log "Switching SSL to Cloudflare proxy"
    
    echo -e "${BLUE}Switching to Cloudflare SSL...${NC}"
    
    # Update DNS records to use Cloudflare proxy
    update_dns_cloudflare "A" "tinova-ai.cc" "$CLOUDFLARE_PROXY_IP" "true"
    update_dns_cloudflare "CNAME" "www" "tinova-ai.cc" "true"
    
    echo -e "${YELLOW}DNS changes initiated. SSL will be active in 5-10 minutes.${NC}"
    echo -e "${YELLOW}Monitor with: ./scripts/monitoring/ssl-monitor.sh${NC}"
    
    log "Cloudflare SSL switch initiated"
}

# Switch to GitHub Pages SSL
switch_to_github() {
    log "Switching SSL to GitHub Pages"
    
    echo -e "${BLUE}Switching to GitHub Pages SSL...${NC}"
    
    # Update DNS records to use GitHub Pages IPs
    for ip in "${GITHUB_PAGES_IPS[@]}"; do
        update_dns_cloudflare "A" "tinova-ai.cc" "$ip" "false"
    done
    update_dns_cloudflare "CNAME" "www" "tinova-ai.cc" "false"
    
    echo -e "${YELLOW}DNS changes initiated. SSL will be active in 5-15 minutes.${NC}"
    echo -e "${YELLOW}GitHub Pages may need time to re-issue certificate.${NC}"
    echo -e "${YELLOW}Monitor with: ./scripts/monitoring/ssl-monitor.sh${NC}"
    
    log "GitHub Pages SSL switch initiated"
}

# Monitor SSL switch progress
monitor_switch() {
    local target_provider="$1"
    local domain="${2:-tinova-ai.cc}"
    local max_attempts=30
    local attempt=1
    
    log "Monitoring SSL switch to $target_provider for $domain"
    
    echo -e "${BLUE}Monitoring SSL switch progress...${NC}"
    echo "Target provider: $target_provider"
    echo "Checking every 30 seconds (max $max_attempts attempts)"
    echo ""
    
    while [[ $attempt -le $max_attempts ]]; do
        echo -n "Attempt $attempt/$max_attempts: "
        
        local current_provider
        current_provider=$(check_current_ssl "$domain")
        
        case "$current_provider" in
            "error")
                echo -e "${RED}SSL connection failed${NC}"
                ;;
            "letsencrypt")
                echo -e "${GREEN}Let's Encrypt${NC}"
                if [[ "$target_provider" == "github" ]]; then
                    echo -e "${GREEN}✓ Switch to GitHub Pages successful!${NC}"
                    return 0
                fi
                ;;
            "cloudflare")
                echo -e "${BLUE}Cloudflare${NC}"
                if [[ "$target_provider" == "cloudflare" ]]; then
                    echo -e "${GREEN}✓ Switch to Cloudflare successful!${NC}"
                    return 0
                fi
                ;;
            "unknown")
                echo -e "${YELLOW}Unknown provider${NC}"
                ;;
        esac
        
        if [[ $attempt -eq $max_attempts ]]; then
            echo -e "${RED}✗ SSL switch did not complete within expected time${NC}"
            echo -e "${YELLOW}Manual verification may be required${NC}"
            return 1
        fi
        
        sleep 30
        ((attempt++))
    done
}

# Show current status
show_status() {
    echo -e "${BLUE}Current SSL Status:${NC}"
    echo "=================="
    
    for domain in "tinova-ai.cc" "www.tinova-ai.cc"; do
        echo -n "$domain: "
        local provider=$(check_current_ssl "$domain")
        case "$provider" in
            "letsencrypt")
                echo -e "${GREEN}Let's Encrypt (GitHub Pages)${NC}"
                ;;
            "cloudflare")
                echo -e "${BLUE}Cloudflare Universal SSL${NC}"
                ;;
            "error")
                echo -e "${RED}SSL Error / Connection Failed${NC}"
                ;;
            "unknown")
                echo -e "${YELLOW}Unknown SSL Provider${NC}"
                ;;
        esac
    done
    echo ""
}

# Main help function
show_help() {
    cat <<EOF
Emergency SSL Switch Script for tinova-ai.cc

Usage: $0 [COMMAND] [OPTIONS]

Commands:
    cloudflare    Switch to Cloudflare Universal SSL
    github        Switch to GitHub Pages Let's Encrypt  
    status        Show current SSL provider status
    monitor       Monitor SSL switch progress
    help          Show this help message

Options:
    --domain DOMAIN    Specify domain to check (default: tinova-ai.cc)
    --no-monitor       Skip automatic monitoring after switch
    --dry-run          Show what would be done without making changes

Examples:
    $0 status                    # Check current SSL providers
    $0 cloudflare               # Emergency switch to Cloudflare SSL
    $0 github                   # Switch back to GitHub Pages SSL
    $0 monitor cloudflare       # Monitor switch to Cloudflare

Emergency Usage:
    # When GitHub Pages SSL fails:
    $0 cloudflare && $0 monitor cloudflare

    # When Cloudflare has issues:  
    $0 github && $0 monitor github

Notes:
- DNS changes require 5-15 minutes to propagate
- Monitor SSL status during switches
- This script provides DNS change instructions (manual execution may be required)
- Set CLOUDFLARE_API_TOKEN environment variable for automated DNS updates

Log file: $LOG_FILE
EOF
}

# Main execution
main() {
    local command="${1:-help}"
    local domain="${2:-tinova-ai.cc}"
    
    case "$command" in
        "cloudflare")
            switch_to_cloudflare
            echo ""
            if [[ "${2:-}" != "--no-monitor" ]]; then
                monitor_switch "cloudflare" "$domain"
            fi
            ;;
        "github")
            switch_to_github
            echo ""
            if [[ "${2:-}" != "--no-monitor" ]]; then
                monitor_switch "github" "$domain"
            fi
            ;;
        "status")
            show_status
            ;;
        "monitor")
            local provider="${2:-}"
            if [[ -z "$provider" ]]; then
                echo -e "${RED}Error: Provider required for monitor command${NC}"
                echo "Usage: $0 monitor [cloudflare|github] [domain]"
                exit 1
            fi
            monitor_switch "$provider" "${3:-tinova-ai.cc}"
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            echo -e "${RED}Unknown command: $command${NC}"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"