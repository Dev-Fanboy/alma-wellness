-- Migration to add a function allowing users to delete their own account

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete the user from auth.users (cascades to public tables if foreign keys are set up correctly)
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
