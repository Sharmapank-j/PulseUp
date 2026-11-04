/**
 * Netlify Serverless Function: AI Gateway & Reverse Proxy
 * Eliminates browser HTTP vs HTTPS Mixed Content blocking and CORS preflight failures
 * for remote AI endpoints (Groq, OpenRouter, DeepSeek, OpenAI, Together, and remote HTTP VPS).
 */

export async function handler(event, context) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Target-URL',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: { message: 'Method Not Allowed. Use POST.' } }),
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const { endpoint, method = 'POST', headers = {}, body } = payload;

    if (!endpoint) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: {
            message: 'Missing "endpoint" parameter in proxy request payload.',
            code: 'ERR_PROXY_MISSING_ENDPOINT',
          },
        }),
      };
    }

    // Safety guard: reject attempts to proxy to private local addresses from cloud serverless
    // (Netlify Lambda loopback cannot reach user's local machine)
    const isLocalAddress = /^(https?:\/\/)?(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/i.test(endpoint);
    if (isLocalAddress) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: {
            message: 'Cloud serverless proxy cannot reach your private laptop loopback (localhost/127.0.0.1). For local models (Ollama/LM Studio), run PulseUp locally (`npm run dev`) or expose via an HTTPS tunnel (`cloudflared tunnel` / `npx untun`).',
            code: 'ERR_CLOUD_CANNOT_REACH_LOCAL',
          },
        }),
      };
    }

    // Sanitize headers: remove host/origin headers that could conflict
    const forwardHeaders = { ...headers };
    delete forwardHeaders['host'];
    delete forwardHeaders['connection'];
    delete forwardHeaders['content-length'];

    // Forward request from serverless environment (Node.js 18+ global fetch)
    const upstreamRes = await fetch(endpoint, {
      method,
      headers: forwardHeaders,
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    });

    const responseText = await upstreamRes.text();

    return {
      statusCode: upstreamRes.status,
      headers: {
        'Content-Type': upstreamRes.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: responseText,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: {
          message: `Netlify AI Gateway Error: ${err.message}`,
          code: 'ERR_PROXY_GATEWAY_FAILURE',
        },
      }),
    };
  }
}
