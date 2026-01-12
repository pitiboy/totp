# TOTP (Time-based One-Time Password) Process

## Introduction

TOTP (Time-based One-Time Password) is a two-factor authentication (2FA) mechanism that adds an extra layer of security to user accounts. This implementation uses the **RFC 6238** standard, which generates time-based one-time passwords that change every 30 seconds.

### How TOTP Works

1. **Secret Generation**: A shared secret is generated and stored securely (encrypted) on the server
2. **QR Code**: The secret is encoded in a QR code using the `otpauth://` URI scheme
3. **Authenticator App**: Users scan the QR code with an authenticator app (Google Authenticator, Authy, etc.)
4. **Code Generation**: The app generates 6-digit codes every 30 seconds based on the current time and secret
5. **Verification**: During login, users enter the current code, which is verified against the server's calculation

```mermaid
flowchart LR
    UnixTime[Unix time] --> Divide["floor(time / 30)"]
    Divide --> SequenceValue[Sequence value]
    Secret[Secret] --> HMAC[HMAC-SHA-1]
    SequenceValue --> HMAC
    HMAC --> Truncate[Dynamic truncation]
    Truncate --> FinalCode[Final code]

    style UnixTime fill:#ffeb3b
    style Secret fill:#ffeb3b
    style SequenceValue fill:#ffffff
    style HMAC fill:#ff00ff
    style Truncate fill:#eeeeee
    style FinalCode fill:#ffffff
```

### Key Components

- **Secret**: A base32-encoded string shared between server and authenticator app
- **Time Window**: Codes are valid for ±1 time step (30 seconds) to account for clock drift
- **Backup Codes**: One-time use codes generated during setup for account recovery
- **Encryption**: Secrets are encrypted at rest using AES-256

## Implementation Flow

### Security Features

- **Encrypted Storage**: Secrets are encrypted using AES-256 before storing in database
- **Hashed Backup Codes**: Backup codes are hashed with bcrypt (10 rounds)
- **Time-based Validation**: Codes expire after 30 seconds
- **Clock Drift Tolerance**: Accepts codes from ±1 time window
- **One-time Backup Codes**: Used backup codes are removed from database

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    participant AuthApp as Authenticator App

    Note over User,AuthApp: TOTP Setup Flow
    User->>Frontend: Click "Setup TOTP"
    Frontend->>Backend: POST /api/totp/setup
    Backend->>Backend: Generate secret & backup codes
    Backend->>Backend: Generate QR code (otpauth://)
    Backend->>Backend: Store temp secret in memory
    Backend-->>Frontend: Return {secret, qrCode, backupCodes}
    Frontend->>User: Display QR code
    User->>AuthApp: Scan QR code
    AuthApp->>AuthApp: Store secret

    User->>Frontend: Enter TOTP code
    Frontend->>Backend: POST /api/totp/verify
    Backend->>Backend: Verify code with temp secret
    Backend-->>Frontend: {success: true}

    User->>Frontend: Confirm & enable TOTP
    Frontend->>Backend: POST /api/totp/enable
    Backend->>Backend: Encrypt secret
    Backend->>Backend: Hash backup codes
    Backend->>Database: Store encrypted secret & hashed codes
    Backend->>Database: Set enabled = 1
    Backend-->>Frontend: {success: true}

    Note over User,AuthApp: Login with TOTP Flow
    User->>Frontend: Enter username & password
    Frontend->>Backend: POST /api/auth/login
    Backend->>Database: Verify credentials
    Backend->>Database: Check if TOTP enabled
    Backend-->>Frontend: {tokenKey, requiresTotp: true}

    User->>AuthApp: Get current TOTP code
    AuthApp-->>User: 6-digit code
    User->>Frontend: Enter TOTP code
    Frontend->>Backend: POST /api/auth/login-2fa
    Backend->>Database: Decrypt secret
    Backend->>Backend: Verify TOTP code
    alt Code Valid
        Backend->>Backend: Generate JWT token
        Backend-->>Frontend: {token}
        Frontend->>User: Redirect to dashboard
    else Code Invalid
        Backend->>Database: Check backup codes
        alt Backup Code Valid
            Backend->>Database: Remove used backup code
            Backend->>Backend: Generate JWT token
            Backend-->>Frontend: {token}
            Frontend->>User: Redirect to dashboard
        else Invalid
            Backend-->>Frontend: 401 Unauthorized
        end
    end
```
