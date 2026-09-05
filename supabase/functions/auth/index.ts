const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface SupabaseAuthUser {
  id: string;
  email?: string | null;
}

interface SupabaseAuthSessionResponse {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  expires_in?: number;
  user: SupabaseAuthUser;
}

interface AuthSessionResponse {
  user: {
    id: string;
    email: string | null;
  };
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface SignInRequest {
  email: string;
  password: string;
}

interface RefreshSessionRequest {
  refreshToken: string;
}

const supabaseUrl = getRequiredEnvironmentVariable("SUPABASE_URL");
const supabaseAnonKey = getRequiredEnvironmentVariable("SUPABASE_ANON_KEY");

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      {
        message: "Method not allowed.",
      },
      405,
    );
  }

  const url = new URL(request.url);
  const route = getAuthRoute(url.pathname);

  try {
    switch (route) {
      case "login":
        return await handleLogin(request);

      case "refresh":
        return await handleRefresh(request);

      case "logout":
        return await handleLogout(request);

      default:
        return jsonResponse(
          {
            message: "Auth route not found.",
          },
          404,
        );
    }
  } catch (error) {
    console.error("Auth Edge Function error:", error);

    return jsonResponse(
      {
        message: "Unexpected authentication error.",
      },
      500,
    );
  }
});

async function handleLogin(request: Request): Promise<Response> {
  const body = (await request.json()) as SignInRequest;

  if (!body.email || !body.password) {
    return jsonResponse(
      {
        message: "Email and password are required.",
      },
      400,
    );
  }

  const response = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
    },
  );

  if (!response.ok) {
    return forwardAuthError(response);
  }

  const session = (await response.json()) as SupabaseAuthSessionResponse;

  return jsonResponse(mapAuthSession(session), 200);
}

async function handleRefresh(request: Request): Promise<Response> {
  const body = (await request.json()) as RefreshSessionRequest;

  if (!body.refreshToken) {
    return jsonResponse(
      {
        message: "Refresh token is required.",
      },
      400,
    );
  }

  const response = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=refresh_token`,
    {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: body.refreshToken,
      }),
    },
  );

  if (!response.ok) {
    return forwardAuthError(response);
  }

  const session = (await response.json()) as SupabaseAuthSessionResponse;

  return jsonResponse(mapAuthSession(session), 200);
}

async function handleLogout(request: Request): Promise<Response> {
  const authorization = request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return jsonResponse(
      {
        message: "Authorization token is required.",
      },
      401,
    );
  }

  const response = await fetch(
    `${supabaseUrl}/auth/v1/logout`,
    {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: authorization,
      },
    },
  );

  if (!response.ok) {
    return forwardAuthError(response);
  }

  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

function getAuthRoute(pathname: string): string | null {
  const segments = pathname
    .split("/")
    .filter(Boolean);

  const authIndex = segments.lastIndexOf("auth");

  if (authIndex === -1) {
    return null;
  }

  return segments[authIndex + 1] ?? null;
}

function mapAuthSession(
  session: SupabaseAuthSessionResponse,
): AuthSessionResponse {
  const expiresAt = session.expires_at ??
    Math.floor(Date.now() / 1000) +
      (session.expires_in ?? 3600);

  return {
    user: {
      id: session.user.id,
      email: session.user.email ?? null,
    },
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt,
  };
}

async function forwardAuthError(
  response: Response,
): Promise<Response> {
  let message = "Authentication request failed.";

  try {
    const errorBody = await response.json();

    if (
      typeof errorBody === "object" &&
      errorBody !== null
    ) {
      const candidate = "msg" in errorBody
        ? errorBody.msg
        : "message" in errorBody
        ? errorBody.message
        : "error_description" in errorBody
        ? errorBody.error_description
        : null;

      if (typeof candidate === "string") {
        message = candidate;
      }
    }
  } catch {
    // Keep the generic authentication error.
  }

  return jsonResponse(
    {
      message,
    },
    response.status,
  );
}

function jsonResponse(
  body: unknown,
  status: number,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function getRequiredEnvironmentVariable(name: string): string {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
