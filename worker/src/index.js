const ALLOWED_ORIGINS = new Set([
  "https://hujinjin0817-cmyk.github.io",
]);

const ALLOWED_TARGET_HOSTS = new Set([
  "gwmcp.lkcoffee.com",
  "mcp.mcd.cn",
]);

const ALLOWED_METHODS = "GET, POST, DELETE, OPTIONS";
const DEFAULT_ALLOWED_HEADERS = [
  "Authorization",
  "Content-Type",
  "Accept",
  "MCP-Protocol-Version",
  "MCP-Session-Id",
  "Mcp-Session-Id",
  "Last-Event-ID",
].join(", ");
const EXPOSED_HEADERS = [
  "MCP-Session-Id",
  "Mcp-Session-Id",
  "Content-Type",
  "Cache-Control",
].join(", ");

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin)
    ? origin
    : "https://hujinjin0817-cmyk.github.io";
  const requestedHeaders = request.headers.get("Access-Control-Request-Headers");
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": ALLOWED_METHODS,
    "Access-Control-Allow-Headers": requestedHeaders || DEFAULT_ALLOWED_HEADERS,
    "Access-Control-Expose-Headers": EXPOSED_HEADERS,
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin, Access-Control-Request-Headers",
  };
}

function withCors(request, body, init = {}) {
  const headers = new Headers(init.headers || {});
  for (const [key, value] of Object.entries(corsHeaders(request))) {
    headers.set(key, value);
  }
  return new Response(body, { ...init, headers });
}

function targetFromRequest(request) {
  const requestUrl = new URL(request.url);
  const raw = requestUrl.searchParams.get("u") || requestUrl.searchParams.get("url");
  if (!raw) return null;

  let target;
  try {
    target = new URL(raw);
  } catch (_) {
    throw new Response("Invalid target URL", { status: 400 });
  }

  if (target.protocol !== "https:") {
    throw new Response("Only https targets are allowed", { status: 403 });
  }
  if (!ALLOWED_TARGET_HOSTS.has(target.hostname)) {
    throw new Response("Target host is not allowed", { status: 403 });
  }
  return target;
}

function filteredRequestHeaders(request) {
  const out = new Headers();
  const pass = new Set([
    "authorization",
    "content-type",
    "accept",
    "mcp-protocol-version",
    "mcp-session-id",
    "last-event-id",
  ]);
  for (const [key, value] of request.headers) {
    if (pass.has(key.toLowerCase())) out.set(key, value);
  }
  return out;
}

function filteredResponseHeaders(response, request) {
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("transfer-encoding");
  for (const [key, value] of Object.entries(corsHeaders(request))) {
    headers.set(key, value);
  }
  return headers;
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return withCors(request, null, { status: 204 });
    }

    let target;
    try {
      target = targetFromRequest(request);
    } catch (response) {
      return withCors(request, response.body, {
        status: response.status,
        headers: response.headers,
      });
    }

    if (!target) {
      if (request.method === "GET") {
        return withCors(request, "MCP Proxy is running", {
          status: 200,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
      return withCors(request, "Missing target URL. Use ?u=", { status: 400 });
    }

    if (!["GET", "POST", "DELETE"].includes(request.method)) {
      return withCors(request, "Method not allowed", { status: 405 });
    }

    const upstream = await fetch(target.toString(), {
      method: request.method,
      headers: filteredRequestHeaders(request),
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
      duplex: "half",
      redirect: "manual",
    });

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: filteredResponseHeaders(upstream, request),
    });
  },
};
