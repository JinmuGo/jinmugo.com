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

    // Get query parameters
    const url = new URL(req.url);
    const type = url.searchParams.get("type"); // 'post', 'memo', or null for all
    const category = url.searchParams.get("category");
    const tag = url.searchParams.get("tag");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const includeContent = url.searchParams.get("includeContent") === "true";

    // Build query
    let query = supabase
      .from("posts")
      .select(
        includeContent
          ? "*"
          : "id, slug, title, date, draft, tags, lastmod, category, summary, type, created_at, updated_at",
      )
      .order("date", { ascending: false });

    // Apply filters
    if (type) {
      query = query.eq("type", type);
    }
    if (category) {
      query = query.eq("category", category);
    }
    if (tag) {
      query = query.contains("tags", [tag]);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: posts, error } = await query;

    if (error) {
      return new Response(
        JSON.stringify({
          error: "Failed to fetch posts",
          details: error.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: posts,
        pagination: {
          limit,
          offset,
          hasMore: posts.length === limit,
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
