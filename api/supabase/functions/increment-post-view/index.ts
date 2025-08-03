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

    // Get post by slug (create if not exists)
    let { data: post, error: postError } = await supabaseClient
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .single();

    if (postError && postError.code === "PGRST116") {
      // Post doesn't exist, create it
      const { data: newPost, error: createError } = await supabaseClient
        .from("posts")
        .insert({ slug })
        .select("id")
        .single();

      if (createError) {
        return new Response(
          JSON.stringify({ error: `Failed to create post: ${createError.message}` }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      post = newPost;
    } else if (postError) {
      return new Response(JSON.stringify({ error: `Failed to get post: ${postError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get client IP address
    const clientIP =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Insert view record
    const { data: view, error: viewError } = await supabaseClient
      .from("post_views")
      .insert({
        post_id: post.id,
        ip_address: clientIP,
      })
      .select()
      .single();

    if (viewError) {
      return new Response(JSON.stringify({ error: viewError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: view,
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
