# InternalBeyond-Mobile MCP CORS Proxy

Cloudflare Worker for forwarding MCP requests from InternalBeyond-Mobile to allowed MCP hosts.

Allowed targets:

- `https://gwmcp.lkcoffee.com/order/user/mcp`
- `https://mcp.mcd.cn`

Frontend proxy value:

```text
https://round-recipe-ea1b.hujinjin0817.workers.dev/?u=
```

Deploy:

```bash
npx wrangler deploy
```

Do not put MCP tokens or AI API keys in this Worker. The app sends `Authorization` at request time and the Worker only forwards it.

