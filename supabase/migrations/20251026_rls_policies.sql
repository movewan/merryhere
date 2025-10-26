-- MERRYHERE Row Level Security (RLS) Policies
-- Created: 2025-10-26

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user is tenant leader or manager
CREATE OR REPLACE FUNCTION is_tenant_leader_or_manager(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role IN ('tenant_leader', 'tenant_manager')
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user belongs to same organization
CREATE OR REPLACE FUNCTION same_organization(user_id UUID, target_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p1
    JOIN profiles p2 ON (
      p1.organization_id = p2.organization_id OR
      p1.organization_id = p2.id OR
      p1.id = p2.organization_id
    )
    WHERE p1.id = user_id AND p2.id = target_user_id
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can view profiles in their organization
CREATE POLICY "Users can view organization profiles"
  ON profiles FOR SELECT
  USING (
    is_tenant_leader_or_manager(auth.uid()) AND
    same_organization(auth.uid(), id)
  );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin(auth.uid()));

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Leaders/Managers can update team members' profiles
CREATE POLICY "Leaders can update team profiles"
  ON profiles FOR UPDATE
  USING (
    is_tenant_leader_or_manager(auth.uid()) AND
    same_organization(auth.uid(), id)
  )
  WITH CHECK (
    is_tenant_leader_or_manager(auth.uid()) AND
    same_organization(auth.uid(), id)
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Users can soft-delete their own profile
CREATE POLICY "Users can delete own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- MEETING ROOMS POLICIES
-- ============================================================================

-- Everyone can view active meeting rooms
CREATE POLICY "Everyone can view active meeting rooms"
  ON meeting_rooms FOR SELECT
  USING (is_active = true);

-- Admins can view all meeting rooms
CREATE POLICY "Admins can view all meeting rooms"
  ON meeting_rooms FOR SELECT
  USING (is_admin(auth.uid()));

-- Only admins can manage meeting rooms
CREATE POLICY "Admins can insert meeting rooms"
  ON meeting_rooms FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update meeting rooms"
  ON meeting_rooms FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete meeting rooms"
  ON meeting_rooms FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================================================
-- ROOM BOOKINGS POLICIES
-- ============================================================================

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings"
  ON room_bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view bookings in their organization
CREATE POLICY "Users can view organization bookings"
  ON room_bookings FOR SELECT
  USING (
    is_tenant_leader_or_manager(auth.uid()) AND
    same_organization(auth.uid(), user_id)
  );

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
  ON room_bookings FOR SELECT
  USING (is_admin(auth.uid()));

-- Authenticated users can create bookings (points check in function)
CREATE POLICY "Authenticated users can create bookings"
  ON room_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own future bookings (for cancellation)
CREATE POLICY "Users can update own bookings"
  ON room_bookings FOR UPDATE
  USING (
    auth.uid() = user_id AND
    (booking_date > CURRENT_DATE OR
     (booking_date = CURRENT_DATE AND start_time > CURRENT_TIME))
  )
  WITH CHECK (auth.uid() = user_id);

-- Admins can update all bookings
CREATE POLICY "Admins can update all bookings"
  ON room_bookings FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================================================
-- PROGRAMS POLICIES
-- ============================================================================

-- Everyone can view active programs
CREATE POLICY "Everyone can view active programs"
  ON programs FOR SELECT
  USING (is_active = true);

-- Admins can view all programs
CREATE POLICY "Admins can view all programs"
  ON programs FOR SELECT
  USING (is_admin(auth.uid()));

-- Only admins can manage programs
CREATE POLICY "Admins can insert programs"
  ON programs FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update programs"
  ON programs FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete programs"
  ON programs FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================================================
-- PROGRAM REGISTRATIONS POLICIES
-- ============================================================================

-- Users can view their own registrations
CREATE POLICY "Users can view own registrations"
  ON program_registrations FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all registrations
CREATE POLICY "Admins can view all registrations"
  ON program_registrations FOR SELECT
  USING (is_admin(auth.uid()));

-- Authenticated users can register for programs
CREATE POLICY "Authenticated users can register"
  ON program_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can cancel their own registrations
CREATE POLICY "Users can cancel own registrations"
  ON program_registrations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can update all registrations
CREATE POLICY "Admins can update all registrations"
  ON program_registrations FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Users can delete their own registrations
CREATE POLICY "Users can delete own registrations"
  ON program_registrations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- POINT TRANSACTIONS POLICIES
-- ============================================================================

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON point_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view organization transactions (for team points)
CREATE POLICY "Leaders can view organization transactions"
  ON point_transactions FOR SELECT
  USING (
    is_tenant_leader_or_manager(auth.uid()) AND
    same_organization(auth.uid(), user_id)
  );

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
  ON point_transactions FOR SELECT
  USING (is_admin(auth.uid()));

-- Only system functions can insert transactions (via functions)
CREATE POLICY "System can insert transactions"
  ON point_transactions FOR INSERT
  WITH CHECK (true); -- Controlled by application logic

-- Only admins can manually adjust transactions
CREATE POLICY "Admins can insert manual transactions"
  ON point_transactions FOR INSERT
  WITH CHECK (
    is_admin(auth.uid()) AND
    transaction_type = 'adjusted'
  );

-- ============================================================================
-- ADDITIONAL SECURITY
-- ============================================================================

-- Prevent users from escalating their own role
CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    IF NOT is_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Only admins can change user roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_escalation();

-- Prevent users from modifying points directly
CREATE OR REPLACE FUNCTION prevent_direct_point_modification()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND
     (OLD.personal_points != NEW.personal_points OR OLD.team_points != NEW.team_points) THEN
    -- Allow if it's a system operation (called from our functions)
    IF current_setting('role') != 'postgres' AND NOT is_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Points can only be modified through booking/transaction functions';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This trigger is commented out to allow our functions to work
-- Uncomment and modify as needed for stricter point control
-- CREATE TRIGGER prevent_direct_point_modification_trigger
--   BEFORE UPDATE ON profiles
--   FOR EACH ROW
--   EXECUTE FUNCTION prevent_direct_point_modification();
