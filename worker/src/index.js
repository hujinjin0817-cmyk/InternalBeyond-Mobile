const ALLOWED_ORIGINS = new Set([
  "https://hujinjin0817-cmyk.github.io",
]);

const ALLOWED_TARGET_HOSTS = new Set([
  "gwmcp.lkcoffee.com",
  "mcp.mcd.cn",
]);

const NETEASE_API = "https://music.163.com";

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
const SYNC_ALLOWED_STORES = new Set([
  "about",
  "apiConfigs",
  "chatMessages",
  "chatThreads",
  "chatSummaries",
  "groups",
  "uploadedFiles",
  "memories",
  "autoMemory",
  "apiSettings",
  "calEvents",
  "calNotes",
  "calLedger",
  "posts",
  "categories",
  "letters",
  "blogComments",
  "blogAnnotations",
  "projects",
  "projectFiles",
  "feed",
]);

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

function jsonCors(request, body, init = {}) {
  return withCors(request, JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(init.headers || {}),
    },
  });
}

function syncDb(env) {
  return env && (env.SYNC_DB || env.DB || env.IB_SYNC_DB);
}

async function ensureSyncSchema(db) {
  await db.batch([
    db.prepare(
      "CREATE TABLE IF NOT EXISTS sync_meta (sync_id TEXT PRIMARY KEY, revision INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL)"
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS sync_items (sync_id TEXT NOT NULL, store_name TEXT NOT NULL, item_id TEXT NOT NULL, updated_at INTEGER NOT NULL, deleted INTEGER NOT NULL DEFAULT 0, nonce TEXT, payload TEXT, changed_rev INTEGER NOT NULL, PRIMARY KEY (sync_id, store_name, item_id))"
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS idx_sync_items_rev ON sync_items(sync_id, changed_rev)"
    ),
  ]);
}

function validSyncId(id) {
  return typeof id === "string" && /^[A-Za-z0-9_-]{16,96}$/.test(id);
}

function validSyncItem(item) {
  return (
    item &&
    SYNC_ALLOWED_STORES.has(item.store) &&
    typeof item.id === "string" &&
    item.id.length > 0 &&
    item.id.length <= 512 &&
    Number.isFinite(Number(item.updatedAt)) &&
    (item.deleted === true ||
      (typeof item.nonce === "string" &&
        typeof item.payload === "string" &&
        item.nonce.length <= 256 &&
        item.payload.length <= 2_500_000))
  );
}

async function syncRevision(db, syncId) {
  const row = await db
    .prepare("SELECT revision FROM sync_meta WHERE sync_id = ?")
    .bind(syncId)
    .first();
  if (row) return Number(row.revision || 0);
  await db
    .prepare("INSERT INTO sync_meta(sync_id, revision, updated_at) VALUES(?, 0, ?)")
    .bind(syncId, Date.now())
    .run();
  return 0;
}

async function syncItems(db, syncId) {
  const { results } = await db
    .prepare(
      "SELECT store_name, item_id, updated_at, deleted, nonce, payload, changed_rev FROM sync_items WHERE sync_id = ? ORDER BY changed_rev ASC"
    )
    .bind(syncId)
    .all();
  return (results || []).map((row) => ({
    store: row.store_name,
    id: row.item_id,
    updatedAt: Number(row.updated_at || 0),
    deleted: !!row.deleted,
    nonce: row.nonce || "",
    payload: row.payload || "",
    revision: Number(row.changed_rev || 0),
  }));
}

async function handleSync(request, env) {
  const db = syncDb(env);
  if (!db) return jsonCors(request, { ok: false, error: "SYNC_DB binding is not configured" }, { status: 503 });
  await ensureSyncSchema(db);
  const url = new URL(request.url);

  if (request.method === "GET") {
    const syncId = url.searchParams.get("syncId") || "";
    if (!validSyncId(syncId)) return jsonCors(request, { ok: false, error: "Invalid syncId" }, { status: 400 });
    const revision = await syncRevision(db, syncId);
    return jsonCors(request, { ok: true, revision, items: await syncItems(db, syncId) });
  }

  if (request.method !== "POST") {
    return jsonCors(request, { ok: false, error: "Method not allowed" }, { status: 405 });
  }

  let body;
  try {
    body = await request.json();
  } catch (_) {
    return jsonCors(request, { ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const syncId = body && body.syncId;
  if (!validSyncId(syncId)) return jsonCors(request, { ok: false, error: "Invalid syncId" }, { status: 400 });
  const incoming = Array.isArray(body.items) ? body.items.filter(validSyncItem).slice(0, 5000) : [];
  let revision = await syncRevision(db, syncId);

  let wrote = false;
  if (incoming.length) {
    for (const item of incoming) {
      const existing = await db
        .prepare("SELECT updated_at FROM sync_items WHERE sync_id = ? AND store_name = ? AND item_id = ?")
        .bind(syncId, item.store, item.id)
        .first();
      if (existing && Number(existing.updated_at || 0) >= Number(item.updatedAt || 0)) continue;
      if (!wrote) {
        revision += 1;
        wrote = true;
        await db
          .prepare("UPDATE sync_meta SET revision = ?, updated_at = ? WHERE sync_id = ?")
          .bind(revision, Date.now(), syncId)
          .run();
      }
      await db
        .prepare(
          "INSERT INTO sync_items(sync_id, store_name, item_id, updated_at, deleted, nonce, payload, changed_rev) VALUES(?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(sync_id, store_name, item_id) DO UPDATE SET updated_at = excluded.updated_at, deleted = excluded.deleted, nonce = excluded.nonce, payload = excluded.payload, changed_rev = excluded.changed_rev"
        )
        .bind(
          syncId,
          item.store,
          item.id,
          Number(item.updatedAt),
          item.deleted ? 1 : 0,
          item.deleted ? "" : item.nonce,
          item.deleted ? "" : item.payload,
          revision
        )
        .run();
    }
  }

  return jsonCors(request, { ok: true, revision, items: await syncItems(db, syncId) });
}

function neteaseHeaders(env) {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    Referer: "https://music.163.com/",
    Accept: "application/json, text/plain, */*",
  };
  const cookie = env && typeof env.NETEASE_COOKIE === "string" ? env.NETEASE_COOKIE.trim() : "";
  if (cookie) headers.Cookie = cookie;
  return headers;
}

function hasNeteaseCookie(env) {
  return !!(env && typeof env.NETEASE_COOKIE === "string" && env.NETEASE_COOKIE.trim());
}

function artistNames(list) {
  return (Array.isArray(list) ? list : [])
    .map((item) => item && item.name)
    .filter(Boolean)
    .join(" / ");
}

function normalizeNeteaseSong(song) {
  const album = song && (song.album || song.al || {});
  return {
    id: String((song && song.id) || ""),
    name: (song && song.name) || "",
    artist: artistNames((song && (song.artists || song.ar)) || []),
    album: album.name || "",
    pic: album.picUrl || "",
  };
}

async function fetchNeteaseJson(path, env) {
  const upstream = await fetch(NETEASE_API + path, {
    headers: neteaseHeaders(env),
    redirect: "follow",
  });
  const text = await upstream.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch (_) {
    body = { raw: text };
  }
  return { upstream, body };
}

async function fetchNeteaseText(target, env, init = {}) {
  const upstream = await fetch(target, {
    ...init,
    headers: {
      ...neteaseHeaders(env),
      ...(init.headers || {}),
    },
    redirect: "follow",
  });
  const text = await upstream.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch (_) {
    body = { raw: text };
  }
  return { upstream, body, text };
}

function normalizePlaylist(pl) {
  return {
    id: String((pl && pl.id) || ""),
    name: (pl && pl.name) || "",
    description: (pl && pl.description) || "",
    coverImgUrl: (pl && pl.coverImgUrl) || "",
    trackCount: Number((pl && pl.trackCount) || 0),
    subscribed: !!(pl && pl.subscribed),
  };
}

function normalizeTrack(song) {
  const album = song && (song.al || song.album || {});
  return {
    id: String((song && song.id) || ""),
    name: (song && song.name) || "",
    artist: artistNames((song && (song.ar || song.artists)) || []),
    album: album.name || "",
    pic: album.picUrl || "",
  };
}

function csrfFromCookie(env) {
  const cookie = env && typeof env.NETEASE_COOKIE === "string" ? env.NETEASE_COOKIE : "";
  const m = cookie.match(/(?:^|;\s*)__csrf=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}

async function handleNetease(request, env) {
  const url = new URL(request.url);
  if (request.method !== "GET") {
    return jsonCors(request, { ok: false, error: "Method not allowed" }, { status: 405 });
  }

  if (url.pathname === "/netease/search") {
    const q = (url.searchParams.get("q") || "").trim().slice(0, 80);
    if (!q) return jsonCors(request, { ok: true, songs: [] });
    const limit = Math.max(1, Math.min(20, Number(url.searchParams.get("limit")) || 10));
    const { body } = await fetchNeteaseJson(
      `/api/search/get?s=${encodeURIComponent(q)}&type=1&limit=${limit}`,
      env
    );
    const songs = (((body || {}).result || {}).songs || []).map(normalizeNeteaseSong).filter((s) => s.id);
    return jsonCors(request, { ok: true, songs });
  }

  if (url.pathname === "/api/music/search") {
    const q = (url.searchParams.get("q") || "").trim().slice(0, 80);
    if (!q) return jsonCors(request, []);
    const limit = Math.max(1, Math.min(30, Number(url.searchParams.get("limit")) || 10));
    const { body } = await fetchNeteaseJson(
      `/api/search/get?s=${encodeURIComponent(q)}&type=1&limit=${limit}`,
      env
    );
    const songs = (((body || {}).result || {}).songs || []).map(normalizeNeteaseSong).filter((s) => s.id);
    return jsonCors(request, songs);
  }

  if (url.pathname === "/netease/detail") {
    const id = (url.searchParams.get("id") || "").replace(/[^\d]/g, "");
    if (!id) return jsonCors(request, { ok: false, error: "Missing id" }, { status: 400 });
    const { body } = await fetchNeteaseJson(`/api/song/detail?ids=%5B${id}%5D`, env);
    const song = (((body || {}).songs || [])[0] && normalizeNeteaseSong(((body || {}).songs || [])[0])) || null;
    return jsonCors(request, { ok: true, song });
  }

  if (url.pathname === "/netease/url") {
    const id = (url.searchParams.get("id") || "").replace(/[^\d]/g, "");
    if (!id) return jsonCors(request, { ok: false, error: "Missing id" }, { status: 400 });
    const { body } = await fetchNeteaseJson(
      `/api/song/enhance/player/url?id=${id}&ids=%5B${id}%5D&br=320000`,
      env
    );
    const item = ((body || {}).data || [])[0] || {};
    const playUrl = item.url ? String(item.url).replace(/^http:\/\//i, "https://") : "";
    return jsonCors(request, {
      ok: !!playUrl,
      url: playUrl,
      code: item.code || 0,
      message: playUrl ? "" : "当前歌曲暂无可用播放源",
    });
  }

  if (url.pathname === "/api/music/url") {
    const id = (url.searchParams.get("id") || "").replace(/[^\d]/g, "");
    if (!id) return jsonCors(request, { error: "missing id" }, { status: 400 });
    const { body } = await fetchNeteaseJson(
      `/api/song/enhance/player/url?id=${id}&ids=%5B${id}%5D&br=320000`,
      env
    );
    const item = ((body || {}).data || [])[0] || {};
    const playUrl = item.url ? String(item.url).replace(/^http:\/\//i, "https://") : "";
    return jsonCors(request, {
      url: playUrl || null,
      code: item.code || 0,
      message: playUrl ? "" : "当前歌曲暂无可用播放源",
    });
  }

  if (url.pathname === "/netease/lyric") {
    const id = (url.searchParams.get("id") || "").replace(/[^\d]/g, "");
    if (!id) return jsonCors(request, { ok: false, error: "Missing id" }, { status: 400 });
    const { body } = await fetchNeteaseJson(`/api/song/lyric?id=${id}&lv=1&kv=1&tv=-1`, env);
    return jsonCors(request, {
      ok: true,
      lyric: (((body || {}).lrc || {}).lyric || ""),
      tlyric: (((body || {}).tlyric || {}).lyric || ""),
    });
  }

  if (url.pathname === "/api/music/lyric") {
    const id = (url.searchParams.get("id") || "").replace(/[^\d]/g, "");
    if (!id) return jsonCors(request, { error: "missing id" }, { status: 400 });
    const { body } = await fetchNeteaseJson(`/api/song/lyric?id=${id}&lv=1&kv=1&tv=-1`, env);
    return jsonCors(request, {
      lyric: (((body || {}).lrc || {}).lyric || ""),
      tlyric: (((body || {}).tlyric || {}).lyric || ""),
    });
  }

  if (url.pathname === "/api/music/proxy") {
    const raw = url.searchParams.get("url") || "";
    let target;
    try {
      target = new URL(raw);
    } catch (_) {
      return withCors(request, "missing url", { status: 400 });
    }
    if (!/^https?:$/.test(target.protocol) || !/music\.126\.net$|music\.163\.com$/i.test(target.hostname)) {
      return withCors(request, "audio host is not allowed", { status: 403 });
    }
    const audioHeaders = {
      "User-Agent": neteaseHeaders(env)["User-Agent"],
      Referer: "https://music.163.com/",
    };
    const range = request.headers.get("Range");
    if (range) audioHeaders.Range = range;
    const upstream = await fetch(target.toString(), {
      headers: audioHeaders,
    });
    const headers = filteredResponseHeaders(upstream, request);
    headers.set("Content-Type", upstream.headers.get("Content-Type") || "audio/mpeg");
    headers.set("Accept-Ranges", upstream.headers.get("Accept-Ranges") || "bytes");
    return new Response(upstream.body, { status: upstream.status, headers });
  }

  if (url.pathname === "/api/netease/account") {
    if (!hasNeteaseCookie(env)) return jsonCors(request, { ok: false, error: "NETEASE_COOKIE is not configured" }, { status: 401 });
    const { body } = await fetchNeteaseText(`${NETEASE_API}/api/nuser/account/get`, env);
    const profile = (body && (body.profile || (body.account && body.account.profile))) || null;
    return jsonCors(request, { ok: !!profile, profile });
  }

  if (url.pathname === "/api/netease/playlists") {
    if (!hasNeteaseCookie(env)) return jsonCors(request, { ok: false, error: "NETEASE_COOKIE is not configured" }, { status: 401 });
    const uid = (url.searchParams.get("uid") || "").replace(/[^\d]/g, "");
    let realUid = uid;
    if (!realUid) {
      const acc = await fetchNeteaseText(`${NETEASE_API}/api/nuser/account/get`, env);
      realUid = String(((acc.body || {}).profile || {}).userId || "");
    }
    if (!realUid) return jsonCors(request, { ok: false, error: "NetEase account is not logged in" }, { status: 401 });
    const { body } = await fetchNeteaseJson(`/api/user/playlist?uid=${realUid}&limit=1000&offset=0`, env);
    const playlists = ((body || {}).playlist || []).map(normalizePlaylist).filter((p) => p.id);
    return jsonCors(request, { ok: true, uid: realUid, playlists });
  }

  if (url.pathname === "/api/netease/playlist/detail") {
    if (!hasNeteaseCookie(env)) return jsonCors(request, { ok: false, error: "NETEASE_COOKIE is not configured" }, { status: 401 });
    const id = (url.searchParams.get("id") || "").replace(/[^\d]/g, "");
    if (!id) return jsonCors(request, { ok: false, error: "missing id" }, { status: 400 });
    const { body } = await fetchNeteaseJson(`/api/v6/playlist/detail?id=${id}&n=1000&s=0`, env);
    const playlist = normalizePlaylist((body || {}).playlist || {});
    const tracks = ((((body || {}).playlist || {}).tracks) || []).map(normalizeTrack).filter((s) => s.id);
    return jsonCors(request, { ok: true, playlist, tracks });
  }

  if (url.pathname === "/api/netease/likelist") {
    if (!hasNeteaseCookie(env)) return jsonCors(request, { ok: false, error: "NETEASE_COOKIE is not configured" }, { status: 401 });
    const uid = (url.searchParams.get("uid") || "").replace(/[^\d]/g, "");
    let realUid = uid;
    if (!realUid) {
      const acc = await fetchNeteaseText(`${NETEASE_API}/api/nuser/account/get`, env);
      realUid = String(((acc.body || {}).profile || {}).userId || "");
    }
    if (!realUid) return jsonCors(request, { ok: false, error: "NetEase account is not logged in" }, { status: 401 });
    const { body } = await fetchNeteaseJson(`/api/song/like/get?uid=${realUid}`, env);
    return jsonCors(request, { ok: true, ids: ((body || {}).ids || []).map(String) });
  }

  if (url.pathname === "/api/netease/like") {
    if (!hasNeteaseCookie(env)) return jsonCors(request, { ok: false, error: "NETEASE_COOKIE is not configured" }, { status: 401 });
    const id = (url.searchParams.get("id") || "").replace(/[^\d]/g, "");
    const like = url.searchParams.get("like") !== "false";
    if (!id) return jsonCors(request, { ok: false, error: "missing id" }, { status: 400 });
    const csrf = csrfFromCookie(env);
    const target = `${NETEASE_API}/api/radio/like?alg=itembased&trackId=${id}&like=${like}&time=25&csrf_token=${encodeURIComponent(csrf)}`;
    const { upstream, body } = await fetchNeteaseText(target, env, { method: "POST" });
    return jsonCors(request, { ok: upstream.ok, body, status: upstream.status }, { status: upstream.ok ? 200 : upstream.status });
  }

  return jsonCors(request, { ok: false, error: "Not found" }, { status: 404 });
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
  async fetch(request, env) {
    try {
      if (request.method === "OPTIONS") {
        return withCors(request, null, { status: 204 });
      }
      const url = new URL(request.url);
      if (url.pathname.startsWith("/sync/v1/")) {
        return handleSync(request, env);
      }
      if (
        url.pathname.startsWith("/netease/") ||
        url.pathname.startsWith("/api/music/") ||
        url.pathname.startsWith("/api/netease/")
      ) {
        return handleNetease(request, env);
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
        redirect: "manual",
      });

      return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: filteredResponseHeaders(upstream, request),
      });
    } catch (error) {
      console.error("Worker request failed", {
        path: new URL(request.url).pathname,
        message: error && error.message ? error.message : String(error),
      });
      return jsonCors(
        request,
        {
          ok: false,
          error: "Worker request failed",
          message: error && error.message ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  },
};
