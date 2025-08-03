import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get slug from URL params
    const url = new URL(req.url);
    const slug = url.pathname.split("/").pop();

    if (!slug) {
      return new Response(JSON.stringify({ error: "Slug is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get request body for count
    const { count = 1 } = await req.json();

    // Get client IP address
    const clientIP =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Get post ID from slug
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .single();

    if (postError || !post) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if IP already has likes for this post
    const { data: existingLike, error: checkError } = await supabase
      .from("ip_post_likes")
      .select("count")
      .eq("ip_address", clientIP)
      .eq("post_id", post.id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      throw checkError;
    }

    let newCount: number;
    let totalLikes: number;

    if (existingLike) {
      // Update existing like count
      newCount = Math.min(existingLike.count + count, 5); // Max 5 likes per IP

      const { error: updateError } = await supabase
        .from("ip_post_likes")
        .update({ count: newCount, updated_at: new Date().toISOString() })
        .eq("ip_address", clientIP)
        .eq("post_id", post.id);

      if (updateError) {
        throw updateError;
      }
    } else {
      // Create new like record
      newCount = Math.min(count, 5); // Max 5 likes per IP

      const { error: insertError } = await supabase.from("ip_post_likes").insert({
        ip_address: clientIP,
        post_id: post.id,
        count: newCount,
      });

      if (insertError) {
        throw insertError;
      }
    }

    // Get total likes for this post (IP-based only)
    const { data: ipLikes, error: ipLikesError } = await supabase
      .from("ip_post_likes")
      .select("count")
      .eq("post_id", post.id);

    if (ipLikesError) {
      throw ipLikesError;
    }

    totalLikes = ipLikes.reduce((sum, like) => sum + like.count, 0);

    return new Response(
      JSON.stringify({
        data: {
          count: newCount,
          total_likes: totalLikes,
          ip_address: clientIP,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
