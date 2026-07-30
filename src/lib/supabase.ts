import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Crop = {
  id: string;
  crop_name: string;
  scientific_name: string;
  soil_type: string;
  suitable_season: string;
  water_requirement: string;
  temperature_range: string;
  rainfall_range: string;
  fertilizer: string;
  growth_duration: string;
  expected_yield: string;
  market_value: string;
  image_url: string;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string;
  mobile_number: string;
  village: string;
  district: string;
  state: string;
  farm_size: string;
  soil_type: string;
  irrigation_method: string;
  profile_photo_url: string;
  role: string;
  created_at: string;
};

export type FarmDetail = {
  id: string;
  farmer_id: string;
  soil_type: string;
  soil_ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  rainfall: number;
  temperature: number;
  humidity: number;
  water_availability: string;
  current_season: string;
  created_at: string;
};

export type Fertilizer = {
  id: string;
  fertilizer_name: string;
  soil_condition: string;
  quantity: string;
  application_method: string;
  precautions: string;
  created_at: string;
};

export type Disease = {
  id: string;
  crop_name: string;
  disease_name: string;
  symptoms: string;
  causes: string;
  prevention: string;
  treatment: string;
  organic_solution: string;
  image_url: string;
  season: string | null;
  created_at: string;
};

export type MarketPrice = {
  id: string;
  crop_name: string;
  market_name: string;
  current_price: number;
  previous_price: number;
  price_trend: string;
  updated_date: string;
};

export type Recommendation = {
  id: string;
  farmer_id: string;
  crop_id: string;
  confidence: number;
  recommendation_date: string;
};
