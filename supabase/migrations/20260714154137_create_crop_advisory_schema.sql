/*
# Smart Crop Advisory System - Complete Schema

## Overview
Creates the full database schema for a Smart Crop Advisory System for small and marginal farmers.
Includes farmer profiles, farm details, crop database, recommendations, fertilizers, diseases, and market prices.

## New Tables

### profiles
Extends Supabase auth.users with farmer-specific data.
- id (uuid, PK, references auth.users)
- full_name, mobile_number, village, district, state, farm_size, soil_type, irrigation_method, profile_photo_url
- role (text, default 'farmer')
- created_at

### farm_details
Stores soil and environmental data per farmer. Owner-scoped.
- id, farmer_id, soil_type, soil_ph, nitrogen, phosphorus, potassium, rainfall, temperature, humidity, water_availability, current_season, created_at

### crops
Master crop database with 40+ crops. Public read, authenticated write.
- id, crop_name, scientific_name, soil_type, suitable_season, water_requirement, temperature_range, rainfall_range, fertilizer, growth_duration, expected_yield, market_value, image_url, created_at

### recommendations
Stores crop recommendations generated for farmers. Owner-scoped.
- id, farmer_id, crop_id, confidence, recommendation_date

### fertilizers
Master fertilizer database. Public read, authenticated write.
- id, fertilizer_name, soil_condition, quantity, application_method, precautions, created_at

### diseases
Master crop disease database. Public read, authenticated write.
- id, crop_name, disease_name, symptoms, causes, prevention, treatment, organic_solution, image_url, created_at

### market_prices
Market price data per crop and market. Public read, authenticated write.
- id, crop_name, market_name, current_price, previous_price, price_trend, updated_date

## Security
- RLS enabled on all tables.
- profiles, farm_details, recommendations: owner-scoped CRUD (auth.uid() = id/farmer_id).
- crops, fertilizers, diseases, market_prices: public read (anon+authenticated), authenticated write.
*/

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  mobile_number text,
  village text,
  district text,
  state text,
  farm_size text,
  soil_type text,
  irrigation_method text,
  profile_photo_url text,
  role text NOT NULL DEFAULT 'farmer',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Farm details table
CREATE TABLE IF NOT EXISTS farm_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  soil_type text,
  soil_ph numeric,
  nitrogen numeric,
  phosphorus numeric,
  potassium numeric,
  rainfall numeric,
  temperature numeric,
  humidity numeric,
  water_availability text,
  current_season text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE farm_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_farm_details" ON farm_details;
CREATE POLICY "select_own_farm_details" ON farm_details FOR SELECT
  TO authenticated USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "insert_own_farm_details" ON farm_details;
CREATE POLICY "insert_own_farm_details" ON farm_details FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "update_own_farm_details" ON farm_details;
CREATE POLICY "update_own_farm_details" ON farm_details FOR UPDATE
  TO authenticated USING (auth.uid() = farmer_id) WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "delete_own_farm_details" ON farm_details;
CREATE POLICY "delete_own_farm_details" ON farm_details FOR DELETE
  TO authenticated USING (auth.uid() = farmer_id);

-- Crops table (master data - public read)
CREATE TABLE IF NOT EXISTS crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name text NOT NULL,
  scientific_name text,
  soil_type text,
  suitable_season text,
  water_requirement text,
  temperature_range text,
  rainfall_range text,
  fertilizer text,
  growth_duration text,
  expected_yield text,
  market_value text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_crops" ON crops;
CREATE POLICY "public_read_crops" ON crops FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "authed_insert_crops" ON crops;
CREATE POLICY "authed_insert_crops" ON crops FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authed_update_crops" ON crops;
CREATE POLICY "authed_update_crops" ON crops FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authed_delete_crops" ON crops;
CREATE POLICY "authed_delete_crops" ON crops FOR DELETE
  TO authenticated USING (true);

-- Recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  crop_id uuid REFERENCES crops(id) ON DELETE SET NULL,
  confidence numeric,
  recommendation_date timestamptz DEFAULT now()
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_recommendations" ON recommendations;
CREATE POLICY "select_own_recommendations" ON recommendations FOR SELECT
  TO authenticated USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "insert_own_recommendations" ON recommendations;
CREATE POLICY "insert_own_recommendations" ON recommendations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "delete_own_recommendations" ON recommendations;
CREATE POLICY "delete_own_recommendations" ON recommendations FOR DELETE
  TO authenticated USING (auth.uid() = farmer_id);

-- Fertilizers table (master data - public read)
CREATE TABLE IF NOT EXISTS fertilizers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fertilizer_name text NOT NULL,
  soil_condition text,
  quantity text,
  application_method text,
  precautions text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fertilizers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_fertilizers" ON fertilizers;
CREATE POLICY "public_read_fertilizers" ON fertilizers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "authed_insert_fertilizers" ON fertilizers;
CREATE POLICY "authed_insert_fertilizers" ON fertilizers FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authed_update_fertilizers" ON fertilizers;
CREATE POLICY "authed_update_fertilizers" ON fertilizers FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authed_delete_fertilizers" ON fertilizers;
CREATE POLICY "authed_delete_fertilizers" ON fertilizers FOR DELETE
  TO authenticated USING (true);

-- Diseases table (master data - public read)
CREATE TABLE IF NOT EXISTS diseases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name text NOT NULL,
  disease_name text NOT NULL,
  symptoms text,
  causes text,
  prevention text,
  treatment text,
  organic_solution text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_diseases" ON diseases;
CREATE POLICY "public_read_diseases" ON diseases FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "authed_insert_diseases" ON diseases;
CREATE POLICY "authed_insert_diseases" ON diseases FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authed_update_diseases" ON diseases;
CREATE POLICY "authed_update_diseases" ON diseases FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authed_delete_diseases" ON diseases;
CREATE POLICY "authed_delete_diseases" ON diseases FOR DELETE
  TO authenticated USING (true);

-- Market prices table (public read)
CREATE TABLE IF NOT EXISTS market_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name text NOT NULL,
  market_name text NOT NULL,
  current_price numeric NOT NULL,
  previous_price numeric,
  price_trend text,
  updated_date timestamptz DEFAULT now()
);

ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_market_prices" ON market_prices;
CREATE POLICY "public_read_market_prices" ON market_prices FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "authed_insert_market_prices" ON market_prices;
CREATE POLICY "authed_insert_market_prices" ON market_prices FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authed_update_market_prices" ON market_prices;
CREATE POLICY "authed_update_market_prices" ON market_prices FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authed_delete_market_prices" ON market_prices;
CREATE POLICY "authed_delete_market_prices" ON market_prices FOR DELETE
  TO authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_farm_details_farmer_id ON farm_details(farmer_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_farmer_id ON recommendations(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crops_name ON crops(crop_name);
CREATE INDEX IF NOT EXISTS idx_market_prices_crop ON market_prices(crop_name);
CREATE INDEX IF NOT EXISTS idx_diseases_crop ON diseases(crop_name);
