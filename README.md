# 💊 Life-Meds - Medication Reminder & Health Tracker

A comprehensive medication management platform designed to help individuals and families stay on top of their health routines. Built with offline-first architecture for reliable access anywhere, anytime.

## ✨ Features

### 📱 Core Functionality
- **Smart Medication Reminders** - Never miss a dose with multi-channel notifications (email, push, in-app)
- **Offline-First Architecture** - Track medications even without internet connection, syncs automatically when online
- **Family Care Management** - Monitor multiple family members' medications and health metrics
- **Caregiver Monitoring** - Real-time updates and alerts for caregivers managing patient medications
- **Refill Alerts** - Automatic notifications when medication supplies are running low

### 🏥 Health Tracking
- **Comprehensive Health Metrics** - Track weight, blood pressure, heart rate, glucose, and more
- **Visual Analytics** - Beautiful charts and insights to monitor health trends
- **Medical Appointments** - Schedule and manage doctor appointments
- **Health Observations** - Log symptoms, side effects, and improvements

### 🔒 Security & Privacy
- **Two-Factor Authentication** - Enhanced account security with TOTP-based 2FA
- **Secure Data Storage** - End-to-end encryption for sensitive health information
- **HIPAA-Compliant Architecture** - Built with healthcare privacy standards in mind
- **Role-Based Access Control** - Manage permissions for family members and caregivers

### 📲 Platform Support
- **Progressive Web App** - Works on any modern browser
- **Native Mobile Apps** - iOS and Android with Capacitor
- **Cross-Device Sync** - Seamless experience across all your devices

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Shadcn/ui** - Accessible component library
- **React Query** - Powerful data synchronization
- **Capacitor** - Native mobile capabilities

### Backend
- **Base44** - Backend-as-a-Service platform
- **Deno Deploy** - Serverless functions
- **IndexedDB** - Offline-first local storage
- **Stripe** - Secure payment processing

### Key Libraries
- `date-fns` - Date manipulation
- `recharts` - Data visualization
- `react-hook-form` - Form management
- `sonner` - Toast notifications
- `lucide-react` - Beautiful icons

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Stripe account (for subscription features)
- Base44 account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/life-meds.git
cd life-meds
Install dependencies
npm install
Configure environment variables Create a .env file with the following:
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_MONTHLY_PRICE_ID=your_monthly_price_id
STRIPE_YEARLY_PRICE_ID=your_yearly_price_id
STRIPE_WEBHOOK_SECRET=your_webhook_secret
Run development server
npm run dev
Build for production
npm run build
Mobile App Setup (Optional)
To build native iOS/Android apps:

# Add iOS platform
npx cap add ios

# Add Android platform
npx cap add android

# Sync web app with native projects
npx cap sync

# Open in Xcode (iOS)
npx cap open ios

# Open in Android Studio (Android)
npx cap open android
📖 Usage
For Patients
Sign up and complete the onboarding process
Add medications with dosage, frequency, and reminder times
Track daily doses by marking medications as taken or skipped
Monitor health metrics like blood pressure, weight, and glucose
Schedule appointments with healthcare providers
Review progress with visual charts and adherence reports
For Caregivers
Link to patient accounts via family member management
Monitor medication adherence in real-time
Receive alerts when doses are missed or taken
Add observations about patient health and symptoms
Coordinate care across multiple family members
For Administrators
Manage user subscriptions and billing
Configure approved medications master list
Monitor system logs and user activity
Handle support requests and user management
🔐 Security Features
Two-Factor Authentication (2FA) - TOTP-based authentication for enhanced security
Email Verification - Verify user email addresses during signup
Secure Sessions - Token-based authentication with automatic expiration
Data Encryption - All sensitive data encrypted at rest and in transit
Audit Logging - Complete activity logs for compliance
📱 Offline Capabilities
The app uses a sophisticated offline-first architecture:

Local Data Storage - IndexedDB stores medications and health data locally
Sync Queue - Offline changes are queued and synced when online
Conflict Resolution - Automatic merging of local and remote data
Network Detection - Visual indicators for offline/online status
Background Sync - Automatic synchronization when connection is restored
💳 Subscription Plans
Free Trial - 14-day full access trial for new users
Monthly Plan - $4.99/month with full feature access
Yearly Plan - $49.99/year (save 17%)
All plans include:

Unlimited medications
Unlimited family members
Health tracking
Appointment management
Caregiver monitoring
Priority support
🤝 Contributing
We welcome contributions! Please follow these steps:

Fork the repository
Create a feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

⚠️ Medical Disclaimer
IMPORTANT: This app is designed as a medication tracking and reminder tool. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or medication regimen.

🆘 Support
Email: support@life-meds.com
Documentation: docs.life-meds.com
Issues: GitHub Issues
🙏 Acknowledgments
Built on Base44 platform
UI components from Shadcn/ui
Icons by Lucide
Inspired by the need for better medication adherence tools

---

## 🔐 Google OAuth (Frontend) ✅
To enable Sign in with Google on the frontend:

1. Add your Google client ID to a `.env` file at the project root:

```
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

2. The app now wraps `<App />` with `GoogleOAuthProvider` and includes a `GoogleLogin` button component at `src/components/Auth/GoogleLoginButton.jsx`.

3. Implement a server endpoint (for example `/api/google-login`) that verifies the Google ID token (verify with Google's tokeninfo or the Google API), creates or looks up the user, and returns a session (or sets a cookie). The frontend `GoogleLoginButton` posts the token to this endpoint and redirects to `/dashboard` on success.

If you want, I can also add an example server-side verification endpoint (Node/Express or a Deno function) to this repo. 

---

## 🔐 Backend helpers added
I've added example Deno functions in the `functions/` folder:

- `googleLogin.ts` — Verifies Google ID tokens (`/api/googleLogin`), finds or creates a user, creates a DB-backed session record (if `Session` entity exists), issues a signed JWT in a secure HTTP-only cookie (`base44_access_token`) and also sets a non-HttpOnly `XSRF-TOKEN` cookie for CSRF protection. Configure `SESSION_SECRET` (or `SESSION_SECRETS` for rotation) and `SESSION_MAX_AGE_SECONDS` in your environment.
- `sendPasswordReset.ts` — Generates a one-time token and sends a reset link to the user's email (`/api/sendPasswordReset`).
- `resetPassword.ts` — Validates the token and updates the user's password (`/api/resetPassword`) and revokes DB sessions for that user (forces re-login).

### 🔐 Session & Security Notes
- Endpoints added:
  - `GET /api/session` — Returns `{ authenticated: true, user }` if a valid session cookie is present.
  - `POST /api/logout` — Clears the cookie and revokes the session record.
  - `POST /api/revokeSession` — Revoke a session by `jti` (requires valid cookie + XSRF header).
- CSRF protection: On login the server sets an `XSRF-TOKEN` cookie (readable by JS). For protected POST endpoints (e.g., `revokeSession`, `logout`), the client must send the `X-XSRF-TOKEN` header matching the cookie. Use `src/lib/xsrf.js` helper (`xsrfHeader()`) to add this header to your requests.
- Session rotation: Set `SESSION_SECRETS` to a comma-separated list with the current secret first and previous secrets following (e.g., `new-secret,old-secret`) to allow key rotation without invalidating existing sessions immediately.
- Revocable sessions: Sessions are stored in your **MySQL/MariaDB** `sessions` table (see `sql/create_sessions_table.sql`). Functions will mark sessions as `revoked` when appropriate.

### SQL Migration & Using your own MySQL/MariaDB
Run the included migration to create the `sessions` table in your DB:

```bash
mysql -u <user> -p <dbname> < sql/create_sessions_table.sql
```

Notes for using your own DB instead of Base44 for session storage:
- Set DB env vars (see `.env.example`): `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
- The Deno functions now use `functions/db.ts` to store session records in the `sessions` table. If DB is not configured, functions fall back to Base44 entity-based session handling.
- A Node/Express example that writes sessions to MySQL is available at `examples/googleLoginExpressWithDb.js`.

If you use a migration tool (Flyway/Knex/Sequelize/etc.), apply the `create_sessions_table.sql` via your usual workflow.

If you want, I can now:
- Add a small admin UI to view and revoke active sessions,
- Add automatic session invalidation on password reset (already done),
- Implement server-side session rotation tooling (e.g., revoke sessions created before a cutoff).


Notes:
- The `googleLogin` example verifies the token using Google's `tokeninfo` endpoint and checks `aud` against `GOOGLE_CLIENT_ID` (available as `Deno.env`).
- The reset functions reuse the existing `VerificationCode` entity to store tokens. Adjust token expiry, email content, and password update logic to match your auth provider and security requirements.
- Most importantly: the `googleLogin` function in this example does not create a session cookie for the user. Add session creation (HTTP-only cookie or other) after verification so the frontend is authenticated.

If you'd like, I can add a ready-to-deploy Node/Express or Deno route that also sets an HTTP-only cookie for sessions. Let me know which stack you prefer.


