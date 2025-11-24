-- Fix prevent_role_escalation trigger to allow Service Role Key updates
-- This allows admin role assignment via Service Role Key (bypassing RLS)

CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    -- Allow Service role (auth.uid() is null) or admin users to change roles
    IF auth.uid() IS NOT NULL AND NOT is_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Only admins can change user roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
