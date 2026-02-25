-- Create the trigger function to call the edge function
CREATE OR REPLACE FUNCTION public.handle_friendship_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_body json;
  response_status int;
  webhook_url text;
BEGIN
  -- Get the webhook URL (this uses the same project ID as other functions)
  -- The url format is typically https://<project-ref>.supabase.co/functions/v1/friendship-notification
  -- Since we're inside Supabase, we can use the local Edge Function URL if pg_net is available.
  
  webhook_url := current_setting('custom.edge_function_base_url', true) || '/friendship-notification';
  
  -- Fallback if custom setting is not set (you might need to replace this locally or rely on Supabase's default routing)
  IF webhook_url IS NULL OR webhook_url = '/friendship-notification' THEN
    -- Get project URL from the environment (hack for Supabase cloud)
    webhook_url := 'https://dfumitashsrvqpprkamg.supabase.co/functions/v1/friendship-notification';
  END IF;

  -- Build the JSON payload similar to standard Supabase Webhooks
  request_body := json_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', row_to_json(NEW),
    'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE null END
  );

  -- Perform the HTTP POST request using pg_net extension
  -- Make sure pg_net is enabled in your Supabase project (Extensions -> pg_net)
  PERFORM net.http_post(
    url := webhook_url,
    body := request_body::jsonb,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('custom.service_role_key', true) -- Using a custom setting if available, else you pass anon key or service role
    )
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't prevent the friendship insert/update from succeeding
    RAISE WARNING 'Failed to trigger friendship notification webhook: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the triggers on the friendships table
-- 1. Trigger for new friend requests
DROP TRIGGER IF EXISTS on_friendship_request_created ON public.friendships;
CREATE TRIGGER on_friendship_request_created
  AFTER INSERT
  ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_friendship_notification();

-- 2. Trigger for accepted friend requests
DROP TRIGGER IF EXISTS on_friendship_request_accepted ON public.friendships;
CREATE TRIGGER on_friendship_request_accepted
  AFTER UPDATE OF status
  ON public.friendships
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status = 'accepted')
  EXECUTE FUNCTION public.handle_friendship_notification();
