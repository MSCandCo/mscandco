-- Complete Touring Platform Features
-- This migration adds all missing tables for a comprehensive touring management system

-- =====================================================
-- TECHNICAL DOCUMENTS TABLE
-- Stage plots, input lists, tech riders, hospitality riders
-- =====================================================
CREATE TABLE IF NOT EXISTS tour_technical_docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid REFERENCES tours(id) ON DELETE CASCADE,
  tour_date_id uuid REFERENCES tour_dates(id) ON DELETE CASCADE,
  doc_type text NOT NULL CHECK (doc_type IN ('stage_plot', 'input_list', 'tech_rider', 'hospitality_rider', 'production_schedule', 'other')),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  mime_type text,
  version integer DEFAULT 1,
  is_current boolean DEFAULT true,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_tech_docs_tour ON tour_technical_docs(tour_id);
CREATE INDEX idx_tech_docs_date ON tour_technical_docs(tour_date_id);
CREATE INDEX idx_tech_docs_type ON tour_technical_docs(doc_type);

-- =====================================================
-- CONTACTS MANAGEMENT TABLE
-- Centralized contact database for venues, vendors, crew, local contacts
-- =====================================================
CREATE TABLE IF NOT EXISTS tour_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid REFERENCES tours(id) ON DELETE CASCADE,
  contact_type text NOT NULL CHECK (contact_type IN ('venue', 'vendor', 'crew', 'local_contact', 'promoter', 'agent', 'security', 'medical', 'other')),
  name text NOT NULL,
  company text,
  position text,
  phone text,
  phone_secondary text,
  email text,
  email_secondary text,
  address text,
  city text,
  state_province text,
  country text,
  postal_code text,
  role text,
  notes text,
  emergency_contact boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_tour_contacts_tour ON tour_contacts(tour_id);
CREATE INDEX idx_tour_contacts_type ON tour_contacts(contact_type);
CREATE INDEX idx_tour_contacts_emergency ON tour_contacts(emergency_contact) WHERE emergency_contact = true;

-- =====================================================
-- DAY SHEETS TABLE
-- Detailed daily schedules with call times and activities
-- =====================================================
CREATE TABLE IF NOT EXISTS tour_day_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_date_id uuid REFERENCES tour_dates(id) ON DELETE CASCADE,
  date date NOT NULL,

  -- Call times
  crew_call time,
  load_in time,
  soundcheck time,
  doors_time time,
  show_time time,
  curfew time,
  load_out time,

  -- Schedule items (flexible JSONB array)
  schedule jsonb DEFAULT '[]'::jsonb,
  -- Example: [{"time": "14:00", "activity": "Bus call", "location": "Hotel lobby", "notes": "Don't be late!"}]

  -- Additional info
  weather text,
  venue_notes text,
  catering_notes text,
  special_instructions text,
  emergency_info text,

  -- Status
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'completed')),
  published_at timestamptz,
  published_by uuid REFERENCES auth.users(id),

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_day_sheets_date ON tour_day_sheets(tour_date_id);
CREATE INDEX idx_day_sheets_date_date ON tour_day_sheets(date);
CREATE INDEX idx_day_sheets_status ON tour_day_sheets(status);

-- =====================================================
-- PRODUCTION REQUIREMENTS TABLE
-- Technical requirements for each show
-- =====================================================
CREATE TABLE IF NOT EXISTS tour_production_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid REFERENCES tours(id) ON DELETE CASCADE,
  tour_date_id uuid REFERENCES tour_dates(id) ON DELETE CASCADE,

  -- Stage requirements
  stage_size text,
  stage_height text,
  power_requirements text,
  lighting_requirements text,
  sound_requirements text,
  backline_requirements text,

  -- Crew requirements
  local_crew_needed jsonb, -- {"stagehands": 4, "loaders": 2, "security": 6}
  dressing_rooms_needed integer,
  green_room_requirements text,

  -- Other requirements
  parking_requirements text,
  security_requirements text,
  catering_requirements text,
  merchandise_space text,
  wifi_requirements text,

  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_prod_req_tour ON tour_production_requirements(tour_id);
CREATE INDEX idx_prod_req_date ON tour_production_requirements(tour_date_id);

-- =====================================================
-- MERCHANDISE INVENTORY TABLE
-- Track merchandise for tour
-- =====================================================
CREATE TABLE IF NOT EXISTS tour_merchandise (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid REFERENCES tours(id) ON DELETE CASCADE,

  product_name text NOT NULL,
  product_type text, -- 'tshirt', 'hoodie', 'hat', 'poster', 'vinyl', etc
  size text,
  color text,
  price numeric(10,2),
  cost numeric(10,2),

  starting_inventory integer DEFAULT 0,
  current_inventory integer DEFAULT 0,
  sold integer DEFAULT 0,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_merch_tour ON tour_merchandise(tour_id);

-- =====================================================
-- MERCHANDISE SALES TABLE
-- Track daily merchandise sales
-- =====================================================
CREATE TABLE IF NOT EXISTS tour_merchandise_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_date_id uuid REFERENCES tour_dates(id) ON DELETE CASCADE,
  merchandise_id uuid REFERENCES tour_merchandise(id) ON DELETE CASCADE,

  quantity_sold integer NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  total_amount numeric(10,2) GENERATED ALWAYS AS (quantity_sold * unit_price) STORED,

  payment_method text, -- 'cash', 'card', 'mobile'
  notes text,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_merch_sales_date ON tour_merchandise_sales(tour_date_id);
CREATE INDEX idx_merch_sales_item ON tour_merchandise_sales(merchandise_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Technical Documents
ALTER TABLE tour_technical_docs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view tour technical docs" ON tour_technical_docs;
CREATE POLICY "Users can view tour technical docs"
  ON tour_technical_docs FOR SELECT
  USING (
    tour_id IN (SELECT id FROM tours WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage tour technical docs" ON tour_technical_docs;
CREATE POLICY "Users can manage tour technical docs"
  ON tour_technical_docs FOR ALL
  USING (
    tour_id IN (SELECT id FROM tours WHERE user_id = auth.uid())
  )
  WITH CHECK (
    tour_id IN (SELECT id FROM tours WHERE user_id = auth.uid())
  );

-- Contacts
ALTER TABLE tour_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view tour contacts" ON tour_contacts;
CREATE POLICY "Users can view tour contacts"
  ON tour_contacts FOR SELECT
  USING (
    tour_id IN (SELECT id FROM tours WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage tour contacts" ON tour_contacts;
CREATE POLICY "Users can manage tour contacts"
  ON tour_contacts FOR ALL
  USING (
    tour_id IN (SELECT id FROM tours WHERE user_id = auth.uid())
  )
  WITH CHECK (
    tour_id IN (SELECT id FROM tours WHERE user_id = auth.uid())
  );

-- Day Sheets
ALTER TABLE tour_day_sheets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view day sheets" ON tour_day_sheets;
CREATE POLICY "Users can view day sheets"
  ON tour_day_sheets FOR SELECT
  USING (
    tour_date_id IN (
      SELECT id FROM tour_dates WHERE tour_id IN (
        SELECT id FROM tours WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can manage day sheets" ON tour_day_sheets;
CREATE POLICY "Users can manage day sheets"
  ON tour_day_sheets FOR ALL
  USING (
    tour_date_id IN (
      SELECT id FROM tour_dates WHERE tour_id IN (
        SELECT id FROM tours WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    tour_date_id IN (
      SELECT id FROM tour_dates WHERE tour_id IN (
        SELECT id FROM tours WHERE user_id = auth.uid()
      )
    )
  );

-- Production Requirements
ALTER TABLE tour_production_requirements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view production requirements" ON tour_production_requirements;
CREATE POLICY "Users can view production requirements"
  ON tour_production_requirements FOR SELECT
  USING (
    tour_id IN (SELECT id FROM tours WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage production requirements" ON tour_production_requirements;
CREATE POLICY "Users can manage production requirements"
  ON tour_production_requirements FOR ALL
  USING (
    tour_id IN (SELECT id FROM tours WHERE user_id = auth.uid())
  )
  WITH CHECK (
    tour_id IN (SELECT id FROM tours WHERE user_id = auth.uid())
  );

-- Merchandise
ALTER TABLE tour_merchandise ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view tour merchandise" ON tour_merchandise;
CREATE POLICY "Users can view tour merchandise"
  ON tour_merchandise FOR SELECT
  USING (
    tour_id IN (SELECT id FROM tours WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage tour merchandise" ON tour_merchandise;
CREATE POLICY "Users can manage tour merchandise"
  ON tour_merchandise FOR ALL
  USING (
    tour_id IN (SELECT id FROM tours WHERE user_id = auth.uid())
  )
  WITH CHECK (
    tour_id IN (SELECT id FROM tours WHERE user_id = auth.uid())
  );

-- Merchandise Sales
ALTER TABLE tour_merchandise_sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view merchandise sales" ON tour_merchandise_sales;
CREATE POLICY "Users can view merchandise sales"
  ON tour_merchandise_sales FOR SELECT
  USING (
    tour_date_id IN (
      SELECT id FROM tour_dates WHERE tour_id IN (
        SELECT id FROM tours WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can manage merchandise sales" ON tour_merchandise_sales;
CREATE POLICY "Users can manage merchandise sales"
  ON tour_merchandise_sales FOR ALL
  USING (
    tour_date_id IN (
      SELECT id FROM tour_dates WHERE tour_id IN (
        SELECT id FROM tours WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    tour_date_id IN (
      SELECT id FROM tour_dates WHERE tour_id IN (
        SELECT id FROM tours WHERE user_id = auth.uid()
      )
    )
  );

-- =====================================================
-- GRANTS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON tour_technical_docs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tour_contacts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tour_day_sheets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tour_production_requirements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tour_merchandise TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tour_merchandise_sales TO authenticated;

-- Grant permissions to service_role
GRANT ALL ON tour_technical_docs TO service_role;
GRANT ALL ON tour_contacts TO service_role;
GRANT ALL ON tour_day_sheets TO service_role;
GRANT ALL ON tour_production_requirements TO service_role;
GRANT ALL ON tour_merchandise TO service_role;
GRANT ALL ON tour_merchandise_sales TO service_role;

-- Grant sequence usage
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;
