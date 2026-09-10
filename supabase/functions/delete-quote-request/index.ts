import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "@supabase/supabase-js/cors";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "DELETE") {
    return Response.json(
      {
        error: "Method not allowed",
      },
      {
        status: 405,
        headers: corsHeaders,
      },
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    return Response.json(
      {
        error: "Missing environment configuration",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }

  const authorizationHeader = req.headers.get("Authorization");

  if (!authorizationHeader) {
    return Response.json(
      {
        error: "Missing authorization header",
      },
      {
        status: 401,
        headers: corsHeaders,
      },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authorizationHeader,
      },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
        headers: corsHeaders,
      },
    );
  }

  const url = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const quoteRequestId = segments.at(-1);

  if (!quoteRequestId || quoteRequestId === "delete-quote-request") {
    return Response.json(
      {
        error: "Quote request id is required",
      },
      {
        status: 400,
        headers: corsHeaders,
      },
    );
  }

  const { data: quoteRequest, error: loadError } = await supabase
    .from("quote_requests")
    .select("id, attachment_path")
    .eq("id", quoteRequestId)
    .single();

  if (loadError || !quoteRequest) {
    console.error("Unable to load quote request:", loadError);

    return Response.json(
      {
        error: "Quote request not found",
      },
      {
        status: 404,
        headers: corsHeaders,
      },
    );
  }

  if (quoteRequest.attachment_path) {
    const { error: attachmentError } = await supabase.storage
      .from("quote-request-attachments")
      .remove([quoteRequest.attachment_path]);

    if (attachmentError) {
      console.error("Unable to delete attachment:", attachmentError);

      return Response.json(
        {
          error: "Unable to delete attachment",
        },
        {
          status: 500,
          headers: corsHeaders,
        },
      );
    }
  }

  const { error: deleteError } = await supabase
    .from("quote_requests")
    .delete()
    .eq("id", quoteRequestId);

  if (deleteError) {
    console.error("Unable to delete quote request:", deleteError);

    return Response.json(
      {
        error: "Unable to delete quote request",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }

  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
});
