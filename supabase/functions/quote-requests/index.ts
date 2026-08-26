import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "@supabase/supabase-js/cors";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "GET" && req.method !== "PATCH") {
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
  const lastSegment = segments.at(-1);

  const quoteRequestId = lastSegment && lastSegment !== "quote-requests"
    ? lastSegment
    : null;

  if (req.method === "PATCH") {
    if (!quoteRequestId) {
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

    const body = await req.json();
    const status = body?.status;

    const allowedStatuses = [
      "pending",
      "contacted",
      "closed",
    ];

    if (!allowedStatuses.includes(status)) {
      return Response.json(
        {
          error: "Invalid quote request status",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const { error } = await supabase
      .from("quote_requests")
      .update({
        status,
      })
      .eq("id", quoteRequestId);

    if (error) {
      console.error("Unable to update quote request status:", error);

      return Response.json(
        {
          error: "Unable to update quote request status",
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
  }

  if (quoteRequestId) {
    const { data, error } = await supabase
      .from("quote_requests")
      .select("*")
      .eq("id", quoteRequestId)
      .single();

    if (error || !data) {
      console.error("Unable to load quote request:", error);

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

    const quoteRequest = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      eventType: data.event_type,
      eventDate: data.event_date,
      guestCount: data.guest_count,
      location: data.location,
      dietaryRequirements: data.dietary_requirements,
      additionalInformation: data.additional_information,
      privacyAccepted: data.privacy_accepted,
      attachmentPath: data.attachment_path,
      attachmentName: data.attachment_name,
      attachmentType: data.attachment_type,
      attachmentSize: data.attachment_size,
      status: data.status,
      createdAt: data.created_at,
    };

    return Response.json(quoteRequest, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const { data, error } = await supabase
    .from("quote_requests")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Unable to load quote requests:", error);

    return Response.json(
      {
        error: "Unable to load quote requests",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }

  const quoteRequests = (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    eventType: row.event_type,
    eventDate: row.event_date,
    guestCount: row.guest_count,
    location: row.location,
    dietaryRequirements: row.dietary_requirements,
    additionalInformation: row.additional_information,
    privacyAccepted: row.privacy_accepted,
    attachmentPath: row.attachment_path,
    attachmentName: row.attachment_name,
    attachmentType: row.attachment_type,
    attachmentSize: row.attachment_size,
    status: row.status,
    createdAt: row.created_at,
  }));

  return Response.json(quoteRequests, {
    status: 200,
    headers: corsHeaders,
  });
});
