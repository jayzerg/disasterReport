# Disaster Response App

A crowdsourced disaster reporting platform built with the MENN stack (MongoDB, Express, Next.js, Node.js).

## Features

- Submit disaster impact reports with location, type, severity, and optional images
- View reports on an interactive map
- Rate limiting for report submissions
- Image upload to Cloudinary
- Location detection via browser geolocation
- Report verification system

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Mapbox GL JS
- **Backend**: Express.js, TypeScript
- **Database**: MongoDB with Mongoose
- **Image Storage**: Cloudinary
- **Validation**: Zod
- **Security**: express-rate-limit, sanitize-html

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Cloudinary account
- Mapbox account

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and fill in your credentials
4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
.
├── backend/
│   ├── middleware/
│   │   └── upload.ts        # Multer + Cloudinary middleware
│   ├── models/
│   │   └── Report.ts        # Mongoose model
│   ├── routes/
│   │   └── reportRoutes.ts  # Express routes
│   ├── utils/
│   │   └── zodSchemas.ts    # Validation schemas
│   └── server.ts            # Express server
├── frontend/
│   ├── app/
│   │   ├── report/
│   │   │   └── page.tsx     # Report submission form
│   │   ├── map/
│   │   │   └── page.tsx     # Interactive map
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   └── lib/
│       └── api.ts           # API client
├── package.json
└── tsconfig.json
```

## API Endpoints

### POST /api/reports
Create a new disaster report.

**Request Body:**
- `type`: enum ["earthquake", "storm", "flood", "landslide"]
- `severity`: enum ["low", "medium", "high", "critical"]
- `description`: string (min 10 chars)
- `latitude`: number
- `longitude`: number
- `image`: file (optional, jpg/png, max 5MB)

**Response:**
```json
{
  "success": true,
  "message": "Report created successfully",
  "reportId": "..."
}
```

### GET /api/reports/near?lat=...&lng=...&radius=...
Get reports near a specific location.

**Query Parameters:**
- `lat`: latitude (required)
- `lng`: longitude (required)
- `radius`: radius in meters (optional, default 5000)

**Response:**
```json
{
  "success": true,
  "reports": [...]
}
```

## Security Features

- Rate limiting (3 requests per IP per hour for report creation)
- Input sanitization for descriptions
- File type and size validation for images
- HTTPS-ready (requires SSL certificate in production)

## License

MIT