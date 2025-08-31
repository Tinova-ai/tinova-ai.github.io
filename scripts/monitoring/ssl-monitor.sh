#!/bin/bash

# SSL Certificate Monitoring Script for tinova-ai.cc
# Monitors Let's Encrypt certificates auto-renewed via GitHub Pages
# Author: Jun Li <junli@intbot.ai>

set -euo pipefail

# Configuration
DOMAIN="tinova-ai.cc"
WWW_DOMAIN="www.tinova-ai.cc"
ALERT_DAYS=(30 14 7 3 1)  # Days before expiration to send alerts
LOG_FILE="/tmp/ssl-monitor-$(date +%Y%m%d).log"
STATUS_FILE="/tmp/ssl-status.json"

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Validate dependencies
validate_dependencies() {
    local missing_deps=()
    
    for cmd in openssl curl jq; do
        if ! command_exists "$cmd"; then
            missing_deps+=("$cmd")
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log "ERROR: Missing required dependencies: ${missing_deps[*]}"
        log "Please install missing dependencies and try again."
        exit 1
    fi
}

# Get certificate information
get_cert_info() {
    local domain="$1"
    local cert_info
    local temp_cert_file
    
    log "Checking certificate for $domain..."
    
    # Create temporary file for certificate data
    temp_cert_file=$(mktemp)
    
    # Get certificate information using echo pipe method
    if ! echo | openssl s_client -connect "$domain:443" -servername "$domain" 2>/dev/null > "$temp_cert_file"; then
        log "ERROR: Failed to connect to $domain"
        rm -f "$temp_cert_file"
        return 1
    fi
    
    # Parse certificate information
    cert_info=$(openssl x509 -noout -dates -subject -issuer < "$temp_cert_file" 2>/dev/null) || {
        log "ERROR: Failed to parse certificate for $domain"
        rm -f "$temp_cert_file"
        return 1
    }
    
    # Clean up temporary file
    rm -f "$temp_cert_file"
    
    echo "$cert_info"
}

# Parse certificate dates
parse_cert_dates() {
    local cert_info="$1"
    local not_before not_after
    
    not_before=$(echo "$cert_info" | grep "notBefore=" | cut -d= -f2-)
    not_after=$(echo "$cert_info" | grep "notAfter=" | cut -d= -f2-)
    
    # Convert to epoch timestamps (macOS compatible)
    local not_before_epoch not_after_epoch
    
    # Parse date format: "Aug 25 02:41:38 2025 GMT"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS date command
        not_before_epoch=$(date -j -f "%b %d %H:%M:%S %Y %Z" "$not_before" "+%s" 2>/dev/null || echo "0")
        not_after_epoch=$(date -j -f "%b %d %H:%M:%S %Y %Z" "$not_after" "+%s" 2>/dev/null || echo "0")
    else
        # Linux date command
        not_before_epoch=$(date -d "$not_before" "+%s" 2>/dev/null || echo "0")
        not_after_epoch=$(date -d "$not_after" "+%s" 2>/dev/null || echo "0")
    fi
    
    echo "$not_before_epoch $not_after_epoch $not_before $not_after"
}

# Calculate days until expiration
days_until_expiration() {
    local expiry_epoch="$1"
    local current_epoch
    current_epoch=$(date +%s)
    
    if [ "$expiry_epoch" -eq 0 ]; then
        echo "-1"  # Error parsing date
        return
    fi
    
    local days_diff=$(( (expiry_epoch - current_epoch) / 86400 ))
    echo "$days_diff"
}

# Check certificate chain and SAN
check_cert_details() {
    local domain="$1"
    local san_info issuer_info
    local temp_cert_file
    
    log "Checking certificate details for $domain..."
    
    # Create temporary file for certificate data
    temp_cert_file=$(mktemp)
    
    # Get certificate information
    if ! echo | openssl s_client -connect "$domain:443" -servername "$domain" 2>/dev/null > "$temp_cert_file"; then
        log "ERROR: Failed to connect to $domain for certificate details"
        rm -f "$temp_cert_file"
        return 1
    fi
    
    # Get SAN (Subject Alternative Names)
    san_info=$(openssl x509 -noout -text < "$temp_cert_file" 2>/dev/null | \
        grep -A 5 "Subject Alternative Name" | \
        grep "DNS:" || echo "No SAN found")
    
    # Get issuer information
    issuer_info=$(openssl x509 -noout -issuer < "$temp_cert_file" 2>/dev/null | \
        cut -d= -f2-)
    
    # Clean up temporary file
    rm -f "$temp_cert_file"
    
    echo "SAN: $san_info"
    echo "Issuer: $issuer_info"
}

# Check GitHub Pages status
check_github_pages() {
    local status_url="https://www.githubstatus.com/api/v2/status.json"
    local github_status
    
    log "Checking GitHub Pages service status..."
    
    github_status=$(curl -s --max-time 10 "$status_url" | jq -r '.status.description' 2>/dev/null || echo "Unknown")
    
    if [ "$github_status" = "All Systems Operational" ]; then
        echo -e "${GREEN}✓${NC} GitHub Pages: $github_status"
    else
        echo -e "${YELLOW}⚠${NC} GitHub Pages: $github_status"
        log "WARNING: GitHub Pages status is not optimal: $github_status"
    fi
}

# Send alert (placeholder for integration with notification system)
send_alert() {
    local domain="$1"
    local days_left="$2"
    local expiry_date="$3"
    local alert_level="$4"
    
    local message="SSL Certificate Alert for $domain:
- Days until expiration: $days_left
- Expiry date: $expiry_date
- Alert level: $alert_level
- Action required: Monitor auto-renewal process"
    
    log "ALERT: $message"
    
    # Here you would integrate with your preferred notification system
    # Examples:
    # - Send email
    # - Slack webhook
    # - GitHub issue creation
    # - Telegram bot
    # - PagerDuty alert
    
    echo -e "${RED}🚨 ALERT${NC}: SSL certificate for $domain expires in $days_left days!"
}

# Generate status report
generate_status_report() {
    local domain="$1"
    local days_left="$2"
    local expiry_date="$3"
    local san_info="$4"
    local issuer="$5"
    
    local status_json=$(cat <<EOF
{
    "timestamp": "$(date -Iseconds)",
    "domain": "$domain",
    "days_until_expiration": $days_left,
    "expiry_date": "$expiry_date",
    "issuer": "$issuer",
    "san_domains": "$san_info",
    "status": "$([ "$days_left" -gt 30 ] && echo "healthy" || [ "$days_left" -gt 7 ] && echo "warning" || echo "critical")",
    "auto_renewal": "github_pages"
}
EOF
    )
    
    echo "$status_json" > "$STATUS_FILE"
    log "Status report saved to $STATUS_FILE"
}

# Main monitoring function
monitor_ssl_certificate() {
    local domain="$1"
    local cert_info cert_dates not_before_epoch not_after_epoch
    local not_before_str not_after_str days_left
    
    echo -e "\n${BLUE}=== SSL Certificate Monitor for $domain ===${NC}"
    
    # Get certificate information
    if ! cert_info=$(get_cert_info "$domain"); then
        return 1
    fi
    
    # Parse certificate dates
    cert_dates=$(parse_cert_dates "$cert_info")
    read -r not_before_epoch not_after_epoch not_before_str not_after_str <<< "$cert_dates"
    
    # Calculate days until expiration
    days_left=$(days_until_expiration "$not_after_epoch")
    
    if [ "$days_left" -eq -1 ]; then
        log "ERROR: Failed to parse certificate expiration date for $domain"
        return 1
    fi
    
    # Display certificate information
    echo -e "${GREEN}Certificate Information:${NC}"
    echo "  Domain: $domain"
    echo "  Valid From: $not_before_str"
    echo "  Valid Until: $not_after_str"
    echo "  Days Until Expiration: $days_left"
    
    # Get additional certificate details
    cert_details=$(check_cert_details "$domain")
    echo -e "\n${GREEN}Certificate Details:${NC}"
    echo "$cert_details" | sed 's/^/  /'
    
    # Check for expiration alerts
    for alert_day in "${ALERT_DAYS[@]}"; do
        if [ "$days_left" -eq "$alert_day" ]; then
            send_alert "$domain" "$days_left" "$not_after_str" "$([ "$days_left" -le 7 ] && echo "critical" || echo "warning")"
            break
        fi
    done
    
    # Generate status report
    local issuer=$(echo "$cert_info" | grep "issuer=" | cut -d= -f2-)
    local san=$(echo "$cert_details" | grep "SAN:" | cut -d: -f2- | tr -d ' ')
    generate_status_report "$domain" "$days_left" "$not_after_str" "$san" "$issuer"
    
    # Status summary
    if [ "$days_left" -gt 30 ]; then
        echo -e "\n${GREEN}✓ Status: Certificate is healthy${NC}"
    elif [ "$days_left" -gt 7 ]; then
        echo -e "\n${YELLOW}⚠ Status: Certificate expires soon${NC}"
    else
        echo -e "\n${RED}🚨 Status: Certificate expires very soon!${NC}"
    fi
    
    return 0
}

# Main execution
main() {
    log "Starting SSL certificate monitoring for $DOMAIN and $WWW_DOMAIN"
    
    # Validate dependencies
    validate_dependencies
    
    # Check GitHub Pages service status
    check_github_pages
    
    # Monitor primary domain
    if ! monitor_ssl_certificate "$DOMAIN"; then
        log "ERROR: Failed to monitor $DOMAIN"
        exit 1
    fi
    
    echo ""
    
    # Monitor www subdomain
    if ! monitor_ssl_certificate "$WWW_DOMAIN"; then
        log "ERROR: Failed to monitor $WWW_DOMAIN"
        exit 1
    fi
    
    log "SSL certificate monitoring completed successfully"
    
    # Display log file location
    echo -e "\n${BLUE}Detailed logs available at: $LOG_FILE${NC}"
    echo -e "${BLUE}Status report available at: $STATUS_FILE${NC}"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        cat <<EOF
SSL Certificate Monitoring Script for tinova-ai.cc

Usage: $0 [OPTIONS]

Options:
    --help, -h      Show this help message
    --domain DOMAIN Override primary domain (default: tinova-ai.cc)
    --verbose       Enable verbose output
    --json          Output results in JSON format only

Examples:
    $0                    # Monitor default domains
    $0 --domain example.com  # Monitor custom domain
    
This script monitors SSL certificates for tinova-ai.cc and www.tinova-ai.cc,
checking for upcoming expirations and validating the Let's Encrypt auto-renewal
process through GitHub Pages.
EOF
        exit 0
        ;;
    --domain)
        DOMAIN="$2"
        WWW_DOMAIN="www.$2"
        shift 2
        ;;
    --json)
        # JSON-only output mode
        main > /dev/null 2>&1
        if [ -f "$STATUS_FILE" ]; then
            cat "$STATUS_FILE"
        fi
        exit 0
        ;;
    *)
        # Default execution
        main
        ;;
esac