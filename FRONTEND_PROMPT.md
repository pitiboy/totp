# Frontend Development Prompt for TOTP PoC

Create a complete React frontend application for the TOTP (Time-based One-Time Password) Proof of Concept backend. The backend API is already implemented and running on `http://localhost:3000/api`.
Handle it like a monorepo based on the best possible monorepo management tool of you preference.

## Tech Stack Requirements

- **Framework**: React 18.x with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Jotai
- **HTTP Client**: Axios or fetch API
- **UI Library**: Tailwind CSS
- **Form Handling**: React Hook Form with validation
- **QR Code Display**: qrcode.react or similar library
- **Notifications**: react-hot-toast or react-toastify
- **Icons**: react-icons

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── Login2FAForm.tsx
│   │   ├── totp/
│   │   │   ├── TotpSetup.tsx
│   │   │   ├── TotpVerify.tsx
│   │   │   ├── TotpStatus.tsx
│   │   │   ├── TotpDisable.tsx
│   │   │   └── QRCodeDisplay.tsx
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Navigation.tsx
│   │       └── Layout.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── TotpSetupPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── services/
│   │   ├── api.ts (axios instance)
│   │   ├── auth.service.ts
│   │   └── totp.service.ts
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── AuthProvider.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useApi.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── storage.ts (localStorage helpers)
│   │   └── validation.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js (if using Tailwind)
└── README.md
```

## Core Features Required

### 1. Authentication Flow

#### Registration Page

- Form fields: username, email, password, confirm password
- Client-side validation:
  - Username: 3-20 characters, alphanumeric, underscores, hyphens
  - Email: Valid email format
  - Password: Minimum 8 characters, at least one uppercase, one lowercase, one number
  - Confirm password: Must match password
- On success: Auto-login and redirect to dashboard
- Display validation errors inline
- Show loading state during submission

#### Login Page

- Form fields: username, password
- Handle two response types:
  - If TOTP not enabled: Redirect to dashboard with JWT token
  - If TOTP enabled: Show 2FA form with tokenKey
- Display error messages for invalid credentials
- "Remember me" checkbox (optional)
- Link to registration page

#### 2FA Login Page/Component

- Form field: 6-digit TOTP code input
- Auto-focus and format input (6 digits only)
- Display countdown timer for code expiration (5 minutes)
- Show error if code is invalid or expired
- Allow using backup codes (toggle or separate input)
- On success: Redirect to dashboard

### 2. TOTP Management

#### TOTP Setup Flow

- **Step 1: Generate Setup**
  - Button to start TOTP setup
  - Display QR code image (from base64 response)
  - Show secret as text (with copy button)
  - Display backup codes in a secure, copyable format
  - Instructions: "Scan QR code with your authenticator app"
- **Step 2: Verify Code**
  - Input field for 6-digit TOTP code
  - Verify button
  - Show success/error feedback
- **Step 3: Enable TOTP**
  - Confirm button to enable TOTP
  - Final verification with TOTP code
  - Success message and redirect

#### TOTP Status Display

- Show current TOTP status (enabled/disabled)
- If enabled: Show enabled date
- Button to disable TOTP (with password confirmation)
- Button to regenerate backup codes (with password confirmation)

#### TOTP Disable Flow

- Password confirmation modal/form
- Confirm disable action
- Show success message

#### Backup Codes Management

- Display current backup codes (if available)
- "Regenerate" button (requires password)
- Warning: "Old codes will be invalidated"
- Show new codes in a secure, copyable format

### 3. Dashboard/Home Page

- Welcome message with username
- TOTP status card:
  - Current status (enabled/disabled)
  - Quick action buttons (Setup/Disable)
  - Link to TOTP management
- Recent activity (optional)
- Logout button

### 4. Protected Routes

- Implement route protection
- Redirect to login if not authenticated
- Store JWT token in localStorage or httpOnly cookie
- Auto-refresh token if needed
- Handle token expiration gracefully

## API Integration

### Base Configuration

- Base URL: `http://localhost:3000/api`
- All requests include proper headers
- Handle CORS if needed
- Intercept requests to add Authorization header
- Handle 401 responses (auto-logout)

### API Endpoints to Integrate

1. **POST /api/auth/register**
   - Body: `{ username, email, password }`
   - Response: `{ token, user }`
   - Store token and user info

2. **POST /api/auth/login**
   - Body: `{ username, password }`
   - Response: `{ token }` OR `{ tokenKey, requiresTotp: true }`
   - Handle both cases

3. **POST /api/auth/login-2fa**
   - Body: `{ tokenKey, totpCode }`
   - Response: `{ token }`
   - Store token

4. **POST /api/totp/setup**
   - Headers: `Authorization: Bearer <token>`
   - Response: `{ secret, qrCode, backupCodes }`
   - Display QR code and backup codes

5. **POST /api/totp/verify**
   - Headers: `Authorization: Bearer <token>`
   - Body: `{ totpCode }`
   - Response: `{ success: boolean }`

6. **POST /api/totp/enable**
   - Headers: `Authorization: Bearer <token>`
   - Body: `{ totpCode }`
   - Response: `{ success: boolean }`

7. **GET /api/totp/status**
   - Headers: `Authorization: Bearer <token>`
   - Response: `{ enabled: boolean, enabledAt: string | null }`

8. **POST /api/totp/disable**
   - Headers: `Authorization: Bearer <token>`
   - Body: `{ password }`
   - Response: `{ success: boolean }`

9. **POST /api/totp/backup-codes**
   - Headers: `Authorization: Bearer <token>`
   - Body: `{ password }`
   - Response: `{ backupCodes: string[] }`

## UI/UX Requirements

### Design Principles

- Clean, modern interface
- Mobile-responsive design
- Accessible (WCAG 2.1 AA compliance)
- Clear error messages
- Loading states for all async operations
- Success/error notifications (toast messages)

### Color Scheme

- Primary: Blue or Green (for actions)
- Success: Green
- Error: Red
- Warning: Orange/Yellow
- Neutral: Gray scale

### Components Styling

- Consistent button styles (primary, secondary, danger)
- Form inputs with labels and error states
- Cards for grouping content
- Modal/dialog for confirmations
- Loading spinners
- Toast notifications

### User Experience

- Clear navigation between pages
- Breadcrumbs or back buttons where appropriate
- Confirmation dialogs for destructive actions
- Copy-to-clipboard functionality for secrets and backup codes
- QR code should be clearly visible and scannable
- Instructions should be clear and helpful

## State Management

### Auth Context

- User information
- Authentication status
- Token management
- Login/logout functions
- Auto-logout on token expiration

### TOTP State

- Current TOTP status
- Setup flow state (step tracking)
- Temporary secret storage (during setup)

## Error Handling

- Display user-friendly error messages
- Handle network errors
- Handle validation errors (display field-specific errors)
- Handle 401/403/404/500 errors appropriately
- Show retry options where applicable

## Security Considerations

- Don't store sensitive data in localStorage (except token)
- Clear sensitive data on logout
- Mask passwords in forms
- Secure display of backup codes (consider masking with reveal button)
- HTTPS in production (noted in comments)

## Additional Features (Nice to Have)

1. **Password Strength Indicator**
   - Visual indicator during registration
   - Show requirements checklist

2. **TOTP Code Input Enhancement**
   - Auto-advance between digit inputs
   - Paste support for 6-digit codes
   - Visual feedback for valid/invalid codes

3. **Backup Codes Display**
   - Download as text file
   - Print-friendly view
   - Warning about keeping them safe

4. **Activity Log** (if backend supports)
   - Show recent login attempts
   - TOTP setup/disable history

5. **Settings Page**
   - Change password (if backend supports)
   - Update email (if backend supports)
   - Account preferences

## Testing Requirements

- Create test user flow documentation
- Ensure all API endpoints are testable
- Test error scenarios
- Test responsive design
- Test accessibility

## Development Setup

- Use Vite for fast development
- Hot module replacement
- ESLint + Prettier configuration
- TypeScript strict mode
- Environment variables for API URL

## Example User Flow

1. User visits app → Redirected to login (if not authenticated)
2. User clicks "Register" → Registration form
3. User registers → Auto-logged in → Dashboard
4. User clicks "Setup TOTP" → Setup flow
5. User scans QR code → Enters TOTP code → TOTP enabled
6. User logs out → Login page
7. User logs in → 2FA form appears (TOTP enabled)
8. User enters TOTP code → Dashboard
9. User can view/disable TOTP from dashboard

## Deliverables

1. Complete React application with all features
2. TypeScript types matching backend API
3. Responsive design (mobile + desktop)
4. Error handling and validation
5. README with setup instructions
6. Package.json with all dependencies
7. Environment configuration
8. Clean, commented code

## Notes

- Backend is already running on `http://localhost:3000`
- All API endpoints are documented in the backend README
- Use the existing `api.http` file as reference for API structure
- Focus on functionality over advanced animations
- Keep code simple and maintainable
- Follow React best practices and hooks patterns

Create a production-ready frontend that allows complete testing of all TOTP functionality from user registration through 2FA login and TOTP management.
