# Lambda Function Environment Variables Setup

## Required Environment Variables

Your Lambda function requires the following environment variables to be set:

### 1. TABLE_NAME (REQUIRED)
- **Purpose**: DynamoDB table name where child apps are stored
- **Format**: `your-dynamodb-table-name`
- **Example**: `MotherApp-ChildApps-Prod`
- **Error if missing**: Returns 500 error "Server misconfigured: TABLE_NAME env var not set"

### 2. CORS_ORIGIN (Optional)
- **Purpose**: CORS origin for API responses
- **Default**: `*` (allows all origins)
- **Recommended**: `http://localhost:3000` for development, your production domain for production
- **Example**: `https://yourdomain.com`

### 3. INDEX_NAME (Optional)
- **Purpose**: Global Secondary Index name for DynamoDB queries
- **Default**: `GSI1CreatedBy`
- **Example**: `GSI1CreatedBy` or your custom GSI name

## How to Set Environment Variables

### Option 1: AWS Console
1. Go to AWS Lambda Console
2. Find your lambda function
3. Go to Configuration → Environment variables
4. Add the required variables

### Option 2: AWS CLI
```bash
aws lambda update-function-configuration \
  --function-name your-lambda-function-name \
  --environment Variables='{
    "TABLE_NAME":"your-dynamodb-table-name",
    "CORS_ORIGIN":"http://localhost:3000",
    "INDEX_NAME":"GSI1CreatedBy"
  }'
```

### Option 3: CloudFormation/SAM Template
```yaml
Environment:
  Variables:
    TABLE_NAME: !Ref DynamoDBTable
    CORS_ORIGIN: !Ref CorsOrigin
    INDEX_NAME: GSI1CreatedBy
```

## DynamoDB Table Requirements

Your DynamoDB table should have:
- **Primary Key**: `id` (String)
- **Global Secondary Index**: `GSI1CreatedBy` (or whatever you set in INDEX_NAME)
  - **Partition Key**: `createdBy` (String)
  - **Sort Key**: `createdAt` (String)

## API Gateway Configuration

Your API Gateway must be configured with:
1. **Cognito JWT Authorizer** that validates tokens from your Cognito User Pool
2. **Route**: `/child-apps` that points to your Lambda function
3. **Method**: GET and POST

## Testing the Setup

After setting environment variables, test with:
```bash
curl -X GET "https://your-api-gateway-url/child-apps" \
  -H "Authorization: Bearer your-jwt-token"
```

Expected responses:
- **Success**: `{"items": [...]}`
- **Missing TABLE_NAME**: `{"message": "Server misconfigured: TABLE_NAME env var not set"}`
- **Auth Error**: Depends on your API Gateway JWT authorizer configuration




