#!/usr/bin/env python3
"""
Generate realistic demo data for FoodCast presentation
Creates artificial users, claims, and offers to showcase the platform's impact
"""

import json
import random
from datetime import datetime, timedelta
import uuid

# Realistic user data
DEMO_DONORS = [
    {"name": "Whole Foods Market", "email": "donor1@wholefoods.com", "address": "123 Main St, San Francisco, CA 94102"},
    {"name": "Trader Joe's", "email": "donor2@traderjoes.com", "address": "456 Market St, San Francisco, CA 94103"},
    {"name": "Safeway", "email": "donor3@safeway.com", "address": "789 Mission St, San Francisco, CA 94105"},
    {"name": "Costco", "email": "donor4@costco.com", "address": "321 Geary Blvd, San Francisco, CA 94118"},
    {"name": "Target", "email": "donor5@target.com", "address": "654 Castro St, San Francisco, CA 94114"},
    {"name": "Walmart", "email": "donor6@walmart.com", "address": "987 Fillmore St, San Francisco, CA 94115"},
    {"name": "Sprouts", "email": "donor7@sprouts.com", "address": "147 Valencia St, San Francisco, CA 94110"},
    {"name": "Lucky Supermarket", "email": "donor8@lucky.com", "address": "258 Irving St, San Francisco, CA 94122"},
    {"name": "FoodMaxx", "email": "donor9@foodmaxx.com", "address": "369 Divisadero St, San Francisco, CA 94117"},
    {"name": "Bi-Rite Market", "email": "donor10@biritemarket.com", "address": "741 18th St, San Francisco, CA 94107"}
]

DEMO_RECIPIENTS = [
    {"name": "Sarah Johnson", "email": "recipient1@email.com", "address": "100 Oak St, San Francisco, CA 94102"},
    {"name": "Michael Chen", "email": "recipient2@email.com", "address": "200 Pine St, San Francisco, CA 94104"},
    {"name": "Maria Rodriguez", "email": "recipient3@email.com", "address": "300 Bush St, San Francisco, CA 94108"},
    {"name": "David Kim", "email": "recipient4@email.com", "address": "400 California St, San Francisco, CA 94111"},
    {"name": "Lisa Thompson", "email": "recipient5@email.com", "address": "500 Sutter St, San Francisco, CA 94109"}
]

# Food categories and realistic items
FOOD_CATEGORIES = ["produce", "dairy", "bakery", "prepared", "canned", "frozen", "other"]
FOOD_ITEMS = {
    "produce": ["Fresh Apples", "Organic Bananas", "Mixed Vegetables", "Leafy Greens", "Citrus Fruits", "Root Vegetables"],
    "dairy": ["Milk", "Cheese", "Yogurt", "Butter", "Cream", "Eggs"],
    "bakery": ["Fresh Bread", "Pastries", "Muffins", "Bagels", "Croissants", "Cakes"],
    "prepared": ["Sandwiches", "Salads", "Soups", "Ready Meals", "Pizza", "Wraps"],
    "canned": ["Canned Vegetables", "Canned Fruits", "Canned Beans", "Canned Soup", "Canned Fish"],
    "frozen": ["Frozen Vegetables", "Frozen Fruits", "Frozen Meals", "Ice Cream", "Frozen Pizza"],
    "other": ["Snacks", "Beverages", "Condiments", "Spices", "Grains", "Nuts"]
}

def generate_demo_users():
    """Generate demo user profiles"""
    users = []
    
    # Add donors
    for i, donor in enumerate(DEMO_DONORS):
        users.append({
            "id": f"donor-{i+1}",
            "email": donor["email"],
            "name": donor["name"],
            "role": "donor",
            "address": donor["address"],
            "city": "San Francisco",
            "zip_code": "94102",
            "phone": f"555-{1000+i:04d}",
            "created_at": (datetime.now() - timedelta(days=random.randint(30, 90))).isoformat(),
            "updated_at": datetime.now().isoformat()
        })
    
    # Add recipients
    for i, recipient in enumerate(DEMO_RECIPIENTS):
        users.append({
            "id": f"recipient-{i+1}",
            "email": recipient["email"],
            "name": recipient["name"],
            "role": "recipient",
            "address": recipient["address"],
            "city": "San Francisco",
            "zip_code": "94102",
            "phone": f"555-{2000+i:04d}",
            "created_at": (datetime.now() - timedelta(days=random.randint(15, 60))).isoformat(),
            "updated_at": datetime.now().isoformat()
        })
    
    return users

def generate_completed_claims():
    """Generate 20 completed claims with realistic data"""
    claims = []
    
    for i in range(20):
        # Random donor and recipient
        donor = random.choice(DEMO_DONORS)
        recipient = random.choice(DEMO_RECIPIENTS)
        
        # Random food item
        category = random.choice(FOOD_CATEGORIES)
        item = random.choice(FOOD_ITEMS[category])
        
        # Realistic quantities and values
        quantity = random.randint(5, 50)
        unit = random.choice(["lbs", "units", "packages", "dozen"])
        estimated_value = round(quantity * random.uniform(2, 8), 2)
        
        # Random dates in the past 30 days
        claimed_date = datetime.now() - timedelta(days=random.randint(1, 30))
        created_date = claimed_date - timedelta(hours=random.randint(1, 48))
        
        claim = {
            "id": f"claim-{i+1:03d}",
            "donorId": f"donor-{DEMO_DONORS.index(donor)+1}",
            "donorName": donor["name"],
            "donorAddress": donor["address"],
            "category": category,
            "description": item,
            "quantity": quantity,
            "unit": unit,
            "status": "delivered",
            "availableDate": created_date.strftime("%Y-%m-%d"),
            "expiryDate": (created_date + timedelta(days=random.randint(3, 14))).strftime("%Y-%m-%d"),
            "claimedBy": f"recipient-{DEMO_RECIPIENTS.index(recipient)+1}",
            "claimedByName": recipient["name"],
            "claimedAt": claimed_date.isoformat(),
            "deliveryId": f"delivery-{i+1:03d}",
            "createdAt": created_date.isoformat(),
            "updatedAt": claimed_date.isoformat(),
            "location": donor["address"],
            "estimatedValue": estimated_value,
            "notes": f"Successfully delivered to {recipient['name']}",
            "isDirectOffer": True
        }
        claims.append(claim)
    
    return claims

def generate_pending_offers():
    """Generate 10-15 pending offers for live activity"""
    offers = []
    
    for i in range(random.randint(10, 15)):
        # Random donor
        donor = random.choice(DEMO_DONORS)
        
        # Random food item
        category = random.choice(FOOD_CATEGORIES)
        item = random.choice(FOOD_ITEMS[category])
        
        # Realistic quantities and values
        quantity = random.randint(3, 40)
        unit = random.choice(["lbs", "units", "packages", "dozen"])
        estimated_value = round(quantity * random.uniform(2, 8), 2)
        
        # Random future dates
        available_date = datetime.now() + timedelta(days=random.randint(0, 3))
        expiry_date = available_date + timedelta(days=random.randint(2, 10))
        
        # Some offers with AI predictions
        is_ai_predicted = random.choice([True, False])
        
        offer = {
            "id": f"offer-{i+1:03d}",
            "donorId": f"donor-{DEMO_DONORS.index(donor)+1}",
            "donorName": donor["name"],
            "donorAddress": donor["address"],
            "category": category,
            "description": f"{item} {'(AI Predicted)' if is_ai_predicted else ''}",
            "quantity": quantity,
            "unit": unit,
            "status": "available",
            "availableDate": available_date.strftime("%Y-%m-%d"),
            "expiryDate": expiry_date.strftime("%Y-%m-%d"),
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat(),
            "location": donor["address"],
            "estimatedValue": estimated_value,
            "notes": f"Fresh {item.lower()} available for pickup",
            "urgencyLevel": random.choice(["low", "medium", "high"]),
            "pickupWindow": random.choice(["Morning", "Afternoon", "Evening", "Anytime"]),
            "specialInstructions": random.choice([
                "Please bring containers",
                "Call when arriving",
                "Ring doorbell",
                "Text for pickup",
                "Available in back entrance"
            ]),
            "isDirectOffer": not is_ai_predicted,
            "isFromPrediction": is_ai_predicted
        }
        
        # Add AI prediction fields if it's an AI predicted offer
        if is_ai_predicted:
            offer.update({
                "storeId": f"store-{random.randint(1, 5)}",
                "productId": f"product-{random.randint(1, 10)}",
                "productName": item,
                "dailySales": random.randint(10, 80),
                "stockLevel": random.randint(20, 150),
                "price": round(random.uniform(3, 15), 2),
                "promotionFlag": random.choice([True, False]),
                "brainDietFlag": random.choice([True, False]),
                "shelfLifeDays": random.randint(3, 14),
                "predictedSurplus": round(quantity * random.uniform(0.8, 1.2), 2),
                "confidence": random.choice(["high", "moderate", "low"]),
                "urgency_score": random.randint(5, 15),
                "nutritional_value": random.randint(6, 10),
                "estimated_meals": quantity * 2,
                "priority_level": random.choice(["High", "Medium", "Low"]),
                "impact_score": round(quantity * 0.5 + random.uniform(5, 15), 1)
            })
        
        offers.append(offer)
    
    return offers

def calculate_impact_metrics(claims, offers):
    """Calculate impact metrics from real data"""
    total_claims = len(claims)
    total_pending = len(offers)
    total_food_saved = sum(claim["quantity"] for claim in claims)
    total_value_saved = sum(claim["estimatedValue"] for claim in claims)
    total_meals_provided = sum(claim["quantity"] * 2 for claim in claims)  # 2 meals per unit
    
    # CO2 saved (rough estimate: 1 lb food = 0.5 kg CO2)
    co2_saved = total_food_saved * 0.5
    
    # Active users
    active_donors = len(set(claim["donorId"] for claim in claims))
    active_recipients = len(set(claim["claimedBy"] for claim in claims))
    
    return {
        "totalDonations": total_claims,
        "totalPredicted": len([o for o in offers if o.get("isFromPrediction", False)]),
        "totalConfirmed": total_claims,
        "totalClaimed": total_claims,
        "totalDelivered": total_claims,
        "predictionAccuracy": 85.2,  # Realistic accuracy
        "averageResponseTime": 2.3,  # Hours
        "totalMealsRescued": total_meals_provided,
        "totalWeight": total_food_saved,
        "co2Saved": round(co2_saved, 1),
        "totalValueSaved": round(total_value_saved, 2),
        "activeDonors": active_donors,
        "activeRecipients": active_recipients,
        "pendingOffers": total_pending
    }

def main():
    """Generate all demo data"""
    print("🔄 Generating demo data for FoodCast presentation...")
    
    # Generate data
    users = generate_demo_users()
    completed_claims = generate_completed_claims()
    pending_offers = generate_pending_offers()
    impact_metrics = calculate_impact_metrics(completed_claims, pending_offers)
    
    # Save to files
    with open('demo_users.json', 'w') as f:
        json.dump(users, f, indent=2)
    
    with open('demo_claims.json', 'w') as f:
        json.dump(completed_claims, f, indent=2)
    
    with open('demo_offers.json', 'w') as f:
        json.dump(pending_offers, f, indent=2)
    
    with open('demo_metrics.json', 'w') as f:
        json.dump(impact_metrics, f, indent=2)
    
    print(f"✅ Generated demo data:")
    print(f"   👥 {len(users)} users ({len([u for u in users if u['role'] == 'donor'])} donors, {len([u for u in users if u['role'] == 'recipient'])} recipients)")
    print(f"   📦 {len(completed_claims)} completed claims")
    print(f"   🎯 {len(pending_offers)} pending offers")
    print(f"   🍎 {impact_metrics['totalWeight']} lbs of food saved")
    print(f"   💰 ${impact_metrics['totalValueSaved']} value saved")
    print(f"   🌍 {impact_metrics['co2Saved']} kg CO2 saved")
    print(f"   🍽️ {impact_metrics['totalMealsRescued']} meals provided")

if __name__ == "__main__":
    main()
