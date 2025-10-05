# FoodCast Map Integration Setup Guide

## 🗺️ **Map-Based Food Sharing System**

This guide will help you set up the new map-based food sharing functionality in your FoodCast application.

## 📋 **Prerequisites**

- ✅ Supabase project with the provided schema
- ✅ Google Maps API key with Places API enabled
- ✅ Next.js application running

## 🗄️ **Step 1: Supabase Database Setup**

### 1.1 Copy the SQL Schema

Go to your Supabase project dashboard → SQL Editor and paste this complete schema:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE offer_status AS ENUM ('active', 'claimed', 'expired', 'cancelled');
CREATE TYPE food_category AS ENUM ('fruit', 'vegetable', 'grain', 'protein', 'nut_seed', 'other');

-- Create profiles table (if not exists)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('donor', 'recipient', 'admin')) NOT NULL,
  address TEXT,
  city TEXT,
  zip_code TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create map_offers table
CREATE TABLE map_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category food_category NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  place_id TEXT NOT NULL, -- Google Places place_id
  formatted_address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status offer_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create map_claims table
CREATE TABLE map_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID REFERENCES map_offers(id) ON DELETE CASCADE UNIQUE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Create indexes for performance
CREATE INDEX idx_map_offers_status_expires ON map_offers(status, expires_at);
CREATE INDEX idx_map_offers_location ON map_offers(latitude, longitude);
CREATE INDEX idx_map_offers_donor ON map_offers(donor_id);
CREATE INDEX idx_map_claims_recipient ON map_claims(recipient_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_map_offers_updated_at BEFORE UPDATE ON map_offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to claim an offer
CREATE OR REPLACE FUNCTION claim_map_offer(offer_uuid UUID, claim_notes TEXT DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  offer_record map_offers%ROWTYPE;
  claim_record map_claims%ROWTYPE;
BEGIN
  -- Check if offer exists and is active
  SELECT * INTO offer_record 
  FROM map_offers 
  WHERE id = offer_uuid AND status = 'active' AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Offer not found or not available');
  END IF;
  
  -- Check if already claimed
  IF EXISTS (SELECT 1 FROM map_claims WHERE offer_id = offer_uuid) THEN
    RETURN json_build_object('success', false, 'error', 'Offer already claimed');
  END IF;
  
  -- Insert claim
  INSERT INTO map_claims (offer_id, recipient_id, notes)
  VALUES (offer_uuid, auth.uid(), claim_notes)
  RETURNING * INTO claim_record;
  
  -- Update offer status
  UPDATE map_offers 
  SET status = 'claimed', updated_at = NOW()
  WHERE id = offer_uuid;
  
  RETURN json_build_object(
    'success', true,
    'offer', row_to_json(offer_record),
    'claim', row_to_json(claim_record)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to cancel an offer
CREATE OR REPLACE FUNCTION cancel_map_offer(offer_uuid UUID)
RETURNS JSON AS $$
DECLARE
  offer_record map_offers%ROWTYPE;
BEGIN
  -- Check if offer exists and belongs to current user
  SELECT * INTO offer_record 
  FROM map_offers 
  WHERE id = offer_uuid AND donor_id = auth.uid() AND status = 'active';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Offer not found or not yours');
  END IF;
  
  -- Update offer status
  UPDATE map_offers 
  SET status = 'cancelled', updated_at = NOW()
  WHERE id = offer_uuid;
  
  RETURN json_build_object('success', true, 'offer', row_to_json(offer_record));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to expire offers
CREATE OR REPLACE FUNCTION expire_map_offers()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE map_offers 
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'active' AND expires_at <= NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for map_offers
CREATE POLICY "Anyone can view active offers" ON map_offers
  FOR SELECT USING (status = 'active' AND expires_at > NOW());

CREATE POLICY "Donors can insert own offers" ON map_offers
  FOR INSERT WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Donors can update own offers" ON map_offers
  FOR UPDATE USING (auth.uid() = donor_id);

CREATE POLICY "Donors can delete own offers" ON map_offers
  FOR DELETE USING (auth.uid() = donor_id);

-- RLS Policies for map_claims
CREATE POLICY "Recipients can insert claims" ON map_claims
  FOR INSERT WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Users can view own claims" ON map_claims
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Donors can view claims for their offers" ON map_claims
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM map_offers 
      WHERE map_offers.id = map_claims.offer_id 
      AND map_offers.donor_id = auth.uid()
    )
  );

-- Enable Realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE map_offers;
ALTER PUBLICATION supabase_realtime ADD TABLE map_claims;
```

### 1.2 Enable Realtime

1. Go to **Database** → **Replication** in your Supabase dashboard
2. Enable replication for the following tables:
   - `map_offers`
   - `map_claims`

## 🔑 **Step 2: Environment Variables**

Add these environment variables to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://zetyfhoxrslvfgkwdbpg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpldHlmaG94cnNsdmZna3dkYnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MDMxMDYsImV4cCI6MjA3NTE3OTEwNn0.2HYtOi1GvlZjGXBjmdhCUjryZasdNVjUIWJKu19YTxs

# Google Maps Configuration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyA2KtIXWOxLy-er302Z0Es2H7e68nlp_Fk
```

## 🗺️ **Step 3: Google Maps API Setup**

### 3.1 API Key Restrictions (Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your API key
4. Under **Application restrictions**, select **HTTP referrers**
5. Add these referrers:
   - `http://localhost:3000/*`
   - `http://localhost:3001/*`
   - `https://yourdomain.com/*` (when deployed)

### 3.2 Required APIs

Ensure these APIs are enabled:
- ✅ Maps JavaScript API
- ✅ Places API
- ✅ Geocoding API
- ✅ Distance Matrix API

## 🚀 **Step 4: Install Dependencies**

```bash
cd frontend-mvp
npm install @supabase/supabase-js --legacy-peer-deps
```

## 🎯 **Step 5: Features Overview**

### **For Donors:**
- 📍 **Create Map Offers**: Add location-based offers with Google Places autocomplete
- 🗺️ **View Map**: See all offers on an interactive map
- ❌ **Cancel Offers**: Cancel your own offers
- 📊 **Manage Offers**: Track your map-based offers

### **For Recipients:**
- 🗺️ **Interactive Map**: Browse offers by location with 10-mile radius
- 📍 **Location Services**: Use GPS or search for location
- 🏷️ **Category Filtering**: Filter by food categories
- ⚡ **Real-time Updates**: See offers disappear when claimed
- 🎯 **One-Click Claiming**: Claim offers directly from map markers

### **Key Features:**
- ✅ **Real-time Updates**: Offers update live across all users
- ✅ **Address Validation**: Google Places ensures valid addresses
- ✅ **Expiry Management**: Offers auto-expire and hide when expired
- ✅ **Distance Calculation**: Shows distance from user location
- ✅ **Marker Clustering**: Groups nearby offers for better UX
- ✅ **Security**: Row Level Security (RLS) protects data

## 🔧 **Step 6: Testing the Integration**

### 6.1 Test Donor Flow
1. Login as a donor
2. Go to **Map-Based Offers** section
3. Click **Create Map Offer**
4. Fill out the form with a valid address
5. Submit and see the offer appear on the map

### 6.2 Test Recipient Flow
1. Login as a recipient
2. Go to **Map View** section
3. Allow location access or search for a location
4. See available offers on the map
5. Click on a marker to claim an offer

## 🐛 **Troubleshooting**

### Common Issues:

**1. "Google Maps API not loaded"**
- Check your API key is correct
- Ensure Maps JavaScript API is enabled
- Verify API key restrictions

**2. "Address not found"**
- Make sure Places API is enabled
- Check API key has Places API access

**3. "Supabase connection failed"**
- Verify your Supabase URL and anon key
- Check if RLS policies are set up correctly

**4. "Real-time not working"**
- Ensure Realtime is enabled for tables
- Check if tables are added to replication

## 📱 **Mobile Considerations**

- ✅ **Responsive Design**: Map works on mobile devices
- ✅ **Touch Interactions**: Pinch to zoom, tap to claim
- ✅ **Location Services**: GPS works on mobile browsers

## 🔒 **Security Notes**

- ✅ **RLS Enabled**: All data access is protected by Row Level Security
- ✅ **API Key Restrictions**: Google Maps API key is restricted to your domains
- ✅ **Input Validation**: All addresses are validated through Google Places
- ✅ **One Claim Per Offer**: Database constraint prevents double-claiming

## 🎉 **You're All Set!**

Your FoodCast application now has a fully functional map-based food sharing system! Users can create location-based offers and recipients can find and claim them through an interactive map interface.

## 📞 **Support**

If you encounter any issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure Supabase schema is properly applied
4. Confirm Google Maps API key has correct permissions
