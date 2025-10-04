# FoodCast Backend API

A comprehensive Express.js backend for the FoodCast food surplus redistribution platform, built with Supabase integration.

## Features

- **User Authentication**: Signup and login with Supabase Auth
- **Surplus Management**: Upload and manage food surplus inventory
- **AI Predictions**: Integration with ML models for surplus prediction
- **Smart Allocation**: Match surplus to recipients based on proximity and preferences
- **Analytics**: Track impact metrics and platform performance
- **Type Safety**: Full TypeScript support with Supabase-generated types

## API Endpoints

### Authentication
- `POST /signup` - Register a new user (store, student, or shelter)
- `POST /login` - Authenticate user via Supabase Auth

### Surplus Management
- `POST /upload-surplus` - Upload inventory/surplus (links to products table)
- `POST /predict-surplus` - Run AI prediction and store results

### Allocation & Matching
- `POST /allocate` - Match surplus to recipients based on proximity and preferences

### Analytics
- `GET /analytics` - Returns impact metrics (food rescued, CO₂ saved, etc.)

### Health Check
- `GET /health` - API health status

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the backend directory:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3001
NODE_ENV=development
```

### 3. Database Schema
The API expects the following Supabase tables:

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('store', 'student', 'shelter')) NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES users(id) NOT NULL,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('produce', 'dairy', 'bakery', 'prepared', 'canned', 'frozen', 'other')) NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT CHECK (status IN ('available', 'claimed', 'delivered', 'expired')) DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Surplus Predictions Table
```sql
CREATE TABLE surplus_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES users(id) NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  predicted_quantity INTEGER NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL,
  prediction_date DATE NOT NULL,
  actual_quantity INTEGER,
  accuracy DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Allocations Table
```sql
CREATE TABLE allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) NOT NULL,
  recipient_id UUID REFERENCES users(id) NOT NULL,
  quantity INTEGER NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')) DEFAULT 'pending',
  delivery_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Analytics Table
```sql
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_food_rescued INTEGER NOT NULL,
  total_co2_saved DECIMAL(10,2) NOT NULL,
  total_meals_provided INTEGER NOT NULL,
  prediction_accuracy DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Run the Server

#### Development Mode
```bash
npm run dev:server
```

#### Production Mode
```bash
npm run build
npm start
```

## API Usage Examples

### Signup
```javascript
const response = await fetch('/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'store@example.com',
    password: 'securepassword',
    role: 'store',
    name: 'Whole Foods Market',
    address: '123 Main St, San Francisco, CA',
    phone: '+1-555-0123'
  })
});
```

### Upload Surplus
```javascript
const response = await fetch('/upload-surplus', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    store_id: 'store-uuid',
    name: 'Fresh Vegetables',
    category: 'produce',
    quantity: 50,
    unit: 'lbs',
    expiry_date: '2025-01-15'
  })
});
```

### Get Analytics
```javascript
const response = await fetch('/analytics?period=30');
const data = await response.json();
```

## Integration Points

### AI Prediction Model
The `predictSurplus()` function is a placeholder for your Python ML model integration. Replace it with actual API calls to your prediction service.

### Google Maps Optimization
The `optimizeDeliveryRoutes()` function is a placeholder for Google Maps API integration for route optimization.

## Error Handling

All endpoints return consistent JSON responses:
```json
{
  "success": boolean,
  "data": any,
  "error": string,
  "message": string
}
```

## Type Safety

The API uses TypeScript with Supabase-generated types for full type safety. Import types from `./types.ts` for frontend integration.

## Security

- Helmet.js for security headers
- CORS enabled for cross-origin requests
- Input validation on all endpoints
- Supabase RLS (Row Level Security) recommended for database security
