# Fix AWS IAM Permissions for MSC & Co Platform Deployment

## Current Issue
User `arn:aws:iam::691768187332:user/audiostems-enterprise` lacks the following permissions:
- `lambda:UpdateFunctionCode`
- `cloudformation:DescribeStacks` 
- `apigateway:GET`
- `lambda:ListFunctions`

## Solution: Add Missing Permissions

### Option 1: AWS Console (Recommended)

1. **Go to AWS IAM Console**
   - Navigate to: https://console.aws.amazon.com/iam/
   - Click "Users" in left sidebar
   - Find and click "audiostems-enterprise"

2. **Add Permissions**
   - Click "Add permissions" button
   - Select "Attach existing policies directly"
   - Search and select these policies:
     - `AWSLambdaFullAccess`
     - `CloudFormationFullAccess` 
     - `AmazonAPIGatewayAdministrator`

3. **Or Create Custom Policy**
   - Click "Add permissions" → "Create policy"
   - Select JSON tab and paste:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "lambda:UpdateFunctionCode",
                "lambda:ListFunctions",
                "lambda:GetFunction",
                "lambda:CreateFunction",
                "lambda:DeleteFunction",
                "lambda:InvokeFunction",
                "cloudformation:DescribeStacks",
                "cloudformation:DescribeStackResources",
                "cloudformation:CreateStack",
                "cloudformation:UpdateStack",
                "cloudformation:DeleteStack",
                "apigateway:GET",
                "apigateway:POST",
                "apigateway:PUT",
                "apigateway:DELETE",
                "apigateway:PATCH",
                "iam:CreateRole",
                "iam:AttachRolePolicy",
                "iam:PassRole",
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "*"
        }
    ]
}
```

### Option 2: AWS CLI (If you have admin access)

```bash
# Create policy file
aws iam put-user-policy \
  --user-name audiostems-enterprise \
  --policy-name MSCPlatformDeployment \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "lambda:UpdateFunctionCode",
                "lambda:ListFunctions",
                "lambda:GetFunction",
                "lambda:CreateFunction",
                "lambda:DeleteFunction",
                "lambda:InvokeFunction",
                "cloudformation:DescribeStacks",
                "cloudformation:DescribeStackResources",
                "cloudformation:CreateStack",
                "cloudformation:UpdateStack",
                "cloudformation:DeleteStack",
                "apigateway:*",
                "iam:CreateRole",
                "iam:AttachRolePolicy",
                "iam:PassRole",
                "logs:*"
            ],
            "Resource": "*"
        }
    ]
}'
```

## After Permissions Are Fixed

Run this command to deploy your real platform:

```bash
cd /Users/htay/Documents/GitHub\ Take\ 2/audiostems-frontend/aws-deployment
aws lambda update-function-code \
  --function-name msc-co-platform-staging-mscCoApp \
  --zip-file fileb://function-real.zip
```

## Verify Deployment

```bash
# Test the platform
curl -s "https://staging.mscandco.com/" | grep "MSC & Co"

# Check Lambda function
aws lambda get-function --function-name msc-co-platform-staging-mscCoApp
```

## Your Real Platform Features (Ready to Deploy)

✅ **5 User Roles**: Artist Starter, Artist Pro, Label Admin, Distribution Partner, Company Admin  
✅ **Auth0 Integration**: Complete authentication system  
✅ **Stripe Billing**: Payment and subscription management  
✅ **Role-Based Dashboards**: Customized for each user type  
✅ **Artist Portal**: Profile and content management  
✅ **Label Admin Tools**: Label management and analytics  
✅ **Company Admin**: Full platform administration  
✅ **Distribution Partner**: Distribution tools and workflow  

## Deployment Package Ready

Your complete platform is packaged in `function-real.zip` and ready to deploy as soon as permissions are resolved.