const WORKER = process.env.WORKER_URL || "https://round-recipe-ea1b.hujinjin0817.workers.dev";
const ORIGIN = "https://hujinjin0817-cmyk.github.io";

async function check(name, fn) {
  try {
    const result = await fn();
    console.log(`${name}:`, result);
  } catch (error) {
    console.error(`${name}: FAILED`, error);
    process.exitCode = 1;
  }
}

await check("health", async () => {
  const res = await fetch(WORKER);
  return `${res.status} ${await res.text()}`;
});

await check("cors preflight", async () => {
  const url = `${WORKER}/?u=${encodeURIComponent("https://gwmcp.lkcoffee.com/order/user/mcp")}`;
  const res = await fetch(url, {
    method: "OPTIONS",
    headers: {
      Origin: ORIGIN,
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "authorization,content-type,accept,mcp-session-id,last-event-id",
    },
  });
  return `${res.status} allow-origin=${res.headers.get("access-control-allow-origin")} allow-headers=${res.headers.get("access-control-allow-headers")}`;
});

for (const [name, target] of [
  ["luckin", "https://gwmcp.lkcoffee.com/order/user/mcp"],
  ["mcd", "https://mcp.mcd.cn"],
]) {
  await check(name, async () => {
    const url = `${WORKER}/?u=${encodeURIComponent(target)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Origin: ORIGIN,
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method: "initialize",
        params: {
          protocolVersion: "2025-06-18",
          capabilities: {},
          clientInfo: { name: "InternalBeyond-Mobile-proxy-test", version: "1" },
        },
      }),
    });
    const text = await res.text();
    return `${res.status} ${text.slice(0, 180).replace(/\s+/g, " ")}`;
  });
}

await check("allowlist", async () => {
  const url = `${WORKER}/?u=${encodeURIComponent("https://example.com/")}`;
  const res = await fetch(url, { method: "GET", headers: { Origin: ORIGIN } });
  return `${res.status} ${await res.text()}`;
});

