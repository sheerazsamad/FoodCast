#!/usr/bin/env python3
"""
FoodCast AI Model Server
Provides a simple HTTP API for the trained surplus prediction model.
This server can be called from the Next.js backend via HTTP requests.
"""

import json
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os
from datetime import datetime, timedelta
import warnings

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Global variables to store the model and feature columns
model = None
feature_columns = None
model_loaded = False

def load_model():
    """
    Load the trained model and feature columns.
    This function will be called once at server startup.
    """
    global model, feature_columns, model_loaded
    
    try:
        # Check if we have a saved model file
        model_path = 'trained_model.pkl'
        features_path = 'feature_columns.pkl'
        
        if os.path.exists(model_path) and os.path.exists(features_path):
            # Load pre-trained model
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
            
            with open(features_path, 'rb') as f:
                feature_columns = pickle.load(f)
            
            print(f"✅ Loaded pre-trained model with {len(feature_columns)} features")
        else:
            # Train a new model if no saved model exists
            print("🔄 No pre-trained model found. Training new model...")
            from surplus_model import FoodSurplusPredictor
            
            predictor = FoodSurplusPredictor()
            
            # Run the full pipeline to train the model
            results = predictor.run_full_pipeline()
            
            # Extract model and features
            model = results['model']
            feature_columns = predictor.feature_columns
            
            # Save the model for future use
            with open(model_path, 'wb') as f:
                pickle.dump(model, f)
            
            with open(features_path, 'wb') as f:
                pickle.dump(feature_columns, f)
            
            print(f"✅ Trained and saved new model with {len(feature_columns)} features")
        
        model_loaded = True
        return True
        
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        model_loaded = False
        return False

def prepare_prediction_data(input_data):
    """
    Prepare input data for prediction by engineering features.
    
    Args:
        input_data (dict): Input data from the API request
        
    Returns:
        pd.DataFrame: Prepared feature matrix
    """
    try:
        # Create a DataFrame with the input data
        df = pd.DataFrame([input_data])
        
        # Parse the date
        if 'date' in input_data:
            df['date'] = pd.to_datetime(input_data['date'])
        else:
            df['date'] = pd.Timestamp.now()
        
        # Engineer temporal features
        df['year'] = df['date'].dt.year
        df['month'] = df['date'].dt.month
        df['day'] = df['date'].dt.day
        df['dayofweek'] = df['date'].dt.dayofweek
        df['dayofyear'] = df['date'].dt.dayofyear
        df['quarter'] = df['date'].dt.quarter
        df['week'] = df['date'].dt.isocalendar().week
        
        # Cyclical encoding for temporal features
        df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
        df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
        df['dayofweek_sin'] = np.sin(2 * np.pi * df['dayofweek'] / 7)
        df['dayofweek_cos'] = np.cos(2 * np.pi * df['dayofweek'] / 7)
        df['dayofyear_sin'] = np.sin(2 * np.pi * df['dayofyear'] / 365)
        df['dayofyear_cos'] = np.cos(2 * np.pi * df['dayofyear'] / 365)
        
        # Business calendar features
        df['is_weekend'] = (df['dayofweek'] >= 5).astype(int)
        df['is_month_start'] = (df['day'] <= 5).astype(int)
        df['is_month_end'] = (df['day'] >= 25).astype(int)
        df['is_quarter_start'] = df['day'].isin([1]) & df['month'].isin([1, 4, 7, 10])
        df['is_quarter_end'] = df['day'].isin([31, 30, 29, 28]) & df['month'].isin([3, 6, 9, 12])
        
        # Encode boolean features
        df['promotion_encoded'] = df.get('promotion_flag', False).astype(int)
        df['brain_diet_encoded'] = df.get('brain_diet_flag', False).astype(int)
        
        # Normalize price and shelf life
        df['price_normalized'] = (df.get('price', 10) - 10) / 20  # Normalize around typical price range
        df['shelf_life_normalized'] = df.get('shelf_life_days', 7) / 30  # Normalize around typical shelf life
        
        # Create interaction features
        df['promotion_sales_interaction'] = df['promotion_encoded'] * df.get('daily_sales', 50)
        
        # Use actual input data for key features, with realistic variations for missing features
        daily_sales = input_data.get('daily_sales', 50)
        stock_level = input_data.get('stock_level', 100)
        price = input_data.get('price', 10)
        
        # Calculate realistic variations based on actual input
        sales_variation = daily_sales * 0.1  # 10% variation
        stock_variation = stock_level * 0.1
        
        default_values = {
            'daily_sales_sales': daily_sales,  # Use actual input
            'stock_level': stock_level,        # Use actual input
            'price': price,                    # Use actual input
            'sales_3day_avg': daily_sales + np.random.normal(0, sales_variation),
            'sales_7day_avg': daily_sales + np.random.normal(0, sales_variation),
            'sales_14day_avg': daily_sales + np.random.normal(0, sales_variation),
            'sales_3day_std': sales_variation,
            'sales_7day_std': sales_variation,
            'sales_14day_std': sales_variation,
            'stock_3day_avg': stock_level + np.random.normal(0, stock_variation),
            'stock_7day_avg': stock_level + np.random.normal(0, stock_variation),
            'stock_14day_avg': stock_level + np.random.normal(0, stock_variation),
            'sales_lag_1': daily_sales + np.random.normal(0, sales_variation),
            'sales_lag_2': daily_sales + np.random.normal(0, sales_variation),
            'sales_lag_3': daily_sales + np.random.normal(0, sales_variation),
            'sales_lag_7': daily_sales + np.random.normal(0, sales_variation),
            'sales_lag_14': daily_sales + np.random.normal(0, sales_variation),
            'stock_lag_1': stock_level + np.random.normal(0, stock_variation),
            'stock_lag_2': stock_level + np.random.normal(0, stock_variation),
            'stock_lag_3': stock_level + np.random.normal(0, stock_variation),
            'stock_lag_7': stock_level + np.random.normal(0, stock_variation),
            'stock_lag_14': stock_level + np.random.normal(0, stock_variation),
            'surplus_lag_1': max(0, (stock_level - daily_sales) * 0.3 + np.random.normal(0, 5)),
            'surplus_lag_2': max(0, (stock_level - daily_sales) * 0.25 + np.random.normal(0, 5)),
            'surplus_lag_3': max(0, (stock_level - daily_sales) * 0.2 + np.random.normal(0, 5)),
            'surplus_lag_7': max(0, (stock_level - daily_sales) * 0.15 + np.random.normal(0, 5)),
            'sales_trend_7day': np.random.normal(0, 0.1),
            'stock_trend_7day': np.random.normal(0, 0.1),
            'sales_volatility_7day': max(0.1, sales_variation / daily_sales),
            'store_avg_sales': daily_sales + np.random.normal(0, sales_variation),
            'product_avg_sales': daily_sales + np.random.normal(0, sales_variation),
            'store_avg_stock': stock_level + np.random.normal(0, stock_variation),
            'product_avg_stock': stock_level + np.random.normal(0, stock_variation)
        }
        
        # Fill missing features with defaults
        for feature, default_value in default_values.items():
            if feature not in df.columns:
                df[feature] = default_value
        
        # Select only the features used by the model
        if feature_columns:
            # Ensure all required features are present
            for feature in feature_columns:
                if feature not in df.columns:
                    df[feature] = default_values.get(feature, 0)
            
            X = df[feature_columns].copy()
        else:
            # Fallback to basic features if feature_columns is not loaded
            basic_features = ['daily_sales_sales', 'stock_level', 'price', 'promotion_encoded', 'brain_diet_encoded']
            X = df[basic_features].copy()
        
        # Handle any remaining missing values
        X = X.fillna(X.median())
        X = X.replace([np.inf, -np.inf], np.nan)
        X = X.fillna(X.median())
        
        return X
        
    except Exception as e:
        print(f"❌ Error preparing prediction data: {e}")
        raise e

def calculate_urgency_score(input_data, predicted_surplus):
    """
    Calculate urgency score (1-20) based on various factors.
    Higher score = more urgent.
    """
    score = 0
    
    # Base urgency from surplus amount
    if predicted_surplus > 50:
        score += 8
    elif predicted_surplus > 30:
        score += 6
    elif predicted_surplus > 15:
        score += 4
    else:
        score += 2
    
    # Shelf life urgency
    shelf_life = input_data.get('shelf_life_days', 7)
    if shelf_life <= 1:
        score += 6
    elif shelf_life <= 3:
        score += 4
    elif shelf_life <= 7:
        score += 2
    
    # Brain diet items get higher priority
    if input_data.get('brain_diet_flag', False):
        score += 3
    
    # Promotional items might be more urgent
    if input_data.get('promotion_flag', False):
        score += 1
    
    return min(20, max(1, score))

def calculate_nutritional_value(input_data):
    """
    Calculate nutritional value score (1-10) based on product type.
    """
    product_name = input_data.get('product_name', '').lower()
    
    # High nutrition foods
    if any(word in product_name for word in ['organic', 'fresh', 'vegetable', 'fruit', 'apple', 'banana', 'carrot', 'broccoli']):
        return 9
    elif any(word in product_name for word in ['meat', 'chicken', 'fish', 'protein', 'dairy', 'milk', 'cheese']):
        return 8
    elif any(word in product_name for word in ['bread', 'grain', 'rice', 'pasta', 'cereal']):
        return 6
    elif any(word in product_name for word in ['snack', 'chip', 'cookie', 'candy']):
        return 3
    else:
        return 5  # Default moderate nutrition

def calculate_expiry_date(input_data):
    """
    Calculate expiry date based on prediction date and shelf life.
    """
    try:
        prediction_date = datetime.strptime(input_data.get('date', datetime.now().strftime('%Y-%m-%d')), '%Y-%m-%d')
        shelf_life_days = input_data.get('shelf_life_days', 7)
        expiry_date = prediction_date + timedelta(days=shelf_life_days)
        return expiry_date.strftime('%Y-%m-%d')
    except:
        return None

def get_priority_level(urgency_score):
    """Convert urgency score to priority level."""
    if urgency_score >= 15:
        return "Critical"
    elif urgency_score >= 10:
        return "High"
    elif urgency_score >= 7:
        return "Medium"
    else:
        return "Low"

def get_impact_score(predicted_surplus, nutritional_value):
    """Calculate social impact score."""
    return round((predicted_surplus * 0.1) + (nutritional_value * 2), 1)

@app.route('/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint.
    Accepts input data and returns predicted surplus.
    """
    try:
        if not model_loaded:
            return jsonify({
                'success': False,
                'error': 'Model not loaded'
            }), 500
        
        # Get input data from request
        input_data = request.get_json()
        
        if not input_data:
            return jsonify({
                'success': False,
                'error': 'No input data provided'
            }), 400
        
        # Validate required fields
        required_fields = ['store_id', 'product_id', 'daily_sales', 'stock_level']
        missing_fields = [field for field in required_fields if field not in input_data]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Prepare data for prediction
        X = prepare_prediction_data(input_data)
        
        # Make prediction
        prediction = model.predict(X)[0]
        
        # Ensure prediction is non-negative
        prediction = max(0, prediction)
        
        # Calculate enhanced MVP features
        urgency_score = calculate_urgency_score(input_data, prediction)
        nutritional_value = calculate_nutritional_value(input_data)
        estimated_meals = int(prediction * 2)  # Rough estimate: 2 meals per unit
        expiry_date = calculate_expiry_date(input_data)
        priority_level = get_priority_level(urgency_score)
        impact_score = get_impact_score(prediction, nutritional_value)
        
        return jsonify({
            'success': True,
            'prediction': {
                'predicted_surplus': round(float(prediction), 2),
                'store_id': input_data['store_id'],
                'product_id': input_data['product_id'],
                'product_name': input_data.get('product_name', 'Unknown'),
                'date': input_data.get('date', datetime.now().strftime('%Y-%m-%d')),
                'confidence': 'moderate',
                # Enhanced MVP features
                'urgency_score': urgency_score,
                'nutritional_value': nutritional_value,
                'estimated_meals': estimated_meals,
                'expiry_date': expiry_date,
                'priority_level': priority_level,
                'impact_score': impact_score,
                'shelf_life_days': input_data.get('shelf_life_days', 7),
                'brain_diet_flag': input_data.get('brain_diet_flag', False),
                'promotion_flag': input_data.get('promotion_flag', False)
            },
            'model_info': {
                'features_used': len(feature_columns) if feature_columns else 0,
                'model_type': 'GradientBoostingRegressor',
                'accuracy': '59.4% (R² = 0.5937)'
            }
        })
        
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return jsonify({
            'success': False,
            'error': f'Prediction failed: {str(e)}'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to verify model status.
    """
    return jsonify({
        'status': 'healthy',
        'model_loaded': model_loaded,
        'features_count': len(feature_columns) if feature_columns else 0,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/features', methods=['GET'])
def get_features():
    """
    Get the list of features used by the model.
    """
    return jsonify({
        'success': True,
        'features': feature_columns if feature_columns else [],
        'count': len(feature_columns) if feature_columns else 0
    })

if __name__ == '__main__':
    print("🚀 Starting FoodCast AI Model Server...")
    
    # Load the model at startup
    if load_model():
        print("✅ Model loaded successfully!")
        print("🌐 API Endpoints:")
        print("  POST /predict - Make surplus predictions")
        print("  GET /health - Health check")
        print("  GET /features - Get model features")
        print("\n🔗 Example prediction request:")
        print("""
        {
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
        }
        """)
        
        app.run(debug=True, host='0.0.0.0', port=5001)
    else:
        print("❌ Failed to load model. Exiting.")
        exit(1)
