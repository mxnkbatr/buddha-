import { NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * Edge WebSocket Handler
 * NOTE: Native WebSocket Server support on serverless platforms (Vercel) requires 
 * specific configurations or integrations (like Pusher, Ably, or Cloudflare Workers WebSocketPairs).
 * 
 * If deploying to Cloudflare, the WebSocketPair API will automatically upgrade this connection.
 * If deploying to Vercel, Vercel natively does NOT support persistent WebSocket connections on Edge.
 * In a pure Vercel environment, you would use a 3rd party service (Pusher/Ably) and connect there.
 */
export function GET(request: Request) {
  const upgradeHeader = request.headers.get("Upgrade");
  
  if (!upgradeHeader || upgradeHeader.toLowerCase() !== "websocket") {
    // Return standard 426 Upgrade Required for HTTP requests to this route
    return new Response("This endpoint requires a WebSocket upgrade.", { status: 426 });
  }

  try {
    // Check if the runtime supports WebSockets natively (e.g. Cloudflare / Deno)
    if (typeof (globalThis as any).WebSocketPair !== 'undefined') {
      const { 0: client, 1: server } = new (globalThis as any).WebSocketPair();

      server.accept();

      server.addEventListener("message", (event: any) => {
        try {
          const data = JSON.parse(event.data);
          // In a real environment, you would use a PubSub (like Redis) to broadcast.
          // Since Edge functions are stateless, direct WS broadcasting only reaches clients on this specific edge node.
          console.log("[WS] Message received on Edge:", data);

          // Echo back as proof of connection
          // You shoud connect Ably / Pusher here if needed for global state.
          server.send(JSON.stringify({
            type: 'system',
            message: 'Message registered on edge node.'
          }));
        } catch (e) {
          console.error("WS Parse Error", e);
        }
      });

      return new Response(null, {
        status: 101,
        webSocket: client,
      } as any);
    } else {
      // For Node.js / Default Vercel development fallback
      return new Response(
        JSON.stringify({ 
          error: "WebSocketPair not supported on this specific Edge runtime." 
        }), 
        { status: 501, headers: { 'Content-Type': 'application/json'} }
      );
    }
  } catch (error) {
    console.error("WebSocket Upgrade Error:", error);
    return new Response("WebSocket connection failed", { status: 500 });
  }
}
