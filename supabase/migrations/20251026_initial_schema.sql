-- MERRYHERE Database Schema
-- Created: 2025-10-26

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'tenant_leader', 'tenant_manager', 'tenant_member', 'general');
CREATE TYPE office_type AS ENUM ('independent', 'fixed_desk', 'non_resident');
CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled');
CREATE TYPE transaction_type AS ENUM ('earned', 'spent', 'refunded', 'adjusted');

-- ============================================================================
-- PROFILES TABLE
-- Extended user information beyond Supabase Auth
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Information
  full_name TEXT NOT NULL,
  phone TEXT,
  birth_date DATE,
  sns_url TEXT,
  profile_image_url TEXT,

  -- Role & Permissions
  role user_role NOT NULL DEFAULT 'general',

  -- Office Information
  office_type office_type,
  office_number TEXT, -- e.g., "401호", "S701", "v123"

  -- Organization/Team
  organization_id UUID REFERENCES profiles(id), -- Leader's ID for team members
  is_leader BOOLEAN DEFAULT FALSE,
  is_manager BOOLEAN DEFAULT FALSE,

  -- Points
  personal_points INTEGER DEFAULT 0,
  team_points INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete for account deactivation

  CONSTRAINT valid_phone CHECK (phone ~ '^\d{10,11}$' OR phone IS NULL),
  CONSTRAINT non_negative_points CHECK (personal_points >= 0 AND team_points >= 0)
);

-- ============================================================================
-- MEETING ROOMS TABLE
-- Information about available meeting rooms
-- ============================================================================
CREATE TABLE meeting_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Room Information
  name TEXT NOT NULL UNIQUE,
  floor INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  description TEXT,
  amenities TEXT[], -- e.g., ['projector', 'whiteboard', 'video_conference']
  image_url TEXT,

  -- Booking Configuration
  points_per_30min INTEGER NOT NULL DEFAULT 10,
  min_booking_duration INTEGER DEFAULT 30, -- minutes
  max_booking_duration INTEGER DEFAULT 240, -- minutes

  -- Availability
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT positive_capacity CHECK (capacity > 0),
  CONSTRAINT positive_points CHECK (points_per_30min >= 0)
);

-- ============================================================================
-- ROOM BOOKINGS TABLE
-- Meeting room reservations
-- ============================================================================
CREATE TABLE room_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Booking Details
  room_id UUID NOT NULL REFERENCES meeting_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Time Information
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  -- Meeting Information
  meeting_title TEXT NOT NULL,
  meeting_description TEXT,

  -- Points & Status
  points_used INTEGER NOT NULL,
  status booking_status DEFAULT 'confirmed',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,

  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT future_booking CHECK (booking_date >= CURRENT_DATE),
  CONSTRAINT max_advance_booking CHECK (booking_date <= CURRENT_DATE + INTERVAL '4 weeks'),
  CONSTRAINT positive_points_used CHECK (points_used >= 0)
);

-- Index for efficient booking queries
CREATE INDEX idx_room_bookings_date_time ON room_bookings(room_id, booking_date, start_time, end_time);
CREATE INDEX idx_room_bookings_user ON room_bookings(user_id, booking_date);
CREATE INDEX idx_room_bookings_status ON room_bookings(status);

-- ============================================================================
-- PROGRAMS TABLE
-- Events and programs offered to members
-- ============================================================================
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Program Information
  title TEXT NOT NULL,
  description TEXT,
  detailed_content TEXT,

  -- Schedule
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,

  -- Capacity
  max_participants INTEGER NOT NULL,
  current_participants INTEGER DEFAULT 0,

  -- Media
  thumbnail_url TEXT,
  images TEXT[],

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  registration_deadline TIMESTAMPTZ,

  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_datetime_range CHECK (end_datetime > start_datetime),
  CONSTRAINT valid_capacity CHECK (max_participants > 0),
  CONSTRAINT valid_participant_count CHECK (current_participants >= 0 AND current_participants <= max_participants)
);

-- ============================================================================
-- PROGRAM REGISTRATIONS TABLE
-- User registrations for programs
-- ============================================================================
CREATE TABLE program_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Registration Details
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Status
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled', 'no_show')),

  -- Metadata
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,

  UNIQUE(program_id, user_id)
);

-- Index for efficient registration queries
CREATE INDEX idx_program_registrations_program ON program_registrations(program_id);
CREATE INDEX idx_program_registrations_user ON program_registrations(user_id);

-- ============================================================================
-- POINT TRANSACTIONS TABLE
-- Detailed history of all point changes
-- ============================================================================
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Transaction Details
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_type transaction_type NOT NULL,

  -- Points
  amount INTEGER NOT NULL,
  is_team_points BOOLEAN DEFAULT FALSE,

  -- Balance After Transaction
  balance_after INTEGER NOT NULL,

  -- Reference
  reference_type TEXT, -- e.g., 'room_booking', 'program', 'admin_adjustment'
  reference_id UUID, -- ID of the related booking, program, etc.
  description TEXT,

  -- Metadata
  created_by UUID REFERENCES profiles(id), -- Admin who made adjustment, if applicable
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT non_zero_amount CHECK (amount != 0)
);

-- Index for efficient transaction queries
CREATE INDEX idx_point_transactions_user ON point_transactions(user_id, created_at DESC);
CREATE INDEX idx_point_transactions_type ON point_transactions(transaction_type);
CREATE INDEX idx_point_transactions_reference ON point_transactions(reference_type, reference_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_rooms_updated_at BEFORE UPDATE ON meeting_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_bookings_updated_at BEFORE UPDATE ON room_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    'general'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function: Update program participant count
CREATE OR REPLACE FUNCTION update_program_participants()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'registered' THEN
    UPDATE programs
    SET current_participants = current_participants + 1
    WHERE id = NEW.program_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'registered' AND NEW.status != 'registered' THEN
    UPDATE programs
    SET current_participants = current_participants - 1
    WHERE id = NEW.program_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'registered' THEN
    UPDATE programs
    SET current_participants = current_participants - 1
    WHERE id = OLD.program_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update program participants on registration changes
CREATE TRIGGER update_program_participants_trigger
  AFTER INSERT OR UPDATE OR DELETE ON program_registrations
  FOR EACH ROW EXECUTE FUNCTION update_program_participants();

-- Function: Process room booking with points
CREATE OR REPLACE FUNCTION process_room_booking(
  p_room_id UUID,
  p_user_id UUID,
  p_booking_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_meeting_title TEXT,
  p_points_used INTEGER,
  p_use_team_points BOOLEAN DEFAULT FALSE
)
RETURNS UUID AS $$
DECLARE
  v_booking_id UUID;
  v_current_points INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Check if user has enough points
  IF p_use_team_points THEN
    SELECT team_points INTO v_current_points FROM profiles WHERE id = p_user_id;
  ELSE
    SELECT personal_points INTO v_current_points FROM profiles WHERE id = p_user_id;
  END IF;

  IF v_current_points < p_points_used THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;

  -- Create booking
  INSERT INTO room_bookings (room_id, user_id, booking_date, start_time, end_time, meeting_title, points_used)
  VALUES (p_room_id, p_user_id, p_booking_date, p_start_time, p_end_time, p_meeting_title, p_points_used)
  RETURNING id INTO v_booking_id;

  -- Deduct points
  IF p_use_team_points THEN
    UPDATE profiles SET team_points = team_points - p_points_used WHERE id = p_user_id;
    v_new_balance := v_current_points - p_points_used;
  ELSE
    UPDATE profiles SET personal_points = personal_points - p_points_used WHERE id = p_user_id;
    v_new_balance := v_current_points - p_points_used;
  END IF;

  -- Record transaction
  INSERT INTO point_transactions (user_id, transaction_type, amount, is_team_points, balance_after, reference_type, reference_id, description)
  VALUES (p_user_id, 'spent', -p_points_used, p_use_team_points, v_new_balance, 'room_booking', v_booking_id, 'Meeting room booking: ' || p_meeting_title);

  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Cancel room booking and refund points
CREATE OR REPLACE FUNCTION cancel_room_booking(p_booking_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_booking RECORD;
  v_refund_amount INTEGER;
  v_is_team_points BOOLEAN;
  v_new_balance INTEGER;
BEGIN
  -- Get booking details
  SELECT * INTO v_booking FROM room_bookings
  WHERE id = p_booking_id AND user_id = p_user_id AND status = 'confirmed';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or already cancelled';
  END IF;

  -- Check if booking is in the future (can only cancel future bookings)
  IF v_booking.booking_date < CURRENT_DATE OR
     (v_booking.booking_date = CURRENT_DATE AND v_booking.start_time <= CURRENT_TIME) THEN
    RAISE EXCEPTION 'Cannot cancel past or ongoing bookings';
  END IF;

  -- Determine if team points were used (simplified logic - you may need to enhance this)
  SELECT is_team_points INTO v_is_team_points
  FROM point_transactions
  WHERE reference_type = 'room_booking' AND reference_id = p_booking_id AND transaction_type = 'spent'
  LIMIT 1;

  v_refund_amount := v_booking.points_used;

  -- Update booking status
  UPDATE room_bookings
  SET status = 'cancelled', cancelled_at = NOW()
  WHERE id = p_booking_id;

  -- Refund points
  IF v_is_team_points THEN
    UPDATE profiles SET team_points = team_points + v_refund_amount WHERE id = p_user_id
    RETURNING team_points INTO v_new_balance;
  ELSE
    UPDATE profiles SET personal_points = personal_points + v_refund_amount WHERE id = p_user_id
    RETURNING personal_points INTO v_new_balance;
  END IF;

  -- Record refund transaction
  INSERT INTO point_transactions (user_id, transaction_type, amount, is_team_points, balance_after, reference_type, reference_id, description)
  VALUES (p_user_id, 'refunded', v_refund_amount, v_is_team_points, v_new_balance, 'room_booking', p_booking_id, 'Refund for cancelled booking');

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DATA
-- Initial meeting rooms data
-- ============================================================================

INSERT INTO meeting_rooms (name, floor, capacity, points_per_30min, description) VALUES
  ('미팅룸 A', 4, 6, 10, '4층 소형 회의실'),
  ('미팅룸 B', 5, 8, 15, '5층 중형 회의실'),
  ('미팅룸 C', 6, 10, 20, '6층 대형 회의실'),
  ('메리홀', 7, 30, 50, '7층 대형 이벤트 홀');
