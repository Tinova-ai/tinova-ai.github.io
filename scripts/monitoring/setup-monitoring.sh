#!/bin/bash

# SSL Certificate Monitoring Setup Script
# Sets up automated SSL certificate monitoring for tinova-ai.cc
# Author: Jun Li <junli@intbot.ai>

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}SSL Certificate Monitoring Setup${NC}"
echo "================================"

# Check if running on macOS or Linux for cron compatibility
if [[ "$OSTYPE" == "darwin"* ]]; then
    CRON_USER_CMD="crontab"
    echo -e "${YELLOW}Detected macOS - using user crontab${NC}"
elif [[ "$OSTYPE" == "linux"* ]]; then
    CRON_USER_CMD="crontab"
    echo -e "${YELLOW}Detected Linux - using user crontab${NC}"
else
    echo -e "${RED}Warning: Unknown OS type, cron setup may need manual adjustment${NC}"
    CRON_USER_CMD="crontab"
fi

# Function to check if cron job already exists
check_existing_cron() {
    if $CRON_USER_CMD -l 2>/dev/null | grep -q "ssl-alerts.sh"; then
        echo -e "${YELLOW}Existing SSL monitoring cron job found${NC}"
        return 0
    else
        return 1
    fi
}

# Function to add cron job
add_cron_job() {
    local temp_cron
    temp_cron=$(mktemp)
    
    # Get existing crontab (if any)
    $CRON_USER_CMD -l 2>/dev/null > "$temp_cron" || true
    
    # Add SSL monitoring entries
    cat >> "$temp_cron" <<EOF

# SSL Certificate Monitoring for tinova-ai.cc
# Check certificates twice daily (9 AM and 9 PM)
0 9,21 * * * $SCRIPT_DIR/ssl-alerts.sh >/dev/null 2>&1

# Weekly comprehensive SSL report (Mondays at 8 AM)
0 8 * * 1 $SCRIPT_DIR/ssl-monitor.sh > /tmp/ssl-weekly-report-\$(date +\%Y\%m\%d).log 2>&1
EOF
    
    # Install the new crontab
    if $CRON_USER_CMD "$temp_cron"; then
        echo -e "${GREEN}✓ SSL monitoring cron jobs added successfully${NC}"
    else
        echo -e "${RED}✗ Failed to add cron jobs${NC}"
        rm -f "$temp_cron"
        return 1
    fi
    
    # Clean up
    rm -f "$temp_cron"
    return 0
}

# Function to show current cron jobs
show_cron_jobs() {
    echo -e "\n${BLUE}Current SSL monitoring cron jobs:${NC}"
    $CRON_USER_CMD -l 2>/dev/null | grep -E "(ssl-|SSL)" || echo "No SSL monitoring cron jobs found"
}

# Function to create monitoring logs directory
setup_log_directory() {
    local log_dir="/tmp/ssl-monitoring-logs"
    
    if [[ ! -d "$log_dir" ]]; then
        mkdir -p "$log_dir"
        echo -e "${GREEN}✓ Created monitoring logs directory: $log_dir${NC}"
    else
        echo -e "${YELLOW}Monitoring logs directory already exists: $log_dir${NC}"
    fi
}

# Function to validate scripts
validate_scripts() {
    local scripts=("ssl-monitor.sh" "ssl-alerts.sh")
    local all_valid=true
    
    echo -e "\n${BLUE}Validating monitoring scripts:${NC}"
    
    for script in "${scripts[@]}"; do
        local script_path="$SCRIPT_DIR/$script"
        if [[ -f "$script_path" && -x "$script_path" ]]; then
            echo -e "${GREEN}✓ $script${NC}"
        else
            echo -e "${RED}✗ $script (missing or not executable)${NC}"
            all_valid=false
        fi
    done
    
    return $($all_valid && echo 0 || echo 1)
}

# Function to test monitoring system
test_monitoring() {
    echo -e "\n${BLUE}Testing monitoring system:${NC}"
    
    # Test SSL monitor
    if "$SCRIPT_DIR/ssl-monitor.sh" --help >/dev/null 2>&1; then
        echo -e "${GREEN}✓ SSL monitor script works${NC}"
    else
        echo -e "${RED}✗ SSL monitor script has issues${NC}"
        return 1
    fi
    
    # Test SSL alerts
    if "$SCRIPT_DIR/ssl-alerts.sh" --help >/dev/null 2>&1; then
        echo -e "${GREEN}✓ SSL alerts script works${NC}"
    else
        echo -e "${RED}✗ SSL alerts script has issues${NC}"
        return 1
    fi
    
    # Test actual certificate check (quick test)
    echo -e "${YELLOW}Running quick certificate check...${NC}"
    if "$SCRIPT_DIR/ssl-monitor.sh" --json >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Certificate monitoring working${NC}"
    else
        echo -e "${YELLOW}⚠ Certificate monitoring may have issues${NC}"
    fi
    
    return 0
}

# Function to show usage instructions
show_usage_instructions() {
    cat <<EOF

${GREEN}Setup Complete!${NC}

${BLUE}What was configured:${NC}
- SSL certificate monitoring for tinova-ai.cc and www.tinova-ai.cc
- Automated checks twice daily (9 AM and 9 PM)
- Weekly comprehensive reports (Mondays at 8 AM)
- GitHub integration for critical alerts

${BLUE}Manual commands:${NC}
- Check certificates now: ${YELLOW}$SCRIPT_DIR/ssl-monitor.sh${NC}
- Test alert system: ${YELLOW}$SCRIPT_DIR/ssl-alerts.sh --test${NC}
- View current config: ${YELLOW}$SCRIPT_DIR/ssl-alerts.sh --config${NC}

${BLUE}Logs and reports:${NC}
- Daily logs: /tmp/ssl-monitor-YYYYMMDD.log
- Alert logs: /tmp/ssl-alerts-YYYYMMDD.log
- Status reports: /tmp/ssl-status.json

${BLUE}GitHub Integration:${NC}
- Critical alerts (≤7 days) create GitHub issues automatically
- Warning alerts (≤30 days) create GitHub issues automatically
- Issues are labeled with: ssl, monitoring, automated

${BLUE}Monitoring Schedule:${NC}
- Certificate checks: Daily at 9 AM and 9 PM
- Comprehensive reports: Weekly on Mondays at 8 AM
- Immediate alerts: When certificates expire in ≤30 days

EOF
}

# Main setup process
main() {
    echo "Setting up SSL certificate monitoring for tinova-ai.cc domains..."
    
    # Validate scripts first
    if ! validate_scripts; then
        echo -e "${RED}Error: Some monitoring scripts are missing or invalid${NC}"
        exit 1
    fi
    
    # Setup log directory
    setup_log_directory
    
    # Check for existing cron jobs
    if check_existing_cron; then
        echo -e "${YELLOW}SSL monitoring cron jobs already exist.${NC}"
        read -p "Do you want to replace them? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Setup cancelled."
            show_cron_jobs
            exit 0
        fi
        
        # Remove existing SSL monitoring entries
        temp_cron=$(mktemp)
        $CRON_USER_CMD -l 2>/dev/null | grep -v "ssl-alerts.sh\|ssl-monitor.sh\|SSL Certificate" > "$temp_cron" || true
        $CRON_USER_CMD "$temp_cron"
        rm -f "$temp_cron"
        echo -e "${YELLOW}Removed existing SSL monitoring cron jobs${NC}"
    fi
    
    # Add new cron jobs
    if add_cron_job; then
        echo -e "${GREEN}✓ SSL monitoring setup completed successfully${NC}"
    else
        echo -e "${RED}✗ Failed to setup SSL monitoring${NC}"
        exit 1
    fi
    
    # Test the monitoring system
    test_monitoring
    
    # Show current cron jobs
    show_cron_jobs
    
    # Show usage instructions
    show_usage_instructions
    
    echo -e "\n${GREEN}SSL Certificate Monitoring is now active!${NC}"
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        cat <<EOF
SSL Certificate Monitoring Setup Script

Usage: $0 [OPTIONS]

Options:
    --help, -h      Show this help message
    --uninstall     Remove SSL monitoring cron jobs
    --test          Test monitoring system without installing
    --show          Show current monitoring configuration

This script sets up automated SSL certificate monitoring for tinova-ai.cc
domains with cron jobs for regular checks and alerts.
EOF
        exit 0
        ;;
    --uninstall)
        echo "Removing SSL monitoring cron jobs..."
        temp_cron=$(mktemp)
        if $CRON_USER_CMD -l 2>/dev/null | grep -v "ssl-alerts.sh\|ssl-monitor.sh\|SSL Certificate" > "$temp_cron"; then
            $CRON_USER_CMD "$temp_cron"
            echo -e "${GREEN}✓ SSL monitoring cron jobs removed${NC}"
        else
            echo -e "${YELLOW}No SSL monitoring cron jobs found${NC}"
        fi
        rm -f "$temp_cron"
        exit 0
        ;;
    --test)
        echo "Testing monitoring system..."
        validate_scripts && test_monitoring
        exit 0
        ;;
    --show)
        show_cron_jobs
        exit 0
        ;;
    *)
        # Default: run main setup
        main
        ;;
esac