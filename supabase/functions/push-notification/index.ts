// Setup:
// 1. Run: supabase functions deploy push-notification
// 2. Set secrets: supabase secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...
// 3. Create Database Webhook on "nudges" table (INSERT) -> trigger this function

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Push Notification Function Initialized");

serve(async (req) => {
    try {
        const { record } = await req.json();

        // Only process if we have a record (webhook payload)
        if (!record || !record.to_user_id) {
            return new Response("No record found", { status: 400 });
        }

        console.log(`Processing nudge for user: ${record.to_user_id}, type: ${record.type || 'rain'}`);

        // Create Supabase client (Admin context — bypasses RLS)
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // 1. Get the recipient's Push Token
        const { data: tokens, error: tokenError } = await supabaseAdmin
            .from("push_tokens")
            .select("token")
            .eq("user_id", record.to_user_id);

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
        if (record.from_user_id) {
            const { data: sender } = await supabaseAdmin
                .from("profiles")
                .select("name")
                .eq("id", record.from_user_id)
                .single();

            if (sender) senderName = sender.name;
        }

        // 3. Build notification based on nudge type
        const nudgeType = record.type || "rain";
        let title: string;
        let body: string;

        if (nudgeType === "cheer") {
            title = "New Cheer! 🔥";
            body = `${senderName} cheered you on for your streak!`;
        } else {
            title = "Taking care of the garden 🌧️";
            body = `${senderName} sent you some rain!`;
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
