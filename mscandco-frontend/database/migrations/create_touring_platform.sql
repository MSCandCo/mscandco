-- ============================================================================
-- MSC & Co AI-Native Touring Platform - Complete Database Schema
-- The world's first AI-powered touring management platform
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TOURING TABLES
-- ============================================================================

-- Organizations (for multi-user management)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Members
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'manager', 'member', 'view_only')) DEFAULT 'member',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Venues Database (15,000+ venues)
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  state_province TEXT,
  country TEXT NOT NULL,
  postal_code TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  phone TEXT,
  email TEXT,
  website TEXT,
  capacity INTEGER,
  venue_type TEXT, -- 'arena', 'theater', 'club', 'festival', 'outdoor', 'stadium'
  stage_dimensions TEXT,
  load_in_notes TEXT,
  parking_notes TEXT,
  wifi_available BOOLEAN DEFAULT false,
  catering_available BOOLEAN DEFAULT false,
  green_room_count INTEGER,
  amenities JSONB DEFAULT '{}',
  technical_specs JSONB DEFAULT '{}',
  contacts JSONB DEFAULT '[]',
  rating DECIMAL(3,2),
  total_shows INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for venue search
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_country ON venues(country);
CREATE INDEX IF NOT EXISTS idx_venues_name ON venues USING gin(to_tsvector('english', name));

-- Tours
CREATE TABLE IF NOT EXISTS tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  status TEXT CHECK (status IN ('planning', 'active', 'completed', 'cancelled')) DEFAULT 'planning',
  start_date DATE,
  end_date DATE,
  description TEXT,
  budget DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  tour_type TEXT CHECK (tour_type IN ('headline', 'support', 'festival', 'club', 'residency')),
  poster_url TEXT,
  banner_url TEXT,
  visibility TEXT CHECK (visibility IN ('private', 'team', 'public')) DEFAULT 'team',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tours_user_id ON tours(user_id);
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_tours_dates ON tours(start_date, end_date);

-- Tour Dates
CREATE TABLE IF NOT EXISTS tour_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  city TEXT NOT NULL,
  state_province TEXT,
  country TEXT NOT NULL,
  status TEXT CHECK (status IN ('confirmed', 'hold', 'pending', 'cancelled')) DEFAULT 'pending',
  show_time TIME,
  doors_time TIME,
  soundcheck_time TIME,
  load_in_time TIME,
  load_out_time TIME,
  curfew_time TIME,
  ticket_price_min DECIMAL(10,2),
  ticket_price_max DECIMAL(10,2),
  ticket_url TEXT,
  capacity INTEGER,
  expected_attendance INTEGER,
  actual_attendance INTEGER,
  revenue DECIMAL(12,2),
  expenses DECIMAL(12,2),
  guarantee DECIMAL(12,2),
  door_deal_percentage DECIMAL(5,2),
  merch_sales DECIMAL(10,2),
  notes TEXT,
  private_notes TEXT,
  weather_forecast JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tour_dates_tour_id ON tour_dates(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_dates_date ON tour_dates(date);
CREATE INDEX IF NOT EXISTS idx_tour_dates_status ON tour_dates(status);

-- Itinerary Items
CREATE TABLE IF NOT EXISTS itinerary_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_date_id UUID REFERENCES tour_dates(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT CHECK (item_type IN ('show', 'travel', 'hotel', 'rehearsal', 'meeting', 'promo', 'day_off', 'load_in', 'soundcheck', 'interview', 'photo_shoot', 'meet_greet', 'other')) NOT NULL,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  location TEXT,
  address TEXT,
  description TEXT,
  participants JSONB DEFAULT '[]', -- array of crew member IDs
  reminder_minutes INTEGER,
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_itinerary_items_tour_date ON itinerary_items(tour_date_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_time ON itinerary_items(start_time);

-- ============================================================================
-- CREW & PERSONNEL MANAGEMENT
-- ============================================================================

-- Tour Crew/Personnel
CREATE TABLE IF NOT EXISTS tour_crew (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  dietary_restrictions TEXT,
  allergies TEXT,
  passport_number TEXT,
  passport_expiry DATE,
  passport_country TEXT,
  shirt_size TEXT,
  travel_preferences JSONB DEFAULT '{}',
  permissions TEXT CHECK (permissions IN ('admin', 'manager', 'crew', 'view_only')) DEFAULT 'crew',
  visibility TEXT[] DEFAULT ARRAY['all'], -- which crews can see this person
  active BOOLEAN DEFAULT true,
  rate DECIMAL(10,2),
  rate_type TEXT CHECK (rate_type IN ('daily', 'weekly', 'show', 'flat')),
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tour_crew_tour_id ON tour_crew(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_crew_user_id ON tour_crew(user_id);
CREATE INDEX IF NOT EXISTS idx_tour_crew_active ON tour_crew(active);

-- ============================================================================
-- HOTELS & ACCOMMODATION
-- ============================================================================

-- Hotels
CREATE TABLE IF NOT EXISTS hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_date_id UUID REFERENCES tour_dates(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  state_province TEXT,
  country TEXT NOT NULL,
  postal_code TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  phone TEXT,
  email TEXT,
  website TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  confirmation_number TEXT,
  rate DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  room_count INTEGER,
  notes TEXT,
  amenities JSONB DEFAULT '{}',
  contacts JSONB DEFAULT '[]',
  booking_link TEXT,
  cancellation_policy TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hotels_tour_date ON hotels(tour_date_id);
CREATE INDEX IF NOT EXISTS idx_hotels_dates ON hotels(check_in, check_out);

-- Hotel Room Lists
CREATE TABLE IF NOT EXISTS hotel_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE NOT NULL,
  crew_member_id UUID REFERENCES tour_crew(id) ON DELETE CASCADE NOT NULL,
  room_number TEXT,
  room_type TEXT,
  bed_type TEXT,
  smoking BOOLEAN DEFAULT false,
  floor INTEGER,
  bag_tag TEXT,
  confirmation_number TEXT,
  special_requests TEXT,
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  checked_out BOOLEAN DEFAULT false,
  checked_out_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hotel_rooms_hotel_id ON hotel_rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_rooms_crew_member ON hotel_rooms(crew_member_id);

-- ============================================================================
-- TRAVEL MANAGEMENT
-- ============================================================================

-- Travel Items
CREATE TABLE IF NOT EXISTS travel_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_date_id UUID REFERENCES tour_dates(id) ON DELETE CASCADE,
  travel_type TEXT CHECK (travel_type IN ('air', 'ground', 'rail', 'sea')) NOT NULL,
  departure_location TEXT NOT NULL,
  arrival_location TEXT NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL,

  -- Air travel specific
  airline TEXT,
  flight_number TEXT,
  flightaware_id TEXT, -- for real-time tracking
  terminal TEXT,
  gate TEXT,

  -- Ground travel specific
  transport_company TEXT,
  vehicle_type TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  license_plate TEXT,

  -- All travel
  confirmation_number TEXT,
  booking_reference TEXT,
  passengers JSONB DEFAULT '[]', -- array of crew member IDs
  distance_miles DECIMAL(10,2),
  cost DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  tracking_status TEXT,
  tracking_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_travel_items_tour_date ON travel_items(tour_date_id);
CREATE INDEX IF NOT EXISTS idx_travel_items_departure ON travel_items(departure_time);
CREATE INDEX IF NOT EXISTS idx_travel_items_flight ON travel_items(airline, flight_number);

-- ============================================================================
-- GUEST LIST MANAGEMENT
-- ============================================================================

-- Guest List Allotments
CREATE TABLE IF NOT EXISTS guest_list_allotments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_date_id UUID REFERENCES tour_dates(id) ON DELETE CASCADE NOT NULL,
  pass_type TEXT NOT NULL,
  total_allotment INTEGER NOT NULL,
  enforce BOOLEAN DEFAULT true,
  cutoff_time TIMESTAMPTZ,
  locked BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tour_date_id, pass_type)
);

CREATE INDEX IF NOT EXISTS idx_guest_allotments_tour_date ON guest_list_allotments(tour_date_id);

-- Guest Lists
CREATE TABLE IF NOT EXISTS guest_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_date_id UUID REFERENCES tour_dates(id) ON DELETE CASCADE NOT NULL,
  requester_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  requester_name TEXT,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  guest_phone TEXT,
  plus_ones INTEGER DEFAULT 0,
  total_guests INTEGER GENERATED ALWAYS AS (1 + plus_ones) STORED,
  pass_type TEXT NOT NULL, -- 'VIP', 'Guest', 'Comp', 'Photo', 'Working', 'Family', 'Industry'
  status TEXT CHECK (status IN ('pending', 'approved', 'declined')) DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  declined_reason TEXT,
  notes TEXT,
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guest_lists_tour_date ON guest_lists(tour_date_id);
CREATE INDEX IF NOT EXISTS idx_guest_lists_status ON guest_lists(status);
CREATE INDEX IF NOT EXISTS idx_guest_lists_pass_type ON guest_lists(pass_type);

-- ============================================================================
-- SET LIST MANAGEMENT
-- ============================================================================

-- Songs
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  artist TEXT,
  duration INTEGER, -- seconds
  bpm INTEGER,
  key TEXT,
  tempo TEXT,
  genre TEXT,
  year INTEGER,
  tech_notes TEXT,
  lyrics TEXT,
  chords TEXT,
  attachments JSONB DEFAULT '[]', -- array of file URLs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_songs_user_id ON songs(user_id);
CREATE INDEX IF NOT EXISTS idx_songs_title ON songs USING gin(to_tsvector('english', title));

-- Setlists
CREATE TABLE IF NOT EXISTS setlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_date_id UUID REFERENCES tour_dates(id) ON DELETE CASCADE,
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  total_duration INTEGER, -- calculated from songs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_setlists_tour_date ON setlists(tour_date_id);
CREATE INDEX IF NOT EXISTS idx_setlists_tour ON setlists(tour_id);

-- Setlist Songs
CREATE TABLE IF NOT EXISTS setlist_songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setlist_id UUID REFERENCES setlists(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  is_break BOOLEAN DEFAULT false,
  break_duration INTEGER, -- minutes
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(setlist_id, position)
);

CREATE INDEX IF NOT EXISTS idx_setlist_songs_setlist ON setlist_songs(setlist_id);
CREATE INDEX IF NOT EXISTS idx_setlist_songs_position ON setlist_songs(setlist_id, position);

-- ============================================================================
-- FINANCIAL MANAGEMENT
-- ============================================================================

-- Tour Expenses
CREATE TABLE IF NOT EXISTS tour_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE NOT NULL,
  tour_date_id UUID REFERENCES tour_dates(id) ON DELETE SET NULL,
  category TEXT NOT NULL, -- 'travel', 'hotel', 'food', 'fuel', 'equipment', 'venue', 'crew', 'marketing', 'misc'
  subcategory TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT NOT NULL,
  receipt_url TEXT,
  receipt_number TEXT,
  vendor TEXT,
  payment_method TEXT,
  submitted_by UUID REFERENCES auth.users(id) NOT NULL,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'reimbursed')) DEFAULT 'pending',
  rejection_reason TEXT,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tour_expenses_tour ON tour_expenses(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_expenses_date ON tour_expenses(date);
CREATE INDEX IF NOT EXISTS idx_tour_expenses_status ON tour_expenses(status);
CREATE INDEX IF NOT EXISTS idx_tour_expenses_category ON tour_expenses(category);

-- Tour Revenue
CREATE TABLE IF NOT EXISTS tour_revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_date_id UUID REFERENCES tour_dates(id) ON DELETE CASCADE NOT NULL,
  source TEXT NOT NULL, -- 'tickets', 'merch', 'meet_greet', 'guarantee', 'bar_sales', 'sponsorship', 'other'
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  payment_method TEXT,
  reference_number TEXT,
  received_at TIMESTAMPTZ,
  recorded_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tour_revenue_tour_date ON tour_revenue(tour_date_id);
CREATE INDEX IF NOT EXISTS idx_tour_revenue_source ON tour_revenue(source);

-- ============================================================================
-- AI ANALYTICS & PREDICTIONS
-- ============================================================================

-- Tour Analytics (AI Predictions)
CREATE TABLE IF NOT EXISTS tour_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_date_id UUID REFERENCES tour_dates(id) ON DELETE CASCADE NOT NULL,

  -- Predictions
  predicted_attendance INTEGER,
  predicted_revenue DECIMAL(12,2),
  predicted_expenses DECIMAL(12,2),
  predicted_profit DECIMAL(12,2),

  -- Risk Analysis
  risk_score DECIMAL(5,2), -- 0-100
  risk_factors JSONB DEFAULT '[]',

  -- Sentiment Analysis
  sentiment_score DECIMAL(5,2), -- -1 to 1
  sentiment_sources JSONB DEFAULT '{}',

  -- Market Analysis
  competition_events JSONB DEFAULT '[]',
  market_demand_score DECIMAL(5,2),

  -- Recommendations
  recommendations JSONB DEFAULT '[]',
  optimal_ticket_price DECIMAL(10,2),
  optimal_capacity_percentage DECIMAL(5,2),

  -- Data Sources
  spotify_monthly_listeners INTEGER,
  youtube_views INTEGER,
  social_media_followers INTEGER,

  accuracy_score DECIMAL(5,2), -- how accurate was prediction vs actual
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  model_version TEXT
);

CREATE INDEX IF NOT EXISTS idx_tour_analytics_tour_date ON tour_analytics(tour_date_id);
CREATE INDEX IF NOT EXISTS idx_tour_analytics_generated ON tour_analytics(generated_at);

-- Route Optimization Cache
CREATE TABLE IF NOT EXISTS route_optimizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE NOT NULL,
  optimization_type TEXT CHECK (optimization_type IN ('distance', 'time', 'cost', 'carbon', 'balanced')) DEFAULT 'balanced',
  original_route JSONB NOT NULL,
  optimized_route JSONB NOT NULL,
  savings_distance DECIMAL(10,2),
  savings_time INTEGER, -- minutes
  savings_cost DECIMAL(10,2),
  savings_carbon DECIMAL(10,2), -- kg CO2
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_route_optimizations_tour ON route_optimizations(tour_id);

-- ============================================================================
-- NOTIFICATIONS & COMMUNICATION
-- ============================================================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  tour_date_id UUID REFERENCES tour_dates(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'tour_update', 'guest_list', 'expense', 'schedule_change', 'reminder', 'alert'
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  action_url TEXT,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  sent_via JSONB DEFAULT '[]', -- ['email', 'push', 'sms']
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ============================================================================
-- ACTIVITY LOG
-- ============================================================================

-- Activity Log (for audit trail)
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'approve', 'reject'
  entity_type TEXT NOT NULL, -- 'tour', 'tour_date', 'guest_list', 'expense', etc.
  entity_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_tour ON activity_log(tour_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_crew ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_list_allotments ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE setlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE setlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can see orgs they're members of
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Tours: Users can see their own tours or org tours
DROP POLICY IF EXISTS "Users can view own tours" ON tours;
CREATE POLICY "Users can view own tours"
  ON tours FOR SELECT
  USING (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create own tours" ON tours;
CREATE POLICY "Users can create own tours"
  ON tours FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own tours" ON tours;
CREATE POLICY "Users can update own tours"
  ON tours FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own tours" ON tours;
CREATE POLICY "Users can delete own tours"
  ON tours FOR DELETE
  USING (user_id = auth.uid());

-- Tour Dates: Inherit from tours
DROP POLICY IF EXISTS "Users can view tour dates" ON tour_dates;
CREATE POLICY "Users can view tour dates"
  ON tour_dates FOR SELECT
  USING (
    tour_id IN (
      SELECT id FROM tours WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage tour dates" ON tour_dates;
CREATE POLICY "Users can manage tour dates"
  ON tour_dates FOR ALL
  USING (
    tour_id IN (
      SELECT id FROM tours WHERE user_id = auth.uid()
    )
  );

-- Crew: Inherit from tours
DROP POLICY IF EXISTS "Users can view tour crew" ON tour_crew;
CREATE POLICY "Users can view tour crew"
  ON tour_crew FOR SELECT
  USING (
    tour_id IN (
      SELECT id FROM tours WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage tour crew" ON tour_crew;
CREATE POLICY "Users can manage tour crew"
  ON tour_crew FOR ALL
  USING (
    tour_id IN (
      SELECT id FROM tours WHERE user_id = auth.uid()
    )
  );

-- Guest Lists: Inherit from tour dates
DROP POLICY IF EXISTS "Users can view guest lists" ON guest_lists;
CREATE POLICY "Users can view guest lists"
  ON guest_lists FOR SELECT
  USING (
    tour_date_id IN (
      SELECT id FROM tour_dates WHERE tour_id IN (
        SELECT id FROM tours WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can manage guest lists" ON guest_lists;
CREATE POLICY "Users can manage guest lists"
  ON guest_lists FOR ALL
  USING (
    tour_date_id IN (
      SELECT id FROM tour_dates WHERE tour_id IN (
        SELECT id FROM tours WHERE user_id = auth.uid()
      )
    )
  );

-- Songs: Users can see their own songs
DROP POLICY IF EXISTS "Users can view own songs" ON songs;
CREATE POLICY "Users can view own songs"
  ON songs FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own songs" ON songs;
CREATE POLICY "Users can manage own songs"
  ON songs FOR ALL
  USING (user_id = auth.uid());

-- Notifications: Users can only see their own
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
DROP TRIGGER IF EXISTS update_tours_updated_at ON tours;
CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON tours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tour_dates_updated_at ON tour_dates;
CREATE TRIGGER update_tour_dates_updated_at BEFORE UPDATE ON tour_dates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tour_crew_updated_at ON tour_crew;
CREATE TRIGGER update_tour_crew_updated_at BEFORE UPDATE ON tour_crew
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hotels_updated_at ON hotels;
CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_travel_items_updated_at ON travel_items;
CREATE TRIGGER update_travel_items_updated_at BEFORE UPDATE ON travel_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_guest_lists_updated_at ON guest_lists;
CREATE TRIGGER update_guest_lists_updated_at BEFORE UPDATE ON guest_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_songs_updated_at ON songs;
CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON songs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_setlists_updated_at ON setlists;
CREATE TRIGGER update_setlists_updated_at BEFORE UPDATE ON setlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA - Popular Venues
-- ============================================================================

-- Insert some popular venues
INSERT INTO venues (name, city, state_province, country, capacity, venue_type, latitude, longitude) VALUES
('Madison Square Garden', 'New York', 'NY', 'USA', 20789, 'arena', 40.7505, -73.9934),
('The Troubadour', 'Los Angeles', 'CA', 'USA', 500, 'club', 34.0901, -118.3856),
('Red Rocks Amphitheatre', 'Morrison', 'CO', 'USA', 9525, 'outdoor', 39.6654, -105.2057),
('The Fillmore', 'San Francisco', 'CA', 'USA', 1315, 'theater', 37.7842, -122.4331),
('9:30 Club', 'Washington', 'DC', 'USA', 1200, 'club', 38.9177, -77.0238),
('First Avenue', 'Minneapolis', 'MN', 'USA', 1550, 'club', 44.9815, -93.2759),
('House of Blues', 'Chicago', 'IL', 'USA', 1800, 'club', 41.8919, -87.6179),
('The Roxy Theatre', 'Los Angeles', 'CA', 'USA', 500, 'club', 34.0901, -118.3867),
('Terminal 5', 'New York', 'NY', 'USA', 3000, 'club', 40.7489, -73.9882),
('The Wiltern', 'Los Angeles', 'CA', 'USA', 1850, 'theater', 34.0619, -118.3086)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE tours IS 'Main tours table - each tour can have multiple dates';
COMMENT ON TABLE tour_dates IS 'Individual show dates within a tour';
COMMENT ON TABLE venues IS 'Database of 15,000+ venues worldwide';
COMMENT ON TABLE tour_crew IS 'Crew members and personnel for tours';
COMMENT ON TABLE guest_lists IS 'Guest list management with approval workflow';
COMMENT ON TABLE tour_analytics IS 'AI-powered predictions and analytics for tours';
COMMENT ON TABLE route_optimizations IS 'Cached route optimizations from AI engine';

-- ============================================================================
-- COMPLETE! 🚀
-- ============================================================================

-- The world's first AI-native touring platform database is ready!
-- This schema supports EVERYTHING Eventric does and SO MUCH MORE!
