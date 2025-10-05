#!/usr/bin/env python3
"""
Simple API server to serve food surplus predictions to the frontend.
This can be integrated with your Express.js backend or run as a standalone service.
"""

import json
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Load predictions data
def load_predictions():
    """Load predictions from the JSON file."""
    try:
        with open('predicted_surplus.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

predictions_data = load_predictions()
df = pd.DataFrame(predictions_data)

@app.route('/api/predictions', methods=['GET'])
def get_predictions():
    """Get all predictions with optional filtering."""
    try:
        # Get query parameters
        store_id = request.args.get('store_id')
        product_id = request.args.get('product_id')
        brain_diet_only = request.args.get('brain_diet_only', 'false').lower() == 'true'
        min_surplus = request.args.get('min_surplus', type=float)
        limit = request.args.get('limit', type=int, default=100)
        
        # Filter data
        filtered_df = df.copy()
        
        if store_id:
            filtered_df = filtered_df[filtered_df['store_id'] == store_id]
        
        if product_id:
            filtered_df = filtered_df[filtered_df['product_id'] == product_id]
        
        if brain_diet_only:
            filtered_df = filtered_df[filtered_df['brain_diet_flag'] == True]
        
        if min_surplus:
            filtered_df = filtered_df[filtered_df['predicted_surplus'] >= min_surplus]
        
        # Sort by predicted surplus (highest first)
        filtered_df = filtered_df.sort_values('predicted_surplus', ascending=False)
        
        # Limit results
        if limit:
            filtered_df = filtered_df.head(limit)
        
        # Convert to list of dictionaries
        results = filtered_df.to_dict('records')
        
        return jsonify({
            'success': True,
            'count': len(results),
            'predictions': results,
            'filters': {
                'store_id': store_id,
                'product_id': product_id,
                'brain_diet_only': brain_diet_only,
                'min_surplus': min_surplus,
                'limit': limit
            }
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/predictions/stats', methods=['GET'])
def get_prediction_stats():
    """Get statistics about the predictions."""
    try:
        stats = {
            'total_predictions': len(df),
            'total_stores': df['store_id'].nunique(),
            'total_products': df['product_id'].nunique(),
            'brain_diet_items': df['brain_diet_flag'].sum(),
            'average_surplus': float(df['predicted_surplus'].mean()),
            'median_surplus': float(df['predicted_surplus'].median()),
            'max_surplus': float(df['predicted_surplus'].max()),
            'min_surplus': float(df['predicted_surplus'].min()),
            'model_accuracy': {
                'r2_score': 0.5937,
                'mae': 33.78,
                'cv_r2_mean': 0.5980,
                'cv_r2_std': 0.0074
            }
        }
        
        return jsonify({
            'success': True,
            'stats': stats
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/predictions/stores/<store_id>', methods=['GET'])
def get_store_predictions(store_id):
    """Get predictions for a specific store."""
    try:
        store_df = df[df['store_id'] == store_id]
        
        if store_df.empty:
            return jsonify({
                'success': False,
                'error': f'Store {store_id} not found'
            }), 404
        
        # Get top predictions for this store
        top_predictions = store_df.nlargest(10, 'predicted_surplus')
        
        return jsonify({
            'success': True,
            'store_id': store_id,
            'total_predictions': len(store_df),
            'top_predictions': top_predictions.to_dict('records'),
            'store_stats': {
                'average_surplus': float(store_df['predicted_surplus'].mean()),
                'total_surplus': float(store_df['predicted_surplus'].sum()),
                'brain_diet_items': int(store_df['brain_diet_flag'].sum())
            }
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/predictions/recipients', methods=['GET'])
def get_recipient_predictions():
    """Get predictions suitable for recipients (high surplus, brain diet items)."""
    try:
        # Filter for high surplus items
        min_surplus = request.args.get('min_surplus', type=float, default=50.0)
        brain_diet_only = request.args.get('brain_diet_only', 'false').lower() == 'true'
        
        filtered_df = df[df['predicted_surplus'] >= min_surplus]
        
        if brain_diet_only:
            filtered_df = filtered_df[filtered_df['brain_diet_flag'] == True]
        
        # Sort by predicted surplus
        filtered_df = filtered_df.sort_values('predicted_surplus', ascending=False)
        
        # Limit to top 50
        filtered_df = filtered_df.head(50)
        
        return jsonify({
            'success': True,
            'count': len(filtered_df),
            'predictions': filtered_df.to_dict('records'),
            'filters': {
                'min_surplus': min_surplus,
                'brain_diet_only': brain_diet_only
            }
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'predictions_loaded': len(predictions_data) > 0,
        'total_predictions': len(predictions_data)
    })

if __name__ == '__main__':
    print("🚀 Starting FoodCast Predictions API Server...")
    print(f"📊 Loaded {len(predictions_data)} predictions")
    print("🌐 API Endpoints:")
    print("  GET /api/predictions - Get all predictions with filtering")
    print("  GET /api/predictions/stats - Get prediction statistics")
    print("  GET /api/predictions/stores/<store_id> - Get store-specific predictions")
    print("  GET /api/predictions/recipients - Get recipient-suitable predictions")
    print("  GET /health - Health check")
    print("\n🔗 Example URLs:")
    print("  http://localhost:5000/api/predictions?store_id=1&limit=10")
    print("  http://localhost:5000/api/predictions/recipients?min_surplus=100")
    print("  http://localhost:5000/api/predictions/stats")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
