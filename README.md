# TOTP Proof of Concept

A complete TypeScript Node.js implementation of Time-based One-Time Password (TOTP) authentication with two-factor authentication (2FA) support.

## Features

- ✅ User registration and authentication
- ✅ JWT-based authentication
- ✅ TOTP setup with QR code generation
- ✅ Two-factor authentication (2FA) flow
- ✅ Backup codes generation and management
- ✅ Encrypted TOTP secret storage (AES-256-GCM)
- ✅ Rate limiting on TOTP verification endpoints
- ✅ Comprehensive input validation
- ✅ Unit and integration tests

## Prerequisites

- Node.js 20.x or higher
- npm 9.x or higher

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd totp
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file from the example:

```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=24h
ENCRYPTION_KEY=32-character-key-for-aes-256
DB_PATH=./totp-poc.db
BCRYPT_ROUNDS=10
TOTP_ISSUER=PoC
```

**Important**:

- `JWT_SECRET` must be at least 32 characters long
- `ENCRYPTION_KEY` must be exactly 32 characters long
- Generate secure random keys for production use

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Validation Rules:**

- Username: 3-20 characters, alphanumeric, underscores, hyphens
- Email: Valid email format
- Password: Minimum 8 characters, at least one uppercase, one lowercase, one number

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "SecurePass123"
}
```

**Response (TOTP not enabled):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (TOTP enabled):**

```json
{
  "tokenKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "requiresTotp": true
}
```

#### Complete 2FA Login

```http
POST /api/auth/login-2fa
Content-Type: application/json

{
  "tokenKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "totpCode": "123456"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### TOTP Management Endpoints

All TOTP endpoints require authentication via Bearer token:

```http
Authorization: Bearer <your-jwt-token>
```

#### Setup TOTP

```http
POST /api/totp/setup
Authorization: Bearer <token>
```

**Response:**

```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "backupCodes": [
    "A1B2C3D4",
    "E5F6G7H8",
    ...
  ]
}
```

**Steps:**

1. Call this endpoint to get the QR code
2. Scan the QR code with an authenticator app (Google Authenticator, Authy, etc.)
3. Verify the TOTP code from the app
4. Enable TOTP

#### Verify TOTP Code (During Setup)

```http
POST /api/totp/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "totpCode": "123456"
}
```

**Response:**

```json
{
  "success": true
}
```

#### Enable TOTP

```http
POST /api/totp/enable
Authorization: Bearer <token>
Content-Type: application/json

{
  "totpCode": "123456"
}
```

**Response:**

```json
{
  "success": true
}
```

#### Get TOTP Status

```http
GET /api/totp/status
Authorization: Bearer <token>
```

**Response:**

```json
{
  "enabled": true,
  "enabledAt": "2024-01-15T10:30:00.000Z"
}
```

#### Disable TOTP

```http
POST /api/totp/disable
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "SecurePass123"
}
```

**Response:**

```json
{
  "success": true
}
```

#### Regenerate Backup Codes

```http
POST /api/totp/backup-codes
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "SecurePass123"
}
```

**Response:**

```json
{
  "backupCodes": [
    "A1B2C3D4",
    "E5F6G7H8",
    ...
  ]
}
```

## Example Usage Flow

### Using httpyac (Recommended)

The project includes httpyac command files for easy API testing:

- `api.http` - All API endpoints with variables
- `api-examples.http` - Complete example flow with step-by-step instructions

To use httpyac:

1. Install httpyac (included in devDependencies):

   ```bash
   npm install
   ```

2. Use httpyac CLI or VS Code extension:

   ```bash
   npx httpyac api.http
   ```

3. Or use the VS Code REST Client extension to run requests directly from the `.http` files

### Using curl

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "SecurePass123"
  }'
```

Save the `token` from the response.

### 3. Setup TOTP

```bash
curl -X POST http://localhost:3000/api/totp/setup \
  -H "Authorization: Bearer <your-token>"
```

Save the `qrCode` (base64 image) and `backupCodes`.

### 4. Scan QR Code

- Decode the base64 QR code image or use a QR code decoder
- Scan with Google Authenticator, Authy, or any TOTP-compatible app
- Get the 6-digit code from the app

### 5. Verify TOTP Code

```bash
curl -X POST http://localhost:3000/api/totp/verify \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "totpCode": "123456"
  }'
```

### 6. Enable TOTP

```bash
curl -X POST http://localhost:3000/api/totp/enable \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "totpCode": "123456"
  }'
```

### 7. Login with 2FA

```bash
# Step 1: Login (returns tokenKey)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "SecurePass123"
  }'

# Step 2: Complete 2FA (use tokenKey and TOTP code)
curl -X POST http://localhost:3000/api/auth/login-2fa \
  -H "Content-Type: application/json" \
  -d '{
    "tokenKey": "<tokenKey-from-step-1>",
    "totpCode": "123456"
  }'
```

## Testing TOTP with Authenticator Apps

### Supported Apps

- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password
- Any TOTP-compatible authenticator app

### How to Test

1. **Setup TOTP** using the `/api/totp/setup` endpoint
2. **Decode the QR code**:
   - The `qrCode` field contains a base64-encoded PNG image
   - You can decode it using online tools or save it as an image
   - Example: Save base64 string (without `data:image/png;base64,` prefix) to a file and decode
3. **Scan with your authenticator app**
4. **Use the 6-digit code** from the app to verify and enable TOTP
5. **Test login flow** with 2FA enabled

### Manual QR Code Decoding

You can decode the base64 QR code using Python:

```python
import base64

# Remove 'data:image/png;base64,' prefix
qr_base64 = "iVBORw0KGgoAAAANSUhEUgAA..."
image_data = base64.b64decode(qr_base64)

with open('qr_code.png', 'wb') as f:
    f.write(image_data)
```

Or use online tools like [base64-image.decoder](https://base64-image.decoder.fr/).

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Unit Tests Only

```bash
npm test -- tests/unit
```

### Run Integration Tests Only

```bash
npm test -- tests/integration
```

## Code Quality

### Linting

```bash
npm run lint
```

### Fix Linting Issues

```bash
npm run lint:fix
```

### Format Code

```bash
npm run format
```

## Project Structure

```
totp-poc/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── app.ts           # Express app setup
├── tests/
│   ├── unit/            # Unit tests
│   └── integration/     # Integration tests
├── api.http             # httpyac API requests file
├── api-examples.http    # httpyac complete example flow
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file
```

## Security Features

1. **Password Hashing**: Bcrypt with configurable salt rounds
2. **Secret Encryption**: AES-256-GCM encryption for TOTP secrets at rest
3. **Backup Code Hashing**: Bcrypt hashing for backup codes
4. **JWT Authentication**: Secure token-based authentication
5. **Rate Limiting**: Protection against brute force attacks on TOTP verification
6. **Input Validation**: Comprehensive validation for all inputs
7. **Error Handling**: Secure error messages that don't leak sensitive information

## Database Schema

### Users Table

- `id`: Primary key
- `username`: Unique username
- `email`: Unique email address
- `password_hash`: Bcrypt hashed password
- `created_at`: Timestamp
- `updated_at`: Timestamp

### TotpSecrets Table

- `id`: Primary key
- `user_id`: Foreign key to users table
- `secret_encrypted`: AES-256-GCM encrypted TOTP secret
- `backup_codes_hashed`: JSON array of bcrypt hashed backup codes
- `enabled`: Boolean flag
- `enabled_at`: Timestamp when enabled
- `created_at`: Timestamp
- `updated_at`: Timestamp

## Error Responses

All error responses follow this format:

```json
{
  "message": "Error message",
  "errors": {
    "field": ["Error message 1", "Error message 2"]
  }
}
```

### Common HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required or failed)
- `404`: Not Found
- `409`: Conflict (duplicate resource)
- `500`: Internal Server Error

## Limitations and Future Improvements

1. **Temporary Secret Storage**: Currently uses in-memory Map. In production, use Redis or similar.
2. **Rate Limiting**: Currently basic. Consider more sophisticated rate limiting strategies.
3. **Session Management**: JWT tokens are stateless. Consider refresh token mechanism.
4. **Email Verification**: Not implemented. Add email verification for registration.
5. **Password Reset**: Not implemented. Add password reset functionality.
6. **Audit Logging**: Add comprehensive audit logging for security events.
7. **Multi-device Support**: Consider allowing multiple TOTP devices per user.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
