#!/usr/bin/env python3
"""
Load demo claims data into the offers system
This simulates completed claims for analytics
"""

import json
import requests
from datetime import datetime, timedelta
import random

# Load demo claims data
with open('demo_claims.json', 'r') as f:
    claims = json.load(f)

# Convert claims to offers with "delivered" status
offers = []
for claim in claims:
    offer = {
        "id": claim["id"],
        "donorId": claim["donorId"],
        "donorName": claim["donorName"],
        "donorAddress": claim["donorAddress"],
        "category": claim["category"],
        "description": claim["description"],
        "quantity": claim["quantity"],
        "unit": claim["unit"],
        "status": "delivered",  # Mark as delivered
        "availableDate": claim["availableDate"],
        "expiryDate": claim["expiryDate"],
        "claimedBy": claim["claimedBy"],
        "claimedByName": claim["claimedByName"],
        "claimedAt": claim["claimedAt"],
        "deliveryId": claim["deliveryId"],
        "createdAt": claim["createdAt"],
        "updatedAt": claim["updatedAt"],
        "location": claim["location"],
        "estimatedValue": claim["estimatedValue"],
        "notes": claim["notes"],
        "isDirectOffer": claim["isDirectOffer"]
    }
    offers.append(offer)

# Load pending offers
with open('demo_offers.json', 'r') as f:
    pending_offers = json.load(f)

# Combine all offers
all_offers = offers + pending_offers

# Save combined offers
with open('combined_demo_offers.json', 'w') as f:
    json.dump(all_offers, f, indent=2)

print(f"✅ Created combined demo data:")
print(f"   📦 {len(offers)} completed claims (delivered)")
print(f"   🎯 {len(pending_offers)} pending offers")
print(f"   📊 {len(all_offers)} total offers")

# Calculate impact metrics
total_meals = sum(offer["quantity"] * 2 for offer in offers)
total_weight = sum(offer["quantity"] for offer in offers)
total_value = sum(offer["estimatedValue"] for offer in offers)
co2_saved = total_weight * 0.5

print(f"\n📈 Impact Metrics:")
print(f"   🍽️ {total_meals} meals provided")
print(f"   🍎 {total_weight} lbs food saved")
print(f"   💰 ${total_value:.2f} value saved")
print(f"   🌍 {co2_saved:.1f} kg CO2 saved")
