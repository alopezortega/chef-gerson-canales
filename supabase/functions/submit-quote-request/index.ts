import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "@supabase/supabase-js/cors";

const QUOTE_ATTACHMENTS_BUCKET = "quote-request-attachments";

const allowedAttachmentTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

const maximumAttachmentSize = 10 * 1024 * 1024;

interface QuoteRequestPayload {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  location: string;
  dietaryRequirements: string;
  additionalInformation: string;
  privacyAccepted: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
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

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      return Response.json(
        {
          error: "Missing Supabase configuration",
        },
        {
          status: 500,
          headers: corsHeaders,
        },
      );
    }

    const authorizationHeader = req.headers.get("Authorization");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: authorizationHeader
          ? {
            Authorization: authorizationHeader,
          }
          : {},
      },
    });

    const formData = await req.formData();

    const requestValue = formData.get("request");
    const attachmentValue = formData.get("attachment");

    if (typeof requestValue !== "string") {
      return Response.json(
        {
          error: "Missing quote request payload",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    let quoteRequest: QuoteRequestPayload;

    try {
      quoteRequest = JSON.parse(requestValue) as QuoteRequestPayload;
    } catch {
      return Response.json(
        {
          error: "Invalid quote request payload",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const attachment = attachmentValue instanceof File ? attachmentValue : null;

    if (
      attachment &&
      !allowedAttachmentTypes.has(attachment.type)
    ) {
      return Response.json(
        {
          error: "Invalid attachment type",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    if (
      attachment &&
      attachment.size > maximumAttachmentSize
    ) {
      return Response.json(
        {
          error: "Attachment exceeds maximum size",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const quoteRequestId = crypto.randomUUID();

    let attachmentPath: string | null = null;

    if (attachment) {
      const safeFileName = sanitizeFileName(attachment.name);

      attachmentPath = `${crypto.randomUUID()}/${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(QUOTE_ATTACHMENTS_BUCKET)
        .upload(attachmentPath, attachment, {
          contentType: attachment.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Unable to upload attachment:", uploadError);

        return Response.json(
          {
            error: "Unable to upload attachment",
          },
          {
            status: 500,
            headers: corsHeaders,
          },
        );
      }
    }

    const { error: insertError } = await supabase
      .from("quote_requests")
      .insert({
        id: quoteRequestId,
        name: quoteRequest.name,
        email: quoteRequest.email,
        phone: quoteRequest.phone || null,
        event_type: quoteRequest.eventType,
        event_date: quoteRequest.eventDate || null,
        guest_count: quoteRequest.guestCount,
        location: quoteRequest.location || null,
        dietary_requirements: quoteRequest.dietaryRequirements || null,
        additional_information: quoteRequest.additionalInformation || null,
        privacy_accepted: quoteRequest.privacyAccepted,
        attachment_path: attachmentPath,
        attachment_name: attachment?.name ?? null,
        attachment_type: attachment?.type ?? null,
        attachment_size: attachment?.size ?? null,
      });

    if (insertError) {
      console.error(
        "Unable to create quote request:",
        insertError,
      );

      if (attachmentPath) {
        const { error: cleanupError } = await supabase.storage
          .from(QUOTE_ATTACHMENTS_BUCKET)
          .remove([attachmentPath]);

        if (cleanupError) {
          console.error(
            "Unable to clean up uploaded attachment:",
            cleanupError,
          );
        }
      }

      return Response.json(
        {
          error: "Unable to create quote request",
        },
        {
          status: 500,
          headers: corsHeaders,
        },
      );
    }

    const { error: notificationError } = await supabase.functions.invoke(
      "notify-quote-request",
      {
        body: {
          quoteRequestId,
        },
      },
    );

    if (notificationError) {
      console.error(
        "Unable to send quote request notification:",
        notificationError,
      );
    }

    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Unexpected quote request error:", error);

    return Response.json(
      {
        error: "Unexpected server error",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});

function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .toLowerCase();
}
