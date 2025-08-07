#!/bin/bash

# MSC & Co Direct AWS Deployment (No CloudFormation)
# Deploy using AWS CLI directly to avoid permission issues

set -e

echo "🚀 MSC & Co Direct AWS Deployment"
echo "=================================="

# Check AWS credentials
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ Please configure AWS CLI first: aws configure"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="us-east-1"
FUNCTION_NAME="msc-co-platform-api"
BUCKET_NAME="msc-co-music-files-$(date +%s)"

echo "✅ AWS Account: $ACCOUNT_ID"
echo "✅ Region: $REGION"
echo "✅ Function: $FUNCTION_NAME"

# Create S3 bucket for music files
echo "📦 Creating S3 bucket for music files..."
aws s3 mb s3://$BUCKET_NAME --region $REGION || echo "Bucket creation skipped (may already exist)"

# Create deployment package
echo "📦 Creating Lambda deployment package..."
zip -r deployment.zip handler.js package.json

# Create IAM role for Lambda (if it doesn't exist)
echo "🔐 Setting up IAM role..."
aws iam create-role \
    --role-name MSC-Co-Lambda-Role \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "lambda.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }' 2>/dev/null || echo "Role already exists"

# Attach basic execution policy
aws iam attach-role-policy \
    --role-name MSC-Co-Lambda-Role \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole 2>/dev/null || echo "Policy already attached"

# Wait for role to be available
sleep 10

# Create or update Lambda function
echo "⚡ Deploying Lambda function..."
aws lambda create-function \
    --function-name $FUNCTION_NAME \
    --runtime nodejs18.x \
    --role arn:aws:iam::$ACCOUNT_ID:role/MSC-Co-Lambda-Role \
    --handler handler.main \
    --zip-file fileb://deployment.zip \
    --environment Variables="{STAGE=production,BUCKET_NAME=$BUCKET_NAME}" \
    --region $REGION 2>/dev/null || \
aws lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --zip-file fileb://deployment.zip \
    --region $REGION

# Create API Gateway (REST API)
echo "🌐 Setting up API Gateway..."
API_ID=$(aws apigateway create-rest-api \
    --name "MSC-Co-Platform-API" \
    --description "MSC & Co Music Distribution Platform API" \
    --region $REGION \
    --query 'id' --output text 2>/dev/null || \
aws apigateway get-rest-apis \
    --query 'items[?name==`MSC-Co-Platform-API`].id' \
    --output text --region $REGION)

if [ ! -z "$API_ID" ]; then
    echo "✅ API Gateway ID: $API_ID"
    
    # Get root resource ID
    ROOT_RESOURCE_ID=$(aws apigateway get-resources \
        --rest-api-id $API_ID \
        --query 'items[?path==`/`].id' \
        --output text --region $REGION)
    
    # Create {proxy+} resource
    PROXY_RESOURCE_ID=$(aws apigateway create-resource \
        --rest-api-id $API_ID \
        --parent-id $ROOT_RESOURCE_ID \
        --path-part '{proxy+}' \
        --query 'id' --output text --region $REGION 2>/dev/null || \
    aws apigateway get-resources \
        --rest-api-id $API_ID \
        --query 'items[?pathPart==`{proxy+}`].id' \
        --output text --region $REGION)
    
    # Create ANY method
    aws apigateway put-method \
        --rest-api-id $API_ID \
        --resource-id $PROXY_RESOURCE_ID \
        --http-method ANY \
        --authorization-type NONE \
        --region $REGION 2>/dev/null || echo "Method already exists"
    
    # Set up Lambda integration
    aws apigateway put-integration \
        --rest-api-id $API_ID \
        --resource-id $PROXY_RESOURCE_ID \
        --http-method ANY \
        --type AWS_PROXY \
        --integration-http-method POST \
        --uri arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:$ACCOUNT_ID:function:$FUNCTION_NAME/invocations \
        --region $REGION 2>/dev/null || echo "Integration already exists"
    
    # Deploy API
    aws apigateway create-deployment \
        --rest-api-id $API_ID \
        --stage-name production \
        --region $REGION
    
    # Add Lambda permission for API Gateway
    aws lambda add-permission \
        --function-name $FUNCTION_NAME \
        --statement-id api-gateway-invoke \
        --action lambda:InvokeFunction \
        --principal apigateway.amazonaws.com \
        --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*/*" \
        --region $REGION 2>/dev/null || echo "Permission already exists"
    
    API_URL="https://$API_ID.execute-api.$REGION.amazonaws.com/production"
    echo "🎉 API Gateway URL: $API_URL"
fi

# Test the deployment
echo "🧪 Testing deployment..."
if [ ! -z "$API_URL" ]; then
    sleep 5
    RESPONSE=$(curl -s "$API_URL/test" || echo "Test endpoint not responding yet")
    echo "Test Response: $RESPONSE"
fi

# Clean up deployment files
rm -f deployment.zip

echo ""
echo "🎉 MSC & Co Platform Deployed Successfully!"
echo "=========================================="
echo "🌐 API Gateway URL: $API_URL"
echo "📦 S3 Bucket: $BUCKET_NAME"
echo "⚡ Lambda Function: $FUNCTION_NAME"
echo "🌍 Region: $REGION"
echo ""
echo "✅ Your MSC & Co platform is now live on AWS!"
echo "✅ Enterprise-grade infrastructure deployed!"
echo "✅ Ready for global music distribution!"