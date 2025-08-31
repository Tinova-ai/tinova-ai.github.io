# SSL Monitoring System Deployment Guide

This document outlines how to deploy the SSL certificate monitoring system to the production server (192.168.1.106) for 24/7 automated monitoring.

## Production Server Deployment

### Prerequisites

The production server should have:
- Git access to the repository
- Basic Unix tools: `bash`, `openssl`, `curl`, `crontab`
- Optional: `jq` for JSON processing, `gh` for GitHub integration

### Deployment Steps

#### 1. Clone Repository on Production Server

```bash
# SSH into production server
ssh user@192.168.1.106

# Clone the repository (adjust path as needed)
cd /opt
sudo git clone git@github.com:Tinova-ai/tinova-ai.github.io.git ssl-monitoring
cd ssl-monitoring

# Set proper permissions
sudo chown -R $(whoami):$(whoami) /opt/ssl-monitoring
chmod +x scripts/monitoring/*.sh
```

#### 2. Install Dependencies

```bash
# Check if required tools are available
scripts/monitoring/ssl-monitor.sh --help
scripts/monitoring/ssl-alerts.sh --help

# Install GitHub CLI if needed (optional but recommended)
# Ubuntu/Debian:
# sudo apt update && sudo apt install gh

# CentOS/RHEL:
# sudo yum install gh

# Or download binary from: https://github.com/cli/cli/releases
```

#### 3. Configure GitHub Authentication (Optional)

```bash
# Configure GitHub CLI for automated issue creation
gh auth login

# Test GitHub integration
gh repo view Tinova-ai/tinova-ai.github.io
```

#### 4. Setup Automated Monitoring

```bash
# Run the setup script to configure cron jobs
cd /opt/ssl-monitoring
./scripts/monitoring/setup-monitoring.sh

# Verify cron jobs were created
crontab -l | grep ssl
```

#### 5. Test the Monitoring System

```bash
# Test SSL monitoring
./scripts/monitoring/ssl-monitor.sh

# Test alert system
./scripts/monitoring/ssl-alerts.sh --test

# Check emergency switch functionality
./scripts/monitoring/emergency-ssl-switch.sh status
```

### Production Monitoring Schedule

Once deployed, the system will run automatically:

```cron
# SSL Certificate Monitoring for tinova-ai.cc
# Check certificates twice daily (9 AM and 9 PM)
0 9,21 * * * /opt/ssl-monitoring/scripts/monitoring/ssl-alerts.sh >/dev/null 2>&1

# Weekly comprehensive SSL report (Mondays at 8 AM)  
0 8 * * 1 /opt/ssl-monitoring/scripts/monitoring/ssl-monitor.sh > /tmp/ssl-weekly-report-$(date +%Y%m%d).log 2>&1
```

## Alternative: GitHub Actions Monitoring

If server deployment isn't immediately available, we can use GitHub Actions:

### GitHub Actions Workflow

Create `.github/workflows/ssl-monitoring.yml`:

```yaml
name: SSL Certificate Monitoring

on:
  schedule:
    # Run twice daily at 9 AM and 9 PM UTC
    - cron: '0 9,21 * * *'
    # Weekly report on Mondays at 8 AM UTC
    - cron: '0 8 * * 1'
  workflow_dispatch: # Allow manual triggering

jobs:
  ssl-monitor:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      
    - name: Install dependencies
      run: |
        sudo apt-get update
        sudo apt-get install -y openssl curl jq
        
    - name: Run SSL certificate monitoring
      run: |
        chmod +x scripts/monitoring/*.sh
        ./scripts/monitoring/ssl-monitor.sh
        
    - name: Run SSL alerts check
      env:
        GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
      run: |
        ./scripts/monitoring/ssl-alerts.sh
        
    - name: Upload monitoring logs
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: ssl-monitoring-logs
        path: /tmp/ssl-*.log
        retention-days: 30
```

## Deployment Decision Matrix

| Option | Reliability | Setup Effort | Maintenance | Cost | Recommended |
|--------|-------------|--------------|-------------|------|-------------|
| **Production Server** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | Free | ✅ **Yes** |
| **GitHub Actions** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Free | 🔄 Backup |
| **Developer Machine** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ | Free | ❌ No |

## Next Steps

### Immediate Actions Required:

1. **Choose Deployment Method**:
   - Primary recommendation: Deploy to production server (192.168.1.106)
   - Backup option: GitHub Actions workflow

2. **Server Access**:
   - Ensure SSH access to production server
   - Verify server has required dependencies
   - Clone repository and setup monitoring

3. **Testing**:
   - Run initial monitoring tests
   - Verify cron jobs are working
   - Test emergency response procedures

4. **Documentation Update**:
   - Update server documentation with monitoring procedures
   - Add monitoring to operational runbooks
   - Document who has access to monitoring logs

### Production Checklist

- [ ] SSH access to production server confirmed
- [ ] Repository cloned to production server
- [ ] Dependencies installed and verified
- [ ] Monitoring scripts tested on production server
- [ ] Cron jobs configured and running
- [ ] GitHub CLI configured (optional)
- [ ] Emergency response procedures tested
- [ ] Monitoring logs location documented
- [ ] Backup monitoring method configured

### Operational Considerations

#### Log Management
```bash
# Set up log rotation for monitoring logs
# Create /etc/logrotate.d/ssl-monitoring
/tmp/ssl-*.log {
    daily
    rotate 30
    compress
    missingok
    notifempty
    create 644 root root
}
```

#### Monitoring the Monitoring System
```bash
# Add a daily check that monitoring is working
# This could be a simple script that verifies:
# 1. Cron jobs ran successfully
# 2. Log files were created
# 3. No error conditions exist
```

#### Alerting Integration
Consider integrating with existing alerting systems:
- Email notifications for critical SSL issues
- Slack/Teams integration for team notifications  
- Integration with existing monitoring dashboards

## Support and Maintenance

### Regular Maintenance Tasks
- **Weekly**: Review monitoring logs for any issues
- **Monthly**: Test emergency response procedures
- **Quarterly**: Update SSL monitoring system
- **Annually**: Review and update incident response documentation

### Troubleshooting
- **Log Location**: `/tmp/ssl-monitor-YYYYMMDD.log`
- **Status Reports**: `/tmp/ssl-status.json`
- **Cron Logs**: Check system logs for cron execution
- **Emergency Contact**: Documented in SSL-INCIDENT-RESPONSE.md

---

**Next Action Required**: Choose deployment method and execute deployment to production environment.
