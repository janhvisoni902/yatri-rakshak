# MongoDB Atlas Setup Guide for Yatri Rakshak

## Quick Setup Steps

### 1. Create MongoDB Atlas Account
- Visit: https://www.mongodb.com/atlas
- Sign up for free account
- Verify your email

### 2. Create New Project
- Click "New Project"
- Name: "Yatri Rakshak Production"
- Add team members if needed

### 3. Create Database Cluster

#### For Development/Testing (FREE):
- Choose M0 Sandbox (512 MB storage, shared RAM)
- Select AWS/Google Cloud/Azure
- Choose region closest to your users
- Cluster name: `yatrirakshak-dev`

#### For Production:
- Choose M2+ (2GB+ storage, dedicated RAM)
- Enable backup and monitoring
- Cluster name: `yatrirakshak-prod`

### 4. Database User Setup
```
Username: yatri_admin
Password: [Generate strong password - save securely]
Database User Privileges: Read and write to any database
```

### 5. Network Access Configuration

#### Development:
- Add your current IP address
- Or use 0.0.0.0/0 for testing (less secure)

#### Production:
- Add your server's specific IP addresses
- Add your deployment platform IPs (Vercel, Netlify, etc.)

### 6. Get Connection String

Your connection string will look like:
```
mongodb+srv://yatri_admin:YOUR_PASSWORD@yatrirakshak-prod.xxxxx.mongodb.net/yatrirakshak?retryWrites=true&w=majority
```

Replace:
- `yatri_admin` with your username
- `YOUR_PASSWORD` with your actual password
- `yatrirakshak-prod.xxxxx` with your actual cluster address
- `yatrirakshak` with your database name

## Environment Configuration

### Development (.env.local):
```env
MONGODB_URI=mongodb+srv://yatri_admin:YOUR_DEV_PASSWORD@yatrirakshak-dev.xxxxx.mongodb.net/yatrirakshak_dev?retryWrites=true&w=majority
```

### Production (.env.production):
```env
MONGODB_URI=mongodb+srv://yatri_admin:YOUR_PROD_PASSWORD@yatrirakshak-prod.xxxxx.mongodb.net/yatrirakshak?retryWrites=true&w=majority
```

## Security Best Practices

### 1. Strong Passwords
- Use 16+ character passwords
- Include uppercase, lowercase, numbers, symbols
- Use password managers

### 2. IP Whitelisting
- Never use 0.0.0.0/0 in production
- Add only necessary IP addresses
- Update IPs when servers change

### 3. Database Users
- Create separate users for different environments
- Use least privilege principle
- Rotate passwords regularly

### 4. Connection Security
- Always use SSL/TLS (included in connection string)
- Use connection pooling
- Set appropriate timeouts

## Database Structure

### Collections:
- `users` - User accounts and profiles
- `incidents` - Incident reports and tracking
- `tourist_alerts` - Safety alerts and notifications
- `kyc_applications` - KYC verification data
- `system_logs` - Application logs and audit trails
- `digital_ids` - Digital identity cards
- `trips` - Tourist trip planning data

### Indexes (for performance):
```javascript
// Users collection
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })

// Incidents collection
db.incidents.createIndex({ "status": 1 })
db.incidents.createIndex({ "priority": 1 })
db.incidents.createIndex({ "location": "2dsphere" })

// Tourist alerts collection
db.tourist_alerts.createIndex({ "touristId": 1 })
db.tourist_alerts.createIndex({ "status": 1 })
db.tourist_alerts.createIndex({ "timestamp": -1 })
```

## Monitoring and Maintenance

### 1. Atlas Monitoring
- Enable real-time performance advisor
- Set up custom alerts for:
  - High CPU usage (>80%)
  - High memory usage (>85%)
  - Slow queries (>100ms)
  - Connection spikes

### 2. Backup Strategy
- Enable continuous backup (M2+)
- Set retention period (7-30 days)
- Test restore procedures monthly

### 3. Performance Optimization
- Monitor slow queries
- Add indexes for frequent queries
- Use aggregation pipelines efficiently
- Implement connection pooling

## Troubleshooting

### Common Issues:

#### Connection Timeout:
- Check IP whitelist
- Verify credentials
- Check network connectivity

#### Authentication Failed:
- Verify username/password
- Check user permissions
- Ensure correct database name

#### Slow Queries:
- Add appropriate indexes
- Optimize query patterns
- Use explain() to analyze queries

### Support Resources:
- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- Community Forums: https://community.mongodb.com/
- Support Tickets: Available for paid tiers

## Cost Optimization

### Free Tier (M0):
- 512 MB storage
- Shared RAM and vCPU
- No backup
- Good for development/testing

### Production Tiers:
- M2: $9/month - 2GB storage, dedicated RAM
- M5: $25/month - 5GB storage, better performance
- M10+: Scalable based on needs

### Tips:
- Start with M2 for small production
- Monitor usage and scale as needed
- Use data archiving for old records
- Implement data retention policies

---

**Security Note**: Never commit actual credentials to version control. Always use environment variables and secure secret management.