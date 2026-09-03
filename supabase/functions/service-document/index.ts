import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "@supabase/supabase-js/cors";

const SERVICE_DOCUMENTS_BUCKET = "service-documents";
const SIGNED_URL_EXPIRATION_SECONDS = 60;

interface ServiceDocumentRow {
  id: string;
  storage_path: string;
  original_name: string;
  mime_type: string;
  size: number;
  created_at: string;
  updated_at: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get(
      "SUPABASE_ANON_KEY",
    );

    if (!supabaseUrl || !supabaseAnonKey) {
      return jsonResponse(
        {
          error: "Missing Supabase configuration",
        },
        500,
      );
    }

    const authorizationHeader = req.headers.get("Authorization");

    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: authorizationHeader
            ? {
              Authorization: authorizationHeader,
            }
            : {},
        },
      },
    );

    const url = new URL(req.url);

    if (
      req.method === "GET" &&
      url.pathname.endsWith("/download")
    ) {
      const storagePath = url.searchParams.get("path");

      if (!storagePath) {
        return jsonResponse(
          {
            error: "Missing document path",
          },
          400,
        );
      }

      const { data: currentDocument, error } = await supabase
        .from("service_documents")
        .select("storage_path")
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(
          "Unable to load service document:",
          error,
        );

        return jsonResponse(
          {
            error: "Unable to load service document",
          },
          500,
        );
      }

      if (
        !currentDocument ||
        currentDocument.storage_path !== storagePath
      ) {
        return jsonResponse(
          {
            error: "Service document not found",
          },
          404,
        );
      }

      const {
        data: signedUrlData,
        error: signedUrlError,
      } = await supabase.storage
        .from(SERVICE_DOCUMENTS_BUCKET)
        .createSignedUrl(
          storagePath,
          SIGNED_URL_EXPIRATION_SECONDS,
        );

      if (signedUrlError) {
        console.error(
          "Unable to create service document signed URL:",
          signedUrlError,
        );

        return jsonResponse(
          {
            error: "Unable to create signed URL",
          },
          500,
        );
      }

      if (!signedUrlData.signedUrl) {
        return jsonResponse(
          {
            error: "Signed URL was not generated",
          },
          500,
        );
      }

      return Response.json(signedUrlData.signedUrl, {
        headers: corsHeaders,
      });
    }

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("service_documents")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(
          "Unable to load service document:",
          error,
        );

        return jsonResponse(
          {
            error: "Unable to load service document",
          },
          500,
        );
      }

      if (!data) {
        return Response.json(null, {
          headers: corsHeaders,
        });
      }

      return Response.json(
        mapServiceDocumentRow(
          data as ServiceDocumentRow,
        ),
        {
          headers: corsHeaders,
        },
      );
    }

    if (req.method === "POST") {
      if (!authorizationHeader) {
        return jsonResponse(
          {
            error: "Authentication required",
          },
          401,
        );
      }

      const formData = await req.formData();
      const fileValue = formData.get("file");

      if (!(fileValue instanceof File)) {
        return jsonResponse(
          {
            error: "Missing PDF document",
          },
          400,
        );
      }

      if (fileValue.type !== "application/pdf") {
        return jsonResponse(
          {
            error: "Only PDF documents are allowed",
          },
          400,
        );
      }

      const { data: previousDocument, error: loadError } = await supabase
        .from("service_documents")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (loadError) {
        console.error(
          "Unable to load current service document:",
          loadError,
        );

        return jsonResponse(
          {
            error: "Unable to load current document",
          },
          500,
        );
      }

      const safeFileName = sanitizeFileName(
        fileValue.name,
      );

      const newStoragePath = `${crypto.randomUUID()}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(SERVICE_DOCUMENTS_BUCKET)
        .upload(newStoragePath, fileValue, {
          contentType: fileValue.type,
          upsert: false,
        });

      if (uploadError) {
        console.error(
          "Unable to upload service document:",
          uploadError,
        );

        return jsonResponse(
          {
            error: "Unable to upload service document",
          },
          500,
        );
      }

      const documentMetadata = {
        storage_path: newStoragePath,
        original_name: fileValue.name,
        mime_type: fileValue.type,
        size: fileValue.size,
        updated_at: new Date().toISOString(),
      };

      const databaseResult = previousDocument
        ? await supabase
          .from("service_documents")
          .update(documentMetadata)
          .eq("id", previousDocument.id)
          .select("*")
          .single()
        : await supabase
          .from("service_documents")
          .insert(documentMetadata)
          .select("*")
          .single();

      if (databaseResult.error) {
        console.error(
          "Unable to save service document metadata:",
          databaseResult.error,
        );

        const { error: cleanupError } = await supabase.storage
          .from(SERVICE_DOCUMENTS_BUCKET)
          .remove([newStoragePath]);

        if (cleanupError) {
          console.error(
            "Unable to clean up failed service document upload:",
            cleanupError,
          );
        }

        return jsonResponse(
          {
            error: "Unable to save service document metadata",
          },
          500,
        );
      }

      if (
        previousDocument &&
        previousDocument.storage_path !== newStoragePath
      ) {
        const { error: previousDeleteError } = await supabase.storage
          .from(SERVICE_DOCUMENTS_BUCKET)
          .remove([
            previousDocument.storage_path,
          ]);

        if (previousDeleteError) {
          console.error(
            "Unable to delete previous service document:",
            previousDeleteError,
          );
        }
      }

      return Response.json(
        mapServiceDocumentRow(
          databaseResult.data as ServiceDocumentRow,
        ),
        {
          headers: corsHeaders,
        },
      );
    }

    if (req.method === "DELETE") {
      if (!authorizationHeader) {
        return jsonResponse(
          {
            error: "Authentication required",
          },
          401,
        );
      }

      const pathParts = url.pathname
        .split("/")
        .filter(Boolean);

      const documentId = pathParts[pathParts.length - 1];

      if (
        !documentId ||
        documentId === "service-document"
      ) {
        return jsonResponse(
          {
            error: "Missing document id",
          },
          400,
        );
      }

      const { data: document, error: loadError } = await supabase
        .from("service_documents")
        .select("*")
        .eq("id", documentId)
        .maybeSingle();

      if (loadError) {
        console.error(
          "Unable to load service document:",
          loadError,
        );

        return jsonResponse(
          {
            error: "Unable to load service document",
          },
          500,
        );
      }

      if (!document) {
        return jsonResponse(
          {
            error: "Service document not found",
          },
          404,
        );
      }

      const { error: databaseError } = await supabase
        .from("service_documents")
        .delete()
        .eq("id", documentId);

      if (databaseError) {
        console.error(
          "Unable to delete service document metadata:",
          databaseError,
        );

        return jsonResponse(
          {
            error: "Unable to delete service document",
          },
          500,
        );
      }

      const { error: storageError } = await supabase.storage
        .from(SERVICE_DOCUMENTS_BUCKET)
        .remove([document.storage_path]);

      if (storageError) {
        console.error(
          "Unable to delete service document file:",
          storageError,
        );
      }

      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    return jsonResponse(
      {
        error: "Method not allowed",
      },
      405,
    );
  } catch (error) {
    console.error(
      "Unexpected service document error:",
      error,
    );

    return jsonResponse(
      {
        error: "Unexpected server error",
      },
      500,
    );
  }
});

function mapServiceDocumentRow(
  row: ServiceDocumentRow,
) {
  return {
    id: row.id,
    storagePath: row.storage_path,
    originalName: row.original_name,
    mimeType: row.mime_type,
    size: row.size,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function sanitizeFileName(
  fileName: string,
): string {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");
}

function jsonResponse(
  body: unknown,
  status: number,
): Response {
  return Response.json(body, {
    status,
    headers: corsHeaders,
  });
}
