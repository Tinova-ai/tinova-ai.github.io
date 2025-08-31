# SSL Certificate Monitoring System for tinova-ai.cc

This directory contains a comprehensive SSL certificate monitoring system designed to ensure continuous HTTPS availability for tinova-ai.cc domains.

## Overview

The monitoring system provides automated SSL certificate monitoring with multi-level alerts and emergency response procedures for tinova-ai.cc domains managed through GitHub Pages with Let's Encrypt certificates.

## Components

### Core Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `ssl-monitor.sh` | Certificate status checking | `./ssl-monitor.sh` |
| `ssl-alerts.sh` | Automated alert system | `./ssl-alerts.sh` |
| `setup-monitoring.sh` | Initial system setup | `./setup-monitoring.sh` |
| `emergency-ssl-switch.sh` | Emergency SSL failover | `./emergency-ssl-switch.sh cloudflare` |

### Documentation

| File | Purpose |
|------|---------|
| `SSL-INCIDENT-RESPONSE.md` | Step-by-step incident response procedures |
| `SSL-BACKUP-PROCEDURES.md` | Backup strategies and recovery procedures |
| `README.md` | This file - system overview and usage |

## Quick Start

### 1. Initial Setup
```bash
# Make scripts executable
chmod +x scripts/monitoring/*.sh

# Run initial setup (creates cron jobs)
./scripts/monitoring/setup-monitoring.sh

# Test the monitoring system
./scripts/monitoring/ssl-monitor.sh
```

### 2. Daily Operations
```bash
# Check certificate status
./scripts/monitoring/ssl-monitor.sh

# View monitoring configuration
./scripts/monitoring/ssl-alerts.sh --config

# Check current SSL provider
./scripts/monitoring/emergency-ssl-switch.sh status
```

### 3. Emergency Response
```bash
# If GitHub Pages SSL fails
./scripts/monitoring/emergency-ssl-switch.sh cloudflare

# Monitor failover progress
./scripts/monitoring/emergency-ssl-switch.sh monitor cloudflare
```

## Monitoring Schedule

### Automated Checks
- **Certificate Status**: Every 12 hours (9 AM, 9 PM)
- **Weekly Reports**: Mondays at 8 AM
- **GitHub Pages Status**: Included in each check

### Alert Thresholds
- **Info**: 60+ days remaining (no alerts)
- **Warning**: 30 days remaining (GitHub issue created)
- **Critical**: 7 days remaining (immediate notification)
- **Emergency**: 1 day remaining (escalated alerts)

## Integration with Existing Infrastructure

### GitHub Integration
- **Automated Issues**: Created for warning and critical alerts
- **Labels**: `ssl`, `monitoring`, `automated`, `priority:warning/critical`
- **Repository**: Issues created in current repository

### Cloudflare Backup
- **DNS Failover**: Automatic switch to Cloudflare Universal SSL
- **Certificate Coverage**: `*.tinova-ai.cc` wildcard certificate
- **Activation Time**: 5-10 minutes for DNS propagation

### Cron Job Schedule
```cron
# SSL Certificate Monitoring for tinova-ai.cc
# Check certificates twice daily (9 AM and 9 PM)
0 9,21 * * * /path/to/scripts/monitoring/ssl-alerts.sh >/dev/null 2>&1

# Weekly comprehensive SSL report (Mondays at 8 AM)
0 8 * * 1 /path/to/scripts/monitoring/ssl-monitor.sh > /tmp/ssl-weekly-report-$(date +%Y%m%d).log 2>&1
```

## Configuration Files

### Alert Configuration (`alert-config.json`)
Created automatically with default settings. Customize notification preferences:

```json
{
    "notifications": {
        "github": {
            "enabled": true,
            "create_issue": true,
            "repository": "Tinova-ai/tinova-web",
            "labels": ["ssl", "monitoring", "automated"]
        },
        "terminal": {
            "enabled": true,
            "color_output": true
        }
    },
    "thresholds": {
        "critical": 7,
        "warning": 30,
        "info": 60
    }
}
```

## Log Files and Reports

### Standard Log Locations
- **Daily Monitoring**: `/tmp/ssl-monitor-YYYYMMDD.log`
- **Alert Logs**: `/tmp/ssl-alerts-YYYYMMDD.log`
- **Status Reports**: `/tmp/ssl-status.json`
- **Emergency Switches**: `/tmp/ssl-emergency-switch-YYYYMMDD_HHMMSS.log`

### Status Report Format (JSON)
```json
{
    "timestamp": "2025-08-30T23:51:09-07:00",
    "domain": "tinova-ai.cc",
    "days_until_expiration": 83,
    "expiry_date": "Nov 23 03:41:36 2025 GMT",
    "issuer": "C=US, O=Google Trust Services, CN=WE1",
    "san_domains": "DNS:tinova-ai.cc, DNS:auth.tinova-ai.cc",
    "status": "healthy",
    "auto_renewal": "github_pages"
}
```

## Command Reference

### SSL Monitor Commands
```bash
# Basic certificate check
./ssl-monitor.sh

# Check specific domain
./ssl-monitor.sh --domain example.com

# Get JSON output only
./ssl-monitor.sh --json

# Show help
./ssl-monitor.sh --help
```

### SSL Alert Commands
```bash
# Run alert checks
./ssl-alerts.sh

# Test alert system
./ssl-alerts.sh --test

# Show configuration
./ssl-alerts.sh --config

# Check specific domain
./ssl-alerts.sh tinova-ai.cc
```

### Setup Commands
```bash
# Initial setup with cron jobs
./setup-monitoring.sh

# Test system without installing
./setup-monitoring.sh --test

# Show current configuration
./setup-monitoring.sh --show

# Remove monitoring cron jobs
./setup-monitoring.sh --uninstall
```

### Emergency Switch Commands
```bash
# Show current SSL status
./emergency-ssl-switch.sh status

# Switch to Cloudflare SSL
./emergency-ssl-switch.sh cloudflare

# Switch to GitHub Pages SSL
./emergency-ssl-switch.sh github

# Monitor switch progress
./emergency-ssl-switch.sh monitor cloudflare
```

## Troubleshooting

### Common Issues

#### 1. Certificate Retrieval Failures
```bash
# Test SSL connection manually
echo | openssl s_client -connect tinova-ai.cc:443 -servername tinova-ai.cc

# Check DNS resolution
dig tinova-ai.cc A
dig www.tinova-ai.cc CNAME
```

#### 2. GitHub API Issues
```bash
# Verify GitHub CLI is installed and authenticated
gh auth status

# Test issue creation permissions
gh issue list --repo Tinova-ai/tinova-web
```

#### 3. Cron Job Issues
```bash
# Check if cron jobs are installed
crontab -l | grep ssl

# View cron job logs (macOS)
log show --predicate 'process == "cron"' --last 1h

# View cron job logs (Linux)
grep CRON /var/log/syslog | tail -20
```

### Debug Mode
Enable debug output for troubleshooting:

```bash
# Run with debug output
bash -x ./ssl-monitor.sh

# Check script exit codes
./ssl-monitor.sh; echo "Exit code: $?"
```

## Security Considerations

### File Permissions
- Scripts: 755 (readable/executable by owner, readable by group/others)
- Config files: 644 (readable by owner, readable by group/others)
- Log files: 644 (written by scripts, readable for debugging)

### Sensitive Data
- No private keys are stored in these scripts
- Cloudflare API tokens should be stored in environment variables
- GitHub authentication handled by `gh` CLI tool

### Network Security
- All certificate checks use standard HTTPS/TLS connections
- No credentials transmitted over unencrypted connections
- API calls use authentication tokens (not passwords)

## Contributing

### Adding New Domains
1. Update domain list in `ssl-alerts.sh`
2. Add domain-specific configuration in `alert-config.json`
3. Test monitoring for new domain
4. Update documentation

### Extending Alert Notifications
1. Add notification method to `ssl-alerts.sh`
2. Update configuration schema in `alert-config.json`
3. Test notification delivery
4. Document configuration options

### Improving Emergency Response
1. Add new SSL provider to `emergency-ssl-switch.sh`
2. Create provider-specific DNS update functions
3. Test failover procedures
4. Update incident response documentation

## Support and Documentation

### Internal Documentation
- **Incident Response**: `SSL-INCIDENT-RESPONSE.md`
- **Backup Procedures**: `SSL-BACKUP-PROCEDURES.md`
- **System Overview**: This README

### External Resources
- **GitHub Pages SSL**: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/securing-your-github-pages-site-with-https
- **Let's Encrypt**: https://letsencrypt.org/docs/
- **Cloudflare SSL**: https://developers.cloudflare.com/ssl/

---

**Last Updated**: August 30, 2025  
**System Version**: 1.0  
**Compatibility**: macOS/Linux with bash 4.0+  
**Dependencies**: `openssl`, `curl`, `jq` (optional), `gh` (GitHub CLI)

---

For issues or improvements, create a GitHub issue with the `ssl-monitoring` label.