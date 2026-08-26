import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "@supabase/supabase-js/cors";

const QUOTE_ATTACHMENTS_BUCKET = "quote-request-attachments";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "GET") {
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
  const pathname = decodeURIComponent(url.pathname);

  const functionPath = "/quote-request-attachments/";
  const functionPathIndex = pathname.indexOf(functionPath);

  const attachmentPath = functionPathIndex >= 0
    ? pathname.slice(functionPathIndex + functionPath.length)
    : "";

  if (!attachmentPath) {
    return Response.json(
      {
        error: "Attachment path is required",
      },
      {
        status: 400,
        headers: corsHeaders,
      },
    );
  }

  const { data, error } = await supabase.storage
    .from(QUOTE_ATTACHMENTS_BUCKET)
    .createSignedUrl(attachmentPath, 60);

  if (error || !data?.signedUrl) {
    console.error("Unable to create attachment signed URL:", error);

    return Response.json(
      {
        error: "Unable to create attachment signed URL",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }

  return Response.json(data.signedUrl, {
    status: 200,
    headers: corsHeaders,
  });
});
