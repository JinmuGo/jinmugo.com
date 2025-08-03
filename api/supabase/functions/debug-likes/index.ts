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

    // Get client IP address
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Get post ID from slug
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .single();

    if (postError) {
      return new Response(
        JSON.stringify({
          error: "Post not found",
          debug: { postError: postError.message, slug },
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get all IP likes for this post
    const { data: allIpLikes, error: allIpLikesError } = await supabase
      .from("ip_post_likes")
      .select("*")
      .eq("post_id", post.id);

    if (allIpLikesError) {
      return new Response(
        JSON.stringify({
          error: "Failed to get IP likes",
          debug: { allIpLikesError: allIpLikesError.message },
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get current IP's likes for this post
    const { data: myIpLike } = await supabase
      .from("ip_post_likes")
      .select("*")
      .eq("post_id", post.id)
      .eq("ip_address", clientIp)
      .single();

    const myCount = myIpLike?.count || 0;
    const totalLikes = allIpLikes.reduce((sum, like) => sum + like.count, 0);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          post,
          myCount,
          totalLikes,
          allIpLikes,
          clientIP: clientIp,
          debug: {
            postFound: !!post,
            myIpLikeFound: !!myIpLike,
            totalIpLikes: allIpLikes.length,
          },
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});
