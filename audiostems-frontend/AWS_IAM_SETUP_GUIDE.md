# 🔐 MSC & Co Enterprise AWS IAM Setup Guide

## Step 1: Create Proper IAM User with Full Permissions

### 1.1 Login to AWS Console
1. Go to [AWS Console](https://aws.amazon.com/console/)
2. Navigate to **IAM** service
3. Click **Users** in the left sidebar

### 1.2 Create New IAM User
```
User name: MSC-Co-Enterprise-Deploy
Access type: ✅ Programmatic access
```

### 1.3 Attach Enterprise-Grade Policies

**Required Policies for MSC & Co Enterprise Deployment:**

#### Core Infrastructure Policies:
- ✅ **AdministratorAccess** (For complete enterprise deployment)

#### Or Individual Policies (if you prefer granular control):
- ✅ **AWSCloudFormationFullAccess**
- ✅ **AWSLambdaFullAccess** 
- ✅ **AmazonS3FullAccess**
- ✅ **CloudFrontFullAccess**
- ✅ **AmazonAPIGatewayAdministrator**
- ✅ **AmazonRDSFullAccess**
- ✅ **AmazonCognitoPowerUser**
- ✅ **CloudWatchFullAccess**
- ✅ **AWSWAFFullAccess**
- ✅ **AmazonRoute53FullAccess**
- ✅ **IAMFullAccess**
- ✅ **AmazonVPCFullAccess**
- ✅ **AmazonEC2FullAccess**
- ✅ **AmazonSNSFullAccess**
- ✅ **AmazonSQSFullAccess**

#### Custom Enterprise Policy (Recommended):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cloudformation:*",
                "lambda:*",
                "s3:*",
                "cloudfront:*",
                "apigateway:*",
                "rds:*",
                "cognito-idp:*",
                "cognito-identity:*",
                "cloudwatch:*",
                "wafv2:*",
                "route53:*",
                "iam:*",
                "vpc:*",
                "ec2:*",
                "sns:*",
                "sqs:*",
                "logs:*",
                "ssm:*",
                "kms:*",
                "acm:*",
                "elasticloadbalancing:*",
                "autoscaling:*",
                "application-autoscaling:*",
                "sts:*"
            ],
            "Resource": "*"
        }
    ]
}
```

### 1.4 Download Access Keys
1. **IMPORTANT**: Download the `credentials.csv` file
2. Save the **Access Key ID** and **Secret Access Key**
3. Store these securely (you won't see the Secret Key again)

## Step 2: Configure AWS CLI Credentials

### 2.1 Install/Update AWS CLI
```bash
# macOS
brew install awscli

# Or update
brew upgrade awscli
```

### 2.2 Configure Enterprise Profile
```bash
aws configure --profile msc-co-enterprise
```

**Enter the following:**
```
AWS Access Key ID: [Your new Access Key ID]
AWS Secret Access Key: [Your new Secret Access Key]
Default region name: us-east-1
Default output format: json
```

### 2.3 Verify Permissions
```bash
# Test CloudFormation access
aws cloudformation describe-stacks --profile msc-co-enterprise

# Test Lambda access
aws lambda list-functions --profile msc-co-enterprise

# Test S3 access
aws s3 ls --profile msc-co-enterprise
```

## Step 3: Update Environment Variables

### 3.1 Set Default Profile
```bash
export AWS_PROFILE=msc-co-enterprise
```

### 3.2 Verify Account Access
```bash
aws sts get-caller-identity --profile msc-co-enterprise
```

**Expected Output:**
```json
{
    "UserId": "AIDA...",
    "Account": "691768187332",
    "Arn": "arn:aws:iam::691768187332:user/MSC-Co-Enterprise-Deploy"
}
```

## Step 4: Configure Serverless Framework

### 4.1 Update Serverless Credentials
```bash
serverless config credentials --provider aws --key YOUR_ACCESS_KEY --secret YOUR_SECRET_KEY --profile msc-co-enterprise
```

### 4.2 Verify Serverless Access
```bash
serverless info --stage production --region us-east-1
```

## Step 5: Security Best Practices

### 5.1 Enable MFA (Multi-Factor Authentication)
1. Go to IAM → Users → MSC-Co-Enterprise-Deploy
2. Click **Security credentials** tab
3. Click **Assign MFA device**
4. Follow setup instructions

### 5.2 Set Up Temporary Credentials (Recommended)
```bash
# Use AWS STS for temporary credentials
aws sts assume-role --role-arn arn:aws:iam::ACCOUNT:role/MSC-Co-Deploy-Role --role-session-name MSC-Co-Session --profile msc-co-enterprise
```

## Step 6: Ready for Enterprise Deployment

Once these steps are complete, you'll have:

✅ **Full AWS Enterprise Access**
✅ **CloudFormation Deployment Rights**
✅ **Complete Infrastructure Permissions**
✅ **Secure Credential Management**
✅ **Professional-Grade Setup**

## Next Steps

After completing this IAM setup:

1. ✅ Return to deployment directory
2. ✅ Run enterprise Serverless deployment
3. ✅ Deploy complete infrastructure stack
4. ✅ Launch ultimate MSC & Co platform

---

## 🚨 IMPORTANT SECURITY NOTES:

- **Never commit AWS credentials to version control**
- **Use IAM roles for production environments**
- **Enable CloudTrail for audit logging**
- **Regularly rotate access keys**
- **Use least privilege principle in production**

---

**Ready to deploy the most advanced music distribution platform ever built! 🚀**