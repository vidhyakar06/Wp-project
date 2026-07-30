# Smart Crop Advisory System

An intelligent agricultural platform designed to help small and marginal farmers make data-driven decisions about crop selection, fertilizer usage, pest control, and market timing.

## Features

### Farmer Module
- **Authentication** — Register, Login, Logout, Forgot Password, Change Password (JWT via Supabase Auth, bcrypt-encrypted)
- **Farmer Profile** — Full name, mobile, village, district, state, farm size, soil type, irrigation method, profile photo upload
- **Farm Details** — Soil type, pH, NPK levels, rainfall, temperature, humidity, water availability, current season
- **Crop Recommendation Engine** — Compares farm conditions against 42+ crops in the database, outputs ranked matches with confidence scores
- **Fertilizer Recommendation** — Analyzes soil NPK and pH to recommend the right fertilizers with quantity, application method, and precautions
- **Weather Dashboard** — Current conditions and 7-day forecast
- **Crop Disease Information** — Search by crop or disease name; view symptoms, causes, prevention, treatment, and organic solutions
- **Market Prices** — Live market price dashboard with search, filter, sorting, and pagination
- **AI Farming Assistant** — Chatbot answering questions about crops, fertilizers, pest control, organic farming, irrigation, harvesting, and government schemes
- **Dashboard** — Analytics with charts: crop distribution, weather trends, monthly yield prediction
- **Reports** — Export farm reports as PDF and Excel/CSV
- **Settings** — Dark/light mode, English/Tamil language toggle, notification preferences, password change

### Admin Module
- Secure admin panel (role-based access)
- Manage Crops (Add/Edit/Delete)
- Manage Farmers (View/Delete)
- Manage Diseases (Add/Edit/Delete)
- Manage Fertilizers (Add/Edit/Delete)
- Manage Market Prices (Add/Edit/Delete)
- Download comprehensive admin reports as PDF

### UI/UX
- Green gradient agriculture theme with glassmorphism
- Dark mode and light mode
- Responsive mobile-first design
- Animated cards with Framer Motion
- Toast notifications
- Skeleton loaders
- Sidebar navigation with top navbar

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript |
| Routing | React Router DOM |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Charts | Chart.js + react-chartjs-2 |
| Forms | React Hook Form patterns |
| Icons | Lucide React |
| PDF Export | jsPDF |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Database | PostgreSQL (via Supabase) |

## Database Schema

### Tables
- **profiles** — Extends auth.users with farmer data (name, mobile, village, district, state, farm_size, soil_type, irrigation, photo, role)
- **farm_details** — Soil and environmental data per farmer (soil_type, pH, N, P, K, rainfall, temp, humidity, water, season)
- **crops** — Master crop database (42 crops with scientific name, soil, season, water, temp, rainfall, fertilizer, duration, yield, market value, image)
- **recommendations** — Saved crop recommendations per farmer with confidence scores
- **fertilizers** — Master fertilizer database (15 fertilizers with soil condition, quantity, application method, precautions)
- **diseases** — Master disease database (20 diseases with symptoms, causes, prevention, treatment, organic solution)
- **market_prices** — Market price data (45 entries across multiple mandis with current/previous prices and trends)

### Security
- Row Level Security (RLS) enabled on all tables
- Owner-scoped CRUD for profiles, farm_details, and recommendations
- Public read + authenticated write for crops, fertilizers, diseases, and market_prices

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

The following are pre-configured in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Creating an Admin Account

1. Register a new account through the app
2. In the Supabase dashboard, update the `profiles` table row for that user:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```
3. Log in — the Admin Panel link will appear in the sidebar

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components (Button, Card, Input, Skeleton, Loading)
│   ├── Navbar.tsx
│   └── Sidebar.tsx
├── context/          # React contexts (Auth, Theme, Toast)
├── layouts/          # Dashboard layout wrapper
├── lib/              # Supabase client and types
├── pages/
│   ├── auth/         # Login, Register, ForgotPassword
│   ├── Landing.tsx
│   ├── About.tsx
│   ├── Dashboard.tsx
│   ├── Profile.tsx
│   ├── FarmDetails.tsx
│   ├── CropRecommendation.tsx
│   ├── FertilizerRecommendation.tsx
│   ├── Weather.tsx
│   ├── Diseases.tsx
│   ├── MarketPrices.tsx
│   ├── AIAssistant.tsx
│   ├── AdminDashboard.tsx
│   ├── Reports.tsx
│   ├── Settings.tsx
│   └── Contact.tsx
├── App.tsx           # Main app with routing
├── main.tsx          # Entry point
└── index.css         # Global styles + Tailwind
```

## API Reference

The app uses Supabase's auto-generated REST API:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/v1/signup` | POST | Register new farmer |
| `/auth/v1/token` | POST | Login |
| `/rest/v1/profiles` | GET/PUT | Farmer profile |
| `/rest/v1/farm_details` | GET/POST/PUT | Farm soil data |
| `/rest/v1/crops` | GET | Browse all crops |
| `/rest/v1/recommendations` | GET/POST | Crop recommendations |
| `/rest/v1/fertilizers` | GET | Fertilizer database |
| `/rest/v1/diseases` | GET | Disease database |
| `/rest/v1/market_prices` | GET | Market prices |

## License

This project is for educational purposes.
