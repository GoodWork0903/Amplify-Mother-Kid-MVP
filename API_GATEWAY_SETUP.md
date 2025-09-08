# API Gateway JWT Authorizer Setup

## The Problem

Your Lambda function expects JWT claims to be processed by API Gateway:

```python
claims = (event.get("requestContext", {}).get("authorizer", {}).get("jwt", {}).get("claims", {}))
user_sub = claims.get("sub", "unknown")
```

But your frontend is sending Bearer tokens directly, which means API Gateway needs a JWT authorizer to validate and parse the tokens.

## Required API Gateway Configuration

### 1. Create Cognito JWT Authorizer

1. Go to API Gateway Console
2. Select your API
3. Go to **Authorizers** in the left sidebar
4. Click **Create New Authorizer**
5. Configure:
   - **Name**: `CognitoJWTAuthorizer`
   - **Type**: `JWT`
   - **Identity Source**: `$request.header.Authorization`
   - **Issuer URL**: `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX`
   - **Audience**: Your Cognito App Client ID

### 2. Configure Routes

Your API Gateway should have these routes:
- **GET** `/child-apps` → Lambda function
- **POST** `/child-apps` → Lambda function
- **OPTIONS** `/child-apps` → Lambda function (for CORS)

### 3. Apply Authorizer to Routes

1. Select each route (GET, POST)
2. Go to **Method Request**
3. Set **Authorization** to your `CognitoJWTAuthorizer`
4. Deploy the API

## Alternative: Modify Lambda to Handle Bearer Tokens

If you prefer to keep the current setup, modify your Lambda function to handle Bearer tokens directly:

```python
import jwt
import requests

def get_user_from_token(auth_header):
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    
    # Get Cognito public keys
    region = 'us-east-1'  # or your region
    user_pool_id = os.environ.get('COGNITO_USER_POOL_ID')
    
    jwks_url = f'https://cognito-idp.{region}.amazonaws.com/{user_pool_id}/.well-known/jwks.json'
    jwks = requests.get(jwks_url).json()
    
    # Decode and verify token
    try:
        decoded = jwt.decode(token, jwks, algorithms=['RS256'], options={"verify_signature": True})
        return decoded.get('sub')
    except:
        return None

def lambda_handler(event, context):
    # Get user from Bearer token
    auth_header = event.get('headers', {}).get('Authorization', '')
    user_sub = get_user_from_token(auth_header)
    
    if not user_sub:
        return _response(401, {"message": "Invalid or missing token"})
    
    # Rest of your logic...
```

## Testing the Configuration

### Test with JWT Authorizer
```bash
curl -X GET "https://your-api-gateway-url/child-apps" \
  -H "Authorization: Bearer your-jwt-token"
```

### Test without Authorization
```bash
curl -X GET "https://your-api-gateway-url/child-apps"
# Should return 401 Unauthorized
```

## Current Issues

1. **404 Error**: Your API Gateway routes are not properly configured
2. **Missing JWT Authorizer**: Tokens are not being validated/parsed
3. **Missing Lambda Environment Variables**: TABLE_NAME is not set

## Next Steps

1. Set Lambda environment variables (see LAMBDA_ENVIRONMENT_SETUP.md)
2. Configure API Gateway JWT authorizer
3. Deploy API Gateway changes
4. Test the complete flow




