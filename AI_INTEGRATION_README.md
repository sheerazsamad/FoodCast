# 🤖 FoodCast AI Model Integration

This document provides complete instructions for integrating the trained AI model into your FoodCast web application.

## 🏗️ Architecture Overview

```
Frontend (Next.js) → Backend API (/api/predict) → Python Model Server → AI Model
```

- **Frontend**: Next.js React application with prediction forms and dashboards
- **Backend API**: Next.js API routes that handle prediction requests
- **Python Model Server**: Flask server that loads and serves the trained model
- **AI Model**: GradientBoostingRegressor trained on food surplus data

## 🚀 Quick Start

### 1. Start the Python Model Server

```bash
# Navigate to the backend directory
cd backend

# Make the startup script executable (if not already done)
chmod +x start-model-server.sh

# Start the model server
./start-model-server.sh
```

The model server will:
- Load the trained model (or train a new one if none exists)
- Start a Flask server on port 5001
- Provide prediction endpoints

### 2. Start the Next.js Frontend

```bash
# Navigate to the frontend directory
cd frontend-mvp

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 3. Test the Integration

1. Go to `http://localhost:3000/donor`
2. Click "New Prediction"
3. Fill in the prediction form
4. Click "Predict Surplus"
5. View the AI prediction result

## 📁 File Structure

```
FoodCast/
├── backend/
│   ├── surplus_model.py          # Main AI model training script
│   ├── model_server.py           # Flask server for serving predictions
│   ├── start-model-server.sh     # Startup script
│   ├── requirements.txt          # Python dependencies
│   └── data/                     # Training data (CSV files)
├── frontend-mvp/
│   ├── app/
│   │   ├── api/
│   │   │   ├── predict/route.ts  # Next.js prediction API
│   │   │   └── health/route.ts   # Health check API
│   │   └── donor/page.tsx        # Donor dashboard with AI integration
│   ├── components/
│   │   └── prediction/
│   │       ├── prediction-form.tsx      # Prediction input form
│   │       └── prediction-dashboard.tsx # Full prediction dashboard
│   └── lib/
│       └── prediction-api.ts     # Frontend API client
└── AI_INTEGRATION_README.md      # This file
```

## 🔧 Configuration

### Environment Variables

Add these to your `.env.local` file:

```env
# AI Model Server Configuration
MODEL_SERVER_URL=http://localhost:5001

# NextAuth Configuration (existing)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth (existing)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Model Features

The AI model uses these input features:

**Required Fields:**
- `store_id`: Store identifier (string)
- `product_id`: Product identifier (string)
- `daily_sales`: Daily sales in units (number)
- `stock_level`: Current stock level in units (number)

**Optional Fields:**
- `product_name`: Product name (string)
- `price`: Product price in dollars (number)
- `promotion_flag`: Whether product is on promotion (boolean)
- `brain_diet_flag`: Whether product is brain diet item (boolean)
- `shelf_life_days`: Product shelf life in days (number)
- `date`: Prediction date (string, YYYY-MM-DD format)

## 🎯 API Endpoints

### Python Model Server (Port 5001)

- `POST /predict` - Make a prediction
- `GET /health` - Health check
- `GET /features` - Get model features

### Next.js Backend (Port 3000)

- `POST /api/predict` - Make a prediction (proxies to Python server)
- `GET /api/predict` - Health check
- `GET /api/health` - Application health check

## 📊 Model Performance

- **Accuracy**: 59.4% (R² = 0.5937)
- **Mean Absolute Error**: 33.78 units
- **Model Type**: GradientBoostingRegressor
- **Features**: 12 selected features
- **Training Data**: 89,900 samples

## 🧪 Testing the Integration

### 1. Health Check

```bash
# Check if the model server is running
curl http://localhost:5001/health

# Check if the Next.js API is working
curl http://localhost:3000/api/health
```

### 2. Make a Prediction

```bash
curl -X POST http://localhost:3000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "store_id": "1",
    "product_id": "1",
    "product_name": "Fresh Apples",
    "daily_sales": 45,
    "stock_level": 120,
    "price": 3.99,
    "promotion_flag": false,
    "brain_diet_flag": true,
    "shelf_life_days": 7,
    "date": "2024-10-04"
  }'
```

### 3. Frontend Testing

1. Navigate to the donor dashboard
2. Click "New Prediction"
3. Fill in the form with test data
4. Verify the prediction appears correctly

## 🐛 Troubleshooting

### Model Server Won't Start

1. **Check Python version**: Ensure Python 3.9+ is installed
2. **Install dependencies**: Run `pip3 install -r requirements.txt`
3. **Check data files**: Ensure CSV files exist in `../data/` directory
4. **Check port**: Ensure port 5001 is not in use

### Frontend Can't Connect to Model Server

1. **Check model server**: Ensure it's running on port 5001
2. **Check environment variables**: Verify `MODEL_SERVER_URL` is set correctly
3. **Check CORS**: The model server has CORS enabled
4. **Check network**: Ensure no firewall blocking port 5001

### Predictions Fail

1. **Check input validation**: Ensure all required fields are provided
2. **Check data types**: Ensure numbers are numeric, not strings
3. **Check model loading**: Verify model is loaded in health check
4. **Check logs**: Look at browser console and server logs

## 🚀 Deployment

### Local Development

Both servers should run simultaneously:
- Python model server: `http://localhost:5001`
- Next.js frontend: `http://localhost:3000`

### Production Deployment

1. **Deploy Python model server** to a cloud service (AWS, GCP, Azure)
2. **Update MODEL_SERVER_URL** in production environment
3. **Deploy Next.js application** to Vercel, Netlify, or similar
4. **Configure CORS** for production domains

### Docker Deployment (Optional)

Create a `Dockerfile` for the Python model server:

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5001

CMD ["python", "model_server.py"]
```

## 📈 Performance Optimization

### Model Optimization

1. **Feature Engineering**: Add more relevant features
2. **Model Selection**: Try XGBoost or other algorithms
3. **Hyperparameter Tuning**: Optimize model parameters
4. **Data Quality**: Improve training data quality

### API Optimization

1. **Caching**: Cache predictions for repeated requests
2. **Batch Processing**: Handle multiple predictions at once
3. **Async Processing**: Use background jobs for heavy predictions
4. **Load Balancing**: Scale model server horizontally

## 🔒 Security Considerations

1. **Input Validation**: Validate all input data
2. **Rate Limiting**: Prevent abuse of prediction API
3. **Authentication**: Add API authentication if needed
4. **Data Privacy**: Ensure sensitive data is handled securely

## 📝 Development Notes

- The model is trained on mock data for demonstration
- Real-world accuracy would improve with actual grocery data
- The system is designed for easy integration and testing
- All components are modular and can be replaced independently

## 🆘 Support

If you encounter issues:

1. Check the logs in both servers
2. Verify all dependencies are installed
3. Ensure all required files are present
4. Test individual components separately
5. Check network connectivity between services

## 🎉 Success!

Once everything is working, you should be able to:

1. ✅ Start both servers without errors
2. ✅ Make predictions through the frontend
3. ✅ See prediction results in the UI
4. ✅ View health status of all components
5. ✅ Integrate predictions into the donor workflow

The AI model is now fully integrated into your FoodCast application! 🚀
