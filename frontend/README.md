# TOTP Frontend

React frontend application for the TOTP (Time-based One-Time Password) Proof of Concept.

## Tech Stack

- **React 18.x** with TypeScript
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **React Context API** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Hook Form** - Form handling and validation
- **qrcode.react** - QR code display
- **react-hot-toast** - Toast notifications
- **react-icons** - Icons

## Features

- User registration and authentication
- Two-factor authentication (2FA) with TOTP
- TOTP setup flow with QR code scanning
- TOTP status management
- Backup codes generation and display
- Protected routes
- Responsive design

## Prerequisites

- Node.js 18+ (check `.nvmrc` if using nvm)
- npm or yarn
- Backend API running on `http://localhost:3000`

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file (optional, defaults are set):

```bash
VITE_API_URL=http://localhost:3000/api
```

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build

Build for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Preview Production Build

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/          # Authentication components
│   │   ├── totp/          # TOTP management components
│   │   ├── common/        # Reusable UI components
│   │   └── layout/        # Layout components
│   ├── pages/             # Page components
│   ├── services/          # API service layer
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## User Flow

1. **Registration**: User creates an account with username, email, and password
2. **Login**: User logs in with username and password
   - If TOTP is enabled, user must enter 6-digit TOTP code
   - If TOTP is not enabled, user is logged in directly
3. **TOTP Setup**: User can enable TOTP from the dashboard
   - Scan QR code with authenticator app
   - Verify code
   - Enable TOTP
   - Save backup codes
4. **TOTP Management**: User can view status and disable TOTP

## API Integration

The frontend communicates with the backend API at `http://localhost:3000/api`. All authenticated requests include the JWT token in the Authorization header.

### Endpoints Used

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/login-2fa` - Complete 2FA login
- `POST /api/totp/setup` - Start TOTP setup
- `POST /api/totp/verify` - Verify TOTP code during setup
- `POST /api/totp/enable` - Enable TOTP
- `GET /api/totp/status` - Get TOTP status
- `POST /api/totp/disable` - Disable TOTP
- `POST /api/totp/backup-codes` - Regenerate backup codes

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: `http://localhost:3000/api`)

## Security Notes

- JWT tokens are stored in localStorage (consider httpOnly cookies for production)
- Sensitive data (backup codes, secrets) should be handled carefully
- Use HTTPS in production
- Implement proper CORS policies on the backend

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

