import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "@supabase/supabase-js/cors";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  const { quoteRequestId } = await req.json();

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const gersonNotificationEmail = Deno.env.get("GERSON_NOTIFICATION_EMAIL");

  if (
    !supabaseUrl ||
    !supabaseServiceRoleKey ||
    !resendApiKey ||
    !gersonNotificationEmail
  ) {
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

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { data: quoteRequest, error } = await supabase
    .from("quote_requests")
    .select("*")
    .eq("id", quoteRequestId)
    .single();

  if (error) {
    console.error("Unable to load quote request:", error);

    return Response.json(
      {
        error: "Unable to load quote request",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Chef Gerson Canales <onboarding@resend.dev>",
      to: [gersonNotificationEmail],
      subject: `Nueva solicitud de presupuesto - ${quoteRequest.name}`,
      html: `
        <h1>Nueva solicitud de presupuesto</h1>

        <p><strong>Nombre:</strong> ${quoteRequest.name}</p>
        <p><strong>Email:</strong> ${quoteRequest.email}</p>
        <p><strong>Teléfono:</strong> ${quoteRequest.phone ?? "No indicado"}</p>
        <p><strong>Tipo de evento:</strong> ${quoteRequest.event_type}</p>
        <p><strong>Fecha:</strong> ${
        quoteRequest.event_date ?? "No indicada"
      }</p>
        <p><strong>Número de comensales:</strong> ${quoteRequest.guest_count}</p>
        <p><strong>Lugar:</strong> ${quoteRequest.location ?? "No indicado"}</p>
        <p><strong>Necesidades alimentarias:</strong> ${
        quoteRequest.dietary_requirements ?? "No indicadas"
      }</p>
        <p><strong>Información adicional:</strong> ${
        quoteRequest.additional_information ?? "No indicada"
      }</p>
      `,
    }),
  });

  if (!resendResponse.ok) {
    const resendError = await resendResponse.text();

    console.error("Unable to send notification email:", resendError);

    return Response.json(
      {
        error: "Unable to send notification email",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }

  return Response.json(
    {
      success: true,
    },
    {
      headers: corsHeaders,
    },
  );
});
