# SSL Certificate Incident Response Guide

This document provides step-by-step procedures for handling SSL certificate issues for tinova-ai.cc domains.

## Quick Reference

| Alert Level | Days Left | Action Required | Response Time |
|-------------|-----------|-----------------|---------------|
| Info | 60-31 | Monitor only | None |
| Warning | 30-8 | Verify auto-renewal | 24 hours |
| Critical | 7-1 | Manual intervention | 2 hours |
| Emergency | 0 | Immediate action | 30 minutes |

## Certificate Overview

### Current Configuration
- **Primary Domain**: tinova-ai.cc
- **Secondary Domain**: www.tinova-ai.cc
- **Certificate Authority**: Let's Encrypt via GitHub Pages
- **Auto-renewal**: Managed by GitHub Pages
- **Renewal Cycle**: 90 days (Let's Encrypt standard)

### Certificate Chain
```
Root CA: ISRG Root X1
Intermediate CA: Let's Encrypt R3/R11/E1
End Entity: tinova-ai.cc (Subject Alternative Names: tinova-ai.cc, auth.tinova-ai.cc)
```

## Monitoring System

### Automated Checks
- **Frequency**: Twice daily (9 AM and 9 PM)
- **Script**: `scripts/monitoring/ssl-alerts.sh`
- **Status file**: `/tmp/ssl-status.json`
- **Logs**: `/tmp/ssl-monitor-YYYYMMDD.log`

### Manual Verification Commands
```bash
# Quick certificate check
./scripts/monitoring/ssl-monitor.sh

# Check specific domain
./scripts/monitoring/ssl-monitor.sh --domain tinova-ai.cc

# Get JSON status
./scripts/monitoring/ssl-monitor.sh --json

# Browser verification
curl -I https://tinova-ai.cc
curl -I https://www.tinova-ai.cc
```

## Incident Response Procedures

### 1. Warning Alert (30-8 Days Before Expiration)

**Symptoms:**
- Automated alert indicating certificate expires in 30 days or less
- GitHub issue created automatically
- Yellow warning in monitoring logs

**Response Steps:**

1. **Verify GitHub Pages Status**
   ```bash
   # Check GitHub Pages service status
   curl -s https://www.githubstatus.com/api/v2/status.json | jq '.status.description'
   ```

2. **Check Repository Configuration**
   - Navigate to GitHub repository settings
   - Verify "Pages" section shows custom domain is configured
   - Confirm CNAME file exists in repository root
   - Check DNS configuration

3. **Verify CNAME Record**
   ```bash
   # Check CNAME record for www subdomain
   dig www.tinova-ai.cc CNAME
   
   # Check A records for root domain
   dig tinova-ai.cc A
   ```

4. **Document Findings**
   - Update GitHub issue with verification results
   - Note any configuration anomalies
   - Set reminder to check again in 7 days

### 2. Critical Alert (7-1 Days Before Expiration)

**Symptoms:**
- Critical alert from monitoring system
- Red alert notifications
- GitHub issue labeled as critical priority

**Immediate Actions (Within 2 Hours):**

1. **Emergency Verification**
   ```bash
   # Immediate certificate status
   echo | openssl s_client -connect tinova-ai.cc:443 -servername tinova-ai.cc 2>/dev/null | openssl x509 -noout -dates
   ```

2. **Check GitHub Pages Renewal Process**
   - Review GitHub Pages documentation for any known issues
   - Check if GitHub has initiated renewal process
   - Verify no changes to repository configuration

3. **Contact GitHub Support** (if auto-renewal appears to be failing)
   - Create GitHub Support ticket
   - Reference custom domain SSL renewal issue
   - Provide certificate expiration details

4. **Prepare Backup Plan**
   - Review Cloudflare SSL configuration options
   - Prepare to switch DNS if necessary
   - Document emergency contact procedures

### 3. Emergency Alert (Certificate Expired or <1 Day)

**Symptoms:**
- Website shows SSL certificate errors
- Browser security warnings
- Complete loss of HTTPS functionality

**Emergency Response (Within 30 Minutes):**

#### Step 1: Immediate Assessment
```bash
# Check current certificate status
curl -I https://tinova-ai.cc 2>&1
curl -I https://www.tinova-ai.cc 2>&1

# Check if certificate has actually expired
./scripts/monitoring/ssl-monitor.sh --domain tinova-ai.cc
```

#### Step 2: Implement Emergency Backup

**Option A: Cloudflare SSL Proxy**
1. Log into Cloudflare dashboard
2. Navigate to SSL/TLS → Edge Certificates
3. Enable "Always Use HTTPS"
4. Set SSL mode to "Flexible" or "Full"
5. Update DNS records to proxy through Cloudflare:
   ```
   tinova-ai.cc A 104.21.14.175 (Proxied)
   www CNAME tinova-ai.cc (Proxied)
   ```

**Option B: GitHub Pages Force Renewal**
1. Remove custom domain from GitHub Pages settings
2. Wait 5 minutes
3. Re-add custom domain
4. Force HTTPS checkbox
5. Wait for GitHub to issue new certificate

#### Step 3: Monitor Recovery
```bash
# Check certificate renewal status every 15 minutes
while true; do
    echo "$(date): Checking certificate status..."
    ./scripts/monitoring/ssl-monitor.sh --domain tinova-ai.cc --json | jq '.days_until_expiration'
    sleep 900  # 15 minutes
done
```

## Backup SSL Configurations

### Cloudflare SSL Settings

#### DNS Configuration (Emergency Backup)
```
Type: A
Name: tinova-ai.cc
Value: 104.21.14.175
Proxy: Enabled
TTL: Auto

Type: CNAME  
Name: www
Value: tinova-ai.cc
Proxy: Enabled
TTL: Auto
```

#### SSL/TLS Settings
- SSL Mode: Full (strict) for maximum security
- Edge Certificates: Universal SSL enabled
- Always Use HTTPS: Enabled
- HSTS: Enabled with 6-month max-age

### Manual Certificate Installation (Last Resort)

If both GitHub Pages and Cloudflare fail, manual certificate installation may be required:

1. **Obtain Certificate from Let's Encrypt**
   ```bash
   # Using certbot (if available)
   certbot certonly --manual --preferred-challenges dns -d tinova-ai.cc -d www.tinova-ai.cc
   ```

2. **Deploy to Custom Server**
   - Configure nginx or Apache with obtained certificates
   - Update DNS to point to custom server
   - Monitor for proper SSL functionality

## Post-Incident Procedures

### 1. Root Cause Analysis
- Document what caused the SSL renewal failure
- Identify gaps in monitoring or response procedures
- Update incident response procedures as needed

### 2. Update Monitoring
```bash
# Test monitoring system after incident
./scripts/monitoring/ssl-alerts.sh --test

# Verify automated alerts are working
./scripts/monitoring/setup-monitoring.sh --test
```

### 3. Notification Updates
- Update stakeholders on resolution
- Document lessons learned in GitHub issue
- Close related GitHub issues with summary

### 4. Preventive Measures
- Review GitHub Pages SSL documentation for updates
- Enhance monitoring thresholds if needed
- Schedule regular verification of backup procedures

## Contact Information

### GitHub Support
- **Support Portal**: https://support.github.com/
- **Documentation**: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- **Status Page**: https://www.githubstatus.com/

### Let's Encrypt
- **Documentation**: https://letsencrypt.org/docs/
- **Community Forum**: https://community.letsencrypt.org/
- **Status Page**: https://letsencrypt.status.io/

### Cloudflare (Backup)
- **Dashboard**: https://dash.cloudflare.com/
- **Support**: https://support.cloudflare.com/
- **Status Page**: https://www.cloudflarestatus.com/

## Testing and Validation

### Monthly SSL Health Check
```bash
# Run comprehensive SSL test
./scripts/monitoring/ssl-monitor.sh > /tmp/ssl-health-check-$(date +%Y%m%d).log

# Verify backup DNS configuration
dig @8.8.8.8 tinova-ai.cc A
dig @8.8.8.8 www.tinova-ai.cc CNAME

# Test Cloudflare backup readiness
curl -H "Host: tinova-ai.cc" http://104.21.14.175/
```

### Quarterly Incident Response Drill
1. Simulate certificate expiration alert
2. Practice emergency response procedures  
3. Test backup SSL configuration
4. Verify contact information is current
5. Update procedures based on drill results

---

**Last Updated**: August 30, 2025  
**Document Version**: 1.0  
**Next Review**: November 30, 2025  

---

*This document should be reviewed and updated quarterly or after any SSL-related incidents.*