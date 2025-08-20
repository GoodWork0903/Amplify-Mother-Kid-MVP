# Mother/Kid SaaS Platform

A modern, secure SaaS platform built with Next.js 15, TypeScript, and AWS Cognito for authentication.

## Features

- **Secure Authentication**: AWS Cognito Hosted UI integration
- **Multi-Tenant Architecture**: Isolated tenant environments
- **Role-Based Access Control**: Admin and tenant user management
- **Modern UI**: Built with Tailwind CSS and responsive design
- **API Proxy**: Secure forwarding to API Gateway
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: AWS Cognito
- **API**: Local proxy to API Gateway
- **Cookies**: httpOnly cookies for secure token storage

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin portal routes
│   ├── (tenant)/          # Tenant portal routes
│   ├── auth/              # Authentication routes
│   │   ├── callback/      # OAuth callback
│   │   └── logout/        # Logout route
│   ├── api/               # API routes
│   │   └── proxy/         # API Gateway proxy
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
└── lib/                   # Utility libraries
    ├── auth.ts            # Cognito authentication
    ├── session.ts         # Session management
    ├── api.ts             # API utilities
    └── config.ts          # Configuration
```

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Cognito Configuration
COGNITO_USER_POOL_ID=your_user_pool_id
COGNITO_CLIENT_ID=your_client_id
COGNITO_CLIENT_SECRET=your_client_secret
COGNITO_DOMAIN=your_cognito_domain
COGNITO_REGION=your_aws_region
COGNITO_REDIRECT_URI=http://localhost:3000/auth/callback
COGNITO_LOGOUT_URI=http://localhost:3000

# API Configuration
API_BASE_URL=https://your-api-gateway-url.amazonaws.com

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   - Copy the environment variables above to `.env.local`
   - Fill in your AWS Cognito and API Gateway details

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Access admin portal at `/admin`
   - Access tenant portal at `/t/[tenant-name]`

## Authentication Flow

1. **Unauthenticated Access**: Users trying to access protected routes are redirected to Cognito Hosted UI
2. **Login**: Users authenticate through Cognito's hosted interface
3. **Callback**: After successful authentication, users are redirected to `/auth/callback`
4. **Token Exchange**: The callback route exchanges the authorization code for tokens
5. **Session Creation**: Tokens are stored in httpOnly cookies
6. **Redirect**: Users are redirected to their intended destination

## API Integration

All API calls go through the local proxy at `/api/proxy` which:
- Validates user sessions
- Forwards requests to API Gateway
- Includes the `Authorization: Bearer <access_token>` header
- Maintains security by keeping tokens server-side

## Security Features

- **httpOnly Cookies**: Tokens are stored securely and inaccessible to JavaScript
- **Automatic Redirects**: Unauthenticated users are automatically redirected to login
- **Token Validation**: JWT tokens are validated using Cognito's JWKS
- **Session Management**: Secure session handling with automatic expiration

## Deployment

The application is ready for deployment to:
- Vercel
- AWS Amplify
- Any Node.js hosting platform

Ensure your environment variables are properly configured in your deployment environment.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
