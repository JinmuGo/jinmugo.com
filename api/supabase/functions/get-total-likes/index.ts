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
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    // Get slug from URL
    const url = new URL(req.url);
    const slug = url.pathname.split("/").pop();

    if (!slug) {
      return new Response(JSON.stringify({ error: "Slug is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get post by slug
    const { data: post, error: postError } = await supabaseClient
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .single();

    if (postError) {
      if (postError.code === "PGRST116") {
        // Post doesn't exist, return 0 likes
        return new Response(
          JSON.stringify({
            success: true,
            data: { total: 0 },
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      return new Response(JSON.stringify({ error: `Failed to get post: ${postError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get IP-based likes for this post
    const { data: ipLikes, error: ipLikesError } = await supabaseClient
      .from("ip_post_likes")
      .select("count")
      .eq("post_id", post.id);

    if (ipLikesError) {
      return new Response(JSON.stringify({ error: ipLikesError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate total likes (IP-based only)
    const totalLikes = ipLikes.reduce((sum, like) => sum + like.count, 0);

    return new Response(
      JSON.stringify({
        success: true,
        data: { total: totalLikes },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
