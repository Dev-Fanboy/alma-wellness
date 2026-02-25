// Setup:
// 1. Run: supabase functions deploy friendship-notification
// 2. Set secrets: supabase secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...
// 3. Create Database Webhook on "friendships" table (INSERT, UPDATE) -> trigger this function

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Friendship Notification Function Initialized");

serve(async (req) => {
  try {
    const payload = await req.json();

    // Must have a record (webhook payload)
    if (!payload.record) {
      return new Response("No record found", { status: 400 });
    }

    const { type, record, old_record } = payload;

    // We care about INSERT (new friend request)
    // and UPDATE (status changed to 'accepted')

    let targetUserId = "";
    let senderUserId = "";
    let notificationType = "";

    if (type === "INSERT") {
      // New friend request (user_id -> friend_id)
      targetUserId = record.friend_id;
      senderUserId = record.user_id;
      notificationType = "request";
    } else if (type === "UPDATE") {
      // Check if status changed to accepted
      const wasPending = old_record && old_record.status === "pending";
      const isAccepted = record.status === "accepted";

      if (wasPending && isAccepted) {
        // The person who ACCEPTED is the one updating the row.
        // Usually, the person who accepts is 'friend_id' in the DB row.
        // We want to notify 'user_id' (the original sender).
        // Let's notify BOTH or just the original sender. 
        // In profile.ts line 333: otherUserId = data.user_id === user.id ? data.friend_id : data.user_id;
        // Wait, in a webhook we don't know who triggered the update directly from auth.uid() naturally (unless we inspect payload.record).
        // But generally, the person who's status was 'pending' and is now 'accepted' means the 'friend_id' accepted it.
        // So the notification goes to 'user_id'.
        targetUserId = record.user_id;
        senderUserId = record.friend_id;
        notificationType = "accepted";
      } else {
        return new Response("Not a status update to accepted", { status: 200 });
      }
    } else {
      return new Response("Unsupported event type", { status: 200 });
    }

    if (!targetUserId || !senderUserId) {
      return new Response("Missing target or sender ID", { status: 400 });
    }

    console.log(`Processing friendship notification: type=${notificationType} target=${targetUserId}`);

    // Create Supabase Admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Get the target user's Push Tokens
    const { data: tokens, error: tokenError } = await supabaseAdmin
      .from("push_tokens")
      .select("token")
      .eq("user_id", targetUserId);

    if (tokenError) {
      console.error("Error fetching tokens:", tokenError);
      return new Response("Error fetching tokens", { status: 500 });
    }

    if (!tokens || tokens.length === 0) {
      console.log("No push tokens found for user");
      return new Response("No tokens found", { status: 200 });
    }

    // 2. Get Sender Name
    let senderName = "A friend";
    const { data: sender } = await supabaseAdmin
      .from("profiles")
      .select("name")
      .eq("id", senderUserId)
      .single();

    if (sender && sender.name) {
      senderName = sender.name;
    }

    // 3. Build notification
    let title = "";
    let body = "";

    if (notificationType === "request") {
      title = "New Friend Request";
      body = `${senderName} wants to join your garden! 🌱`;
    } else if (notificationType === "accepted") {
      title = "Friend Request Accepted!";
      body = `${senderName} joined your garden! 🌻`;
    }

    // 4. Prepare Expo Push Notifications
    const messages = tokens.map((t) => ({
      to: t.token,
      sound: "default",
      title,
      body,
      data: { url: "alma://garden" },
    }));

    // 5. Send to Expo
    const expoResponse = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const expoResult = await expoResponse.json();
    console.log("Expo Result:", expoResult);

    return new Response(JSON.stringify(expoResult), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
