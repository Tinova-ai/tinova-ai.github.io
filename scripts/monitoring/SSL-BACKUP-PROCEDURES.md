# SSL Certificate Backup and Recovery Procedures

This document outlines backup strategies and recovery procedures for SSL certificates for tinova-ai.cc domains.

## Overview

The tinova-ai.cc domains use a hybrid SSL approach with multiple backup layers:
1. **Primary**: GitHub Pages with Let's Encrypt auto-renewal
2. **Backup**: Cloudflare Universal SSL 
3. **Emergency**: Manual certificate deployment

## Current SSL Configuration

### Primary Configuration (GitHub Pages)
```
Domain: tinova-ai.cc
Certificate Authority: Let's Encrypt (via GitHub Pages)
Renewal: Automatic (GitHub managed)
Certificate Type: Domain Validated (DV)
Subject Alternative Names: tinova-ai.cc, auth.tinova-ai.cc
Validity Period: 90 days
```

### DNS Configuration
```
# Root domain (GitHub Pages)
tinova-ai.cc.     300   IN   A       185.199.108.153
tinova-ai.cc.     300   IN   A       185.199.109.153  
tinova-ai.cc.     300   IN   A       185.199.110.153
tinova-ai.cc.     300   IN   A       185.199.111.153

# WWW subdomain (Cloudflare proxied)
www.tinova-ai.cc. 300   IN   CNAME   tinova-ai.cc
```

## Backup Strategy 1: Cloudflare Universal SSL

### Configuration Details
- **Provider**: Cloudflare Universal SSL
- **Certificate Authority**: Google Trust Services / Digicert
- **Coverage**: tinova-ai.cc, *.tinova-ai.cc
- **Validity**: Up to 1 year
- **Cost**: Free (included with Cloudflare Free plan)

### Activation Procedure

1. **Update DNS to Cloudflare Proxy**
   ```bash
   # Using Cloudflare API (requires API token)
   curl -X PUT "https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records/{dns_record_id}" \
        -H "Authorization: Bearer {api_token}" \
        -H "Content-Type: application/json" \
        --data '{"type":"A","name":"tinova-ai.cc","content":"104.21.14.175","proxied":true}'
   ```

2. **Enable SSL Settings**
   - SSL Mode: Full (Strict)
   - Always Use HTTPS: Enabled
   - HSTS: Enabled
   - Certificate Transparency Monitoring: Enabled

3. **Verification Commands**
   ```bash
   # Check SSL certificate after switch
   echo | openssl s_client -connect tinova-ai.cc:443 -servername tinova-ai.cc | openssl x509 -noout -issuer -dates
   
   # Verify certificate chain
   curl -sI https://tinova-ai.cc | grep -i "server\|cf-"
   ```

### Rollback to GitHub Pages
```bash
# Revert DNS to GitHub Pages
curl -X PUT "https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records/{dns_record_id}" \
     -H "Authorization: Bearer {api_token}" \
     -H "Content-Type: application/json" \
     --data '{"type":"A","name":"tinova-ai.cc","content":"185.199.108.153","proxied":false}'

# Wait for DNS propagation (5-10 minutes)
# Verify GitHub Pages SSL reactivation
```

## Backup Strategy 2: Manual Let's Encrypt Certificate

### Prerequisites
- Server with public IP address
- Domain control validation capability
- Certbot or ACME client installed

### Certificate Generation
```bash
# Install certbot (macOS)
brew install certbot

# Generate certificate using DNS challenge
certbot certonly \
  --manual \
  --preferred-challenges dns \
  --email admin@tinova-ai.cc \
  --agree-tos \
  --domains tinova-ai.cc,www.tinova-ai.cc

# Manual DNS verification will be required
# Certbot will provide TXT records to add to DNS
```

### Certificate Deployment Options

#### Option 1: Simple HTTP Server (nginx)
```nginx
server {
    listen 80;
    server_name tinova-ai.cc www.tinova-ai.cc;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tinova-ai.cc www.tinova-ai.cc;
    
    ssl_certificate /etc/letsencrypt/live/tinova-ai.cc/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tinova-ai.cc/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    location / {
        proxy_pass https://tinova-ai.github.io;
        proxy_set_header Host tinova-ai.github.io;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Option 2: Cloudflare Origin Certificate
```bash
# Generate Cloudflare origin certificate
# 1. Login to Cloudflare dashboard
# 2. Go to SSL/TLS → Origin Server
# 3. Create certificate for tinova-ai.cc, *.tinova-ai.cc
# 4. Download certificate and private key
# 5. Configure on origin server

# Example nginx configuration with origin certificate
ssl_certificate /path/to/cloudflare-origin.pem;
ssl_certificate_key /path/to/cloudflare-origin.key;
```

## Certificate Monitoring and Backup

### Automated Certificate Backup
```bash
#!/bin/bash
# Certificate backup script

BACKUP_DIR="/etc/ssl/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup current certificates
if [[ -d "/etc/letsencrypt/live/tinova-ai.cc" ]]; then
    cp -r /etc/letsencrypt/live/tinova-ai.cc "$BACKUP_DIR/letsencrypt_${DATE}/"
    echo "Let's Encrypt certificates backed up to $BACKUP_DIR/letsencrypt_${DATE}/"
fi

# Export current certificate from website
echo | openssl s_client -connect tinova-ai.cc:443 -servername tinova-ai.cc 2>/dev/null | \
    openssl x509 > "$BACKUP_DIR/current_cert_${DATE}.pem"

echo "Current certificate exported to $BACKUP_DIR/current_cert_${DATE}.pem"
```

### Certificate Validation Script
```bash
#!/bin/bash
# Validate certificate backup

validate_certificate_backup() {
    local cert_file="$1"
    
    if [[ ! -f "$cert_file" ]]; then
        echo "ERROR: Certificate file not found: $cert_file"
        return 1
    fi
    
    # Check certificate validity
    if openssl x509 -noout -text -in "$cert_file" >/dev/null 2>&1; then
        echo "✓ Certificate file is valid: $cert_file"
        
        # Display certificate details
        echo "Subject: $(openssl x509 -noout -subject -in "$cert_file" | sed 's/subject=//')"
        echo "Issuer: $(openssl x509 -noout -issuer -in "$cert_file" | sed 's/issuer=//')"
        echo "Validity: $(openssl x509 -noout -dates -in "$cert_file")"
        return 0
    else
        echo "✗ Certificate file is invalid: $cert_file"
        return 1
    fi
}
```

## Emergency Recovery Procedures

### Scenario 1: GitHub Pages SSL Failure

**Immediate Response (< 30 minutes):**

1. **Activate Cloudflare SSL Proxy**
   ```bash
   # Script to switch to Cloudflare
   ./scripts/monitoring/emergency-ssl-switch.sh cloudflare
   ```

2. **Verify SSL Functionality**
   ```bash
   # Test SSL after switch
   curl -sI https://tinova-ai.cc | head -5
   ./scripts/monitoring/ssl-monitor.sh --domain tinova-ai.cc
   ```

3. **Monitor Recovery**
   - Check SSL certificate issuer changed to Cloudflare/Google
   - Verify website loads properly with HTTPS
   - Update monitoring alerts

### Scenario 2: Complete SSL Infrastructure Failure

**Emergency Deployment (< 1 hour):**

1. **Deploy Manual Certificate Server**
   ```bash
   # Quick server deployment script
   ./scripts/monitoring/deploy-emergency-ssl.sh
   ```

2. **Update DNS Records**
   ```bash
   # Point domain to emergency server
   # Update A records to emergency server IP
   # Temporary measure until primary service restored
   ```

3. **Validate Emergency Setup**
   ```bash
   # Verify emergency SSL is working
   ./scripts/monitoring/ssl-monitor.sh --domain tinova-ai.cc
   curl -sI https://tinova-ai.cc
   ```

## Recovery Testing

### Monthly Backup Validation
```bash
# Test certificate backup integrity
find /etc/ssl/backups -name "*.pem" -mtime -30 -exec ./validate_certificate_backup.sh {} \;

# Test Cloudflare failover capability  
./scripts/monitoring/ssl-failover-test.sh

# Verify manual certificate generation process
./scripts/monitoring/test-manual-cert-generation.sh --dry-run
```

### Quarterly Disaster Recovery Drill
1. **Simulate GitHub Pages SSL failure**
2. **Practice Cloudflare failover activation**
3. **Test manual certificate deployment**
4. **Verify monitoring system detection and alerts**
5. **Document response times and issues**
6. **Update procedures based on drill results**

## Backup Storage and Security

### Certificate Storage Locations
```
Primary Backup: /etc/ssl/backups/
Secondary Backup: Cloud storage (encrypted)
Emergency Access: Secure password manager
Key Management: Hardware security module (if available)
```

### Security Considerations
- **Encryption**: All backup certificates encrypted at rest
- **Access Control**: Limited to authorized administrators only  
- **Audit Trail**: All certificate operations logged
- **Key Rotation**: Regular rotation of backup encryption keys
- **Compliance**: Follows security best practices for certificate management

### Automated Backup Schedule
```bash
# Daily certificate status backup
0 2 * * * /scripts/monitoring/backup-ssl-status.sh

# Weekly full certificate backup
0 3 * * 0 /scripts/monitoring/backup-ssl-certificates.sh

# Monthly backup validation
0 4 1 * * /scripts/monitoring/validate-ssl-backups.sh
```

---

**Last Updated**: August 30, 2025  
**Document Version**: 1.0  
**Next Review**: November 30, 2025

---

*This document should be tested quarterly and updated after any SSL infrastructure changes.*