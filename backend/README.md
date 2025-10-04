# FoodCast Backend API

A comprehensive Express.js backend for the FoodCast food surplus redistribution platform, built with TypeScript and Supabase.

## 🚀 Features

- **User Authentication**: Signup and login with Supabase Auth
- **Surplus Management**: Upload and predict food surplus data
- **Smart Allocation**: AI-powered matching of surplus to recipients
- **Analytics**: Impact metrics and environmental data
- **Type Safety**: Full TypeScript integration with Supabase types

## 📋 API Endpoints

### Authentication
- `POST /signup` - Register new users (store, student, shelter)
- `POST /login` - Authenticate users

### Surplus Management
- `POST /upload-surplus` - Upload inventory/surplus data
- `POST /predict-surplus` - Generate AI predictions for surplus

### Allocation & Matching
- `POST /allocate` - Match surplus to recipients with route optimization

### Analytics
- `GET /analytics` - Get impact metrics and environmental data

### Health Check
- `GET /health` - API health status

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account with database

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Build and run**:
   ```bash
   # Development
   npm run dev:server
   
   # Production
   npm run build
   npm start
   ```

## 🔧 Environment Variables

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3001
```

## 📊 Database Schema

The API works with the following Supabase tables:
- `user_profiles` - User account information
- `recipient_community` - Food recipient organizations
- `food_surplus` - Surplus food inventory
- `historical_sales` - Sales data for predictions
- `brain_diet_foundation_foods` - Nutritional food database

## 🔌 API Usage Examples

### User Signup
```javascript
const response = await fetch('/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'store@example.com',
    password: 'securepassword',
    userType: 'store',
    profileData: {
      name: 'Local Grocery Store',
      contact_email: 'store@example.com',
      phone: '555-0123',
      address: '123 Main St'
    }
  })
});
```

### Upload Surplus
```javascript
const response = await fetch('/upload-surplus', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    storeId: 'store_123',
    products: [{
      product_name: 'Fresh Apples',
      category: 'fruits',
      brain_diet_flag: true,
      shelf_life_days: 7,
      wasted_units: 50,
      waste_percentage: 5
    }]
  })
});
```

### Get Analytics
```javascript
const response = await fetch('/analytics?startDate=2024-01-01&endDate=2024-01-31');
const data = await response.json();
console.log('Food rescued:', data.data.foodRescued.totalUnits);
console.log('CO2 saved:', data.data.environmentalImpact.co2SavedKg, 'kg');
```

## 🤖 AI Integration

The API includes placeholder functions for:
- `predictSurplus()` - AI prediction model for surplus forecasting
- `optimizeDeliveryRoutes()` - Google Maps API for route optimization

These can be replaced with actual AI service calls.

## 🧪 Testing

Run the test script to verify API functionality:
```bash
node test-server.js
```

## 📝 Response Format

All API responses follow this format:
```json
{
  "success": true|false,
  "message": "Description of the operation",
  "data": { ... },
  "error": "Error message if success is false"
}
```

## 🔒 Security Features

- Helmet.js for security headers
- CORS enabled for cross-origin requests
- Input validation and sanitization
- Environment variable protection
- Supabase Auth integration

## 🚀 Deployment

The backend is ready for deployment on platforms like:
- Vercel
- Railway
- Heroku
- DigitalOcean App Platform

Make sure to set environment variables in your deployment platform.

## 📈 Monitoring

- Morgan logging for request tracking
- Health check endpoint for uptime monitoring
- Comprehensive error handling and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the FoodCast platform for food waste reduction.
