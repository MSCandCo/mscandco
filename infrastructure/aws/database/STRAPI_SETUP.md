# Strapi Configuration for AWS RDS Database

This guide will help you configure your Strapi backend to connect to the AWS RDS PostgreSQL database.

## Prerequisites

1. ✅ AWS RDS database deployed (using the Terraform configuration)
2. ✅ Database connection details from Terraform outputs
3. ✅ Strapi backend code ready

## Step 1: Get Database Connection Details

After deploying the AWS database, get the connection details:

```bash
cd infrastructure/aws/database
terraform output database_endpoint
terraform output database_name
terraform output database_username
```

## Step 2: Configure Strapi Environment

### Create Production Environment File

Create a `.env` file in your Strapi backend root:

```bash
cd audiostems-backend
cp env.production.example .env
```

### Update Environment Variables

Edit the `.env` file with your AWS RDS details:

```env
# Database Configuration for AWS RDS
DATABASE_CLIENT=postgres
DATABASE_HOST=your-rds-endpoint.region.rds.amazonaws.com
DATABASE_PORT=5432
DATABASE_NAME=audiostems
DATABASE_USERNAME=audiostems_admin
DATABASE_PASSWORD=your-secure-password
DATABASE_SSL=true
DATABASE_SCHEMA=public

# Connection Pool Settings
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_TIMEOUT=60000
DATABASE_DEBUG=false

# Strapi Configuration
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys-here
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
JWT_SECRET=your-jwt-secret

# File Upload Configuration
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_KEY=your-cloudinary-key
CLOUDINARY_SECRET=your-cloudinary-secret

# Stripe Configuration
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Email Configuration
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
```

## Step 3: Install PostgreSQL Dependencies

Make sure you have the PostgreSQL client installed:

```bash
# Install PostgreSQL client (macOS)
brew install postgresql

# Install PostgreSQL client (Ubuntu/Debian)
sudo apt-get install postgresql-client

# Install PostgreSQL client (CentOS/RHEL)
sudo yum install postgresql
```

## Step 4: Test Database Connection

Test the connection using psql:

```bash
psql -h your-rds-endpoint.region.rds.amazonaws.com -U audiostems_admin -d audiostems -p 5432
```

You should be prompted for the password. If successful, you'll see the PostgreSQL prompt.

## Step 5: Install Strapi Dependencies

Install the PostgreSQL driver for Strapi:

```bash
cd audiostems-backend
npm install pg
```

## Step 6: Run Strapi Database Migrations

Initialize the database with Strapi:

```bash
# Build Strapi
npm run build

# Start Strapi in production mode
NODE_ENV=production npm run start
```

Or run the development server:

```bash
npm run develop
```

## Step 7: Verify Database Connection

Check that Strapi is connected to the database:

1. Start Strapi
2. Access the admin panel at `http://localhost:1337/admin`
3. Create your first admin user
4. Check the database tables are created

## Step 8: Configure SSL (Optional but Recommended)

For production, configure SSL certificates:

### Option 1: Use AWS RDS SSL Certificate

Download the AWS RDS SSL certificate:

```bash
wget https://s3.amazonaws.com/rds-downloads/rds-ca-2019-root.pem
```

Update your `.env` file:

```env
DATABASE_SSL_CA=/path/to/rds-ca-2019-root.pem
```

### Option 2: Disable SSL Verification (Development Only)

For development, you can disable SSL verification:

```env
DATABASE_SSL=false
```

## Step 9: Performance Optimization

### Connection Pooling

The configuration includes connection pooling settings:

```env
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_TIMEOUT=60000
```

### Database Parameters

The AWS RDS instance is configured with optimized parameters:

- `log_connections = 1` - Log all connections
- `log_disconnections = 1` - Log all disconnections
- `log_min_duration_statement = 1000` - Log slow queries (>1s)
- `log_statement = all` - Log all statements
- `shared_preload_libraries = pg_stat_statements` - Enable query statistics

## Step 10: Monitoring and Alerts

### CloudWatch Alarms

The database is configured with CloudWatch alarms for:

- CPU Utilization (>80%)
- Database Connections (>80%)
- Free Storage Space (<20%)

### Performance Insights

Enable Performance Insights in the AWS RDS console to monitor:

- Query performance
- Wait events
- Load analysis

## Troubleshooting

### Common Issues

1. **Connection Refused**
   ```
   Error: connect ECONNREFUSED
   ```
   - Check security group rules
   - Verify VPC configuration
   - Ensure application is in correct subnet

2. **SSL Connection Issues**
   ```
   Error: self signed certificate
   ```
   - Download AWS RDS SSL certificate
   - Configure SSL settings in .env
   - Or disable SSL for development

3. **Authentication Failed**
   ```
   Error: password authentication failed
   ```
   - Verify database username/password
   - Check if user exists in database
   - Reset password if needed

4. **Database Does Not Exist**
   ```
   Error: database "audiostems" does not exist
   ```
   - Create database manually
   - Check database name in .env
   - Verify RDS instance is running

### Useful Commands

```bash
# Check database status
aws rds describe-db-instances --db-instance-identifier audiostems-database

# View CloudWatch metrics
aws cloudwatch get-metric-statistics --namespace AWS/RDS --metric-name CPUUtilization

# Test database connection
psql -h <endpoint> -U <username> -d <database> -p 5432

# Check Strapi logs
tail -f .tmp/logs/strapi.log
```

### Debug Mode

Enable database debugging in your `.env`:

```env
DATABASE_DEBUG=true
```

This will log all database queries to the console.

## Security Best Practices

1. **Use Strong Passwords**
   - Generate secure passwords
   - Rotate passwords regularly
   - Use AWS Secrets Manager for production

2. **Network Security**
   - Keep database in private subnets
   - Use security groups to restrict access
   - Enable SSL/TLS encryption

3. **Access Control**
   - Use IAM roles when possible
   - Limit database user permissions
   - Monitor access logs

4. **Backup and Recovery**
   - Enable automated backups
   - Test restore procedures
   - Store backups in different regions

## Next Steps

1. **Set up automated deployments** using CI/CD
2. **Configure monitoring dashboards** in CloudWatch
3. **Set up read replicas** for read-heavy workloads
4. **Implement database migrations** for schema changes
5. **Configure backup retention policies**

## Support

If you encounter issues:

1. Check the [Strapi documentation](https://docs.strapi.io/)
2. Review [AWS RDS documentation](https://docs.aws.amazon.com/rds/)
3. Check CloudWatch logs for database issues
4. Test connection manually with psql 