# Cursor IDE System Prompt: TOTP PoC Project

Create a complete TypeScript Node.js TOTP (Time-based One-Time Password) proof-of-concept project with the following specifications:

## Tech Stack

- **Runtime**: Node.js 20.x
- **Language**: TypeScript (strict mode)
- **Framework**: Express.js
- **Package Manager**: npm
- **Database**: SQLite (using better-sqlite3 for simplicity)
- **Testing**: Jest with TypeScript support
- **TOTP Library**: otplib
- **QR Code**: qrcode
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator or zod
- **Code Quality**: ESLint + Prettier

## Project Structure

```
totp-poc/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── totp.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   └── totp-secret.model.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── totp.routes.ts
│   ├── services/
│   │   ├── totp.service.ts
│   │   ├── auth.service.ts
│   │   └── jwt.service.ts
│   ├── utils/
│   │   ├── encryption.util.ts
│   │   └── validation.util.ts
│   ├── types/
│   │   └── index.ts
│   └── app.ts
├── tests/
│   ├── unit/
│   │   ├── totp.service.test.ts
│   │   └── auth.service.test.ts
│   └── integration/
│       ├── auth.test.ts
│       └── totp.test.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── jest.config.js
├── .eslintrc.json
├── .prettierrc
└── README.md
```

## Core Features

### 1. User Management

- User registration (username, email, password)
- User login (username/password)
- Password hashing with bcrypt
- JWT token generation

### 2. TOTP Setup Flow

- Generate TOTP secret (32-character base32)
- Generate QR code (otpauth:// URL format)
- Generate 10 backup codes (8-character alphanumeric)
- Store encrypted secret and hashed backup codes in database
- Return secret, QR code (base64), and backup codes to user

### 3. TOTP Verification

- Verify TOTP code during setup
- Verify TOTP code during login
- Support ±1 time step window for clock drift
- Rate limiting (max 5 attempts per 15 minutes)

### 4. TOTP Management

- Enable TOTP (after verification)
- Disable TOTP (requires password confirmation)
- Regenerate backup codes (requires password)
- Check TOTP status

### 5. Two-Factor Authentication Flow

- Login with username/password → returns tokenKey if TOTP enabled
- Verify TOTP code → returns JWT token
- Login without TOTP → returns JWT token directly

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
  - Body: `{ username, email, password }`
  - Returns: `{ token, user }`

- `POST /api/auth/login` - Login user
  - Body: `{ username, password }`
  - Returns: `{ token }` or `{ tokenKey, requiresTotp: true }` if TOTP enabled

- `POST /api/auth/login-2fa` - Complete 2FA login
  - Body: `{ tokenKey, totpCode }`
  - Returns: `{ token }`

### TOTP Management

- `POST /api/totp/setup` - Start TOTP setup (requires auth)
  - Returns: `{ secret, qrCode, backupCodes }`

- `POST /api/totp/verify` - Verify TOTP code during setup
  - Body: `{ totpCode }`
  - Returns: `{ success: boolean }`

- `POST /api/totp/enable` - Enable TOTP (requires auth + verified code)
  - Body: `{ totpCode }`
  - Returns: `{ success: boolean }`

- `POST /api/totp/disable` - Disable TOTP (requires auth + password)
  - Body: `{ password }`
  - Returns: `{ success: boolean }`

- `GET /api/totp/status` - Get TOTP status (requires auth)
  - Returns: `{ enabled: boolean, enabledAt: string | null }`

- `POST /api/totp/backup-codes` - Regenerate backup codes (requires auth + password)
  - Body: `{ password }`
  - Returns: `{ backupCodes: string[] }`

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### TotpSecrets Table

```sql
CREATE TABLE totp_secrets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  secret_encrypted TEXT NOT NULL,
  backup_codes_hashed TEXT, -- JSON array of hashed codes
  enabled BOOLEAN DEFAULT 0,
  enabled_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Security Requirements

1. **Secret Encryption**: Use AES-256-GCM for TOTP secrets at rest
2. **Backup Codes**: Hash with bcrypt before storage
3. **Password Hashing**: Use bcrypt (salt rounds: 10)
4. **JWT**: Use RS256 or HS256 with secure secret
5. **Rate Limiting**: Implement on TOTP verification endpoints
6. **Input Validation**: Validate all inputs (email format, password strength, TOTP code format)
7. **Error Messages**: Don't leak sensitive information in error responses

## Implementation Details

### TOTP Service

- Use `otplib` for secret generation and verification
- Generate secrets with `authenticator.generateSecret()`
- Verify with `authenticator.verify({ token, secret, window: 1 })`
- Generate QR code with `otpauth://totp/Issuer:user@example.com?secret=SECRET&issuer=Issuer`

### Encryption Utility

- Use Node.js `crypto` module
- AES-256-GCM encryption for secrets
- Store IV with encrypted data
- Use environment variable for encryption key

### Backup Codes

- Generate 10 codes, 8 characters each (alphanumeric uppercase)
- Hash each code with bcrypt before storage
- Mark codes as used when verified
- One-time use only

## Testing Requirements

### Unit Tests

- TOTP service: secret generation, verification, QR code generation
- Encryption utility: encrypt/decrypt secrets
- Backup code generation and verification

### Integration Tests

- Complete registration flow
- Complete TOTP setup flow
- Complete 2FA login flow
- TOTP disable flow
- Backup code usage

## Configuration

### Environment Variables (.env.example)

```
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
ENCRYPTION_KEY=32-character-key-for-aes-256
DB_PATH=./totp-poc.db
BCRYPT_ROUNDS=10
TOTP_ISSUER=OpenHome
```

## Code Quality

- TypeScript strict mode enabled
- ESLint with TypeScript rules
- Prettier for code formatting
- All functions should have JSDoc comments
- Error handling with try-catch blocks
- Proper HTTP status codes
- Consistent error response format

## README.md Should Include

1. Project description
2. Prerequisites (Node.js version)
3. Installation steps
4. Environment setup
5. Running the server
6. Running tests
7. API documentation with examples
8. Example curl commands for all endpoints
9. Testing TOTP with authenticator apps

## Example Usage Flow

1. Register user: `POST /api/auth/register`
2. Login: `POST /api/auth/login` → get JWT
3. Setup TOTP: `POST /api/totp/setup` → get QR code
4. Scan QR code with Google Authenticator
5. Verify: `POST /api/totp/verify` with code from app
6. Enable: `POST /api/totp/enable`
7. Login with 2FA: `POST /api/auth/login` → get tokenKey
8. Complete login: `POST /api/auth/login-2fa` with TOTP code

## Additional Notes

- Use async/await throughout
- Implement proper error handling
- Add request logging (optional)
- Keep code clean and well-organized
- Add comments for complex logic
- Follow RESTful API conventions
- Use appropriate HTTP methods and status codes

Create a complete, runnable project that demonstrates TOTP authentication from setup to login.
